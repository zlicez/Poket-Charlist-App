import passport from "passport";
import { Strategy as GoogleStrategy, type Profile } from "passport-google-oauth20";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express, RequestHandler, Request, Response } from "express";
import { eq, sql } from "drizzle-orm";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { db } from "./db";
import { users, type AuthUser, type DbUser, type UpsertUser } from "@shared/models/auth";
import { hashPassword, normalizeEmail, verifyPassword } from "./password";

type SessionUser = {
  claims: {
    sub: string;
  };
};

const sessionTtl = 7 * 24 * 60 * 60 * 1000;

const loginSchema = z.object({
  email: z.string().trim().email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль"),
});

const registerSchema = z.object({
  email: z.string().trim().email("Введите корректный email"),
  password: z.string().min(8, "Пароль должен быть не короче 8 символов").max(128, "Пароль слишком длинный"),
  confirmPassword: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Пароли не совпадают",
      path: ["confirmPassword"],
    });
  }
});

const passwordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "Пароль должен быть не короче 8 символов").max(128, "Пароль слишком длинный"),
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Слишком много попыток авторизации. Попробуйте позже." },
});

function buildSession() {
  const PgStore = connectPg(session);
  return session({
    secret: process.env.SESSION_SECRET!,
    store: new PgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      ttl: sessionTtl,
      tableName: "sessions",
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      maxAge: sessionTtl,
    },
  });
}

passport.serializeUser((user: Express.User, done) => done(null, user));
passport.deserializeUser((user: Express.User, done) => done(null, user));

async function ensureUserAuthColumns() {
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id varchar`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash varchar`);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS users_google_id_unique
    ON users (google_id)
    WHERE google_id IS NOT NULL
  `);
}

async function backfillLegacyGoogleUsers() {
  await db.execute(sql`
    UPDATE users
    SET google_id = id, updated_at = NOW()
    WHERE google_id IS NULL AND password_hash IS NULL
  `);
}

async function getUserById(id: string): Promise<DbUser | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

async function getUserByEmail(email: string): Promise<DbUser | undefined> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

async function getUserByGoogleId(googleId: string): Promise<DbUser | undefined> {
  const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
  return user;
}

async function createUser(userData: UpsertUser): Promise<DbUser> {
  const [user] = await db.insert(users).values(userData).returning();
  return user;
}

async function updateUser(id: string, userData: Partial<UpsertUser>): Promise<DbUser> {
  const [user] = await db
    .update(users)
    .set({ ...userData, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return user;
}

function toAuthUser(user: DbUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    profileImageUrl: user.profileImageUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    hasPassword: Boolean(user.passwordHash),
    hasGoogle: Boolean(user.googleId),
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? fallback;
  }

  if (typeof error === "object" && error && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return fallback;
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object"
    && error !== null
    && "code" in error
    && (error as { code?: string }).code === "23505";
}

function sendError(res: Response, status: number, message: string) {
  return res.status(status).json({ message });
}

async function logInUser(req: Request, userId: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    req.login({ claims: { sub: userId } }, (error: unknown) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

async function syncGoogleUser(profile: Profile): Promise<DbUser> {
  const rawEmail = profile.emails?.[0]?.value;
  if (!rawEmail) {
    throw new Error("Google не вернул email для этого аккаунта");
  }

  const email = normalizeEmail(rawEmail);
  const googleId = profile.id;
  const photo = profile.photos?.[0]?.value ?? null;
  const firstName = profile.name?.givenName ?? null;
  const lastName = profile.name?.familyName ?? null;

  const existingByGoogle = await getUserByGoogleId(googleId);
  const existingByEmail = await getUserByEmail(email);

  if (existingByGoogle) {
    if (existingByEmail && existingByEmail.id !== existingByGoogle.id) {
      throw new Error("Этот Google-аккаунт уже конфликтует с другим email-аккаунтом");
    }

    return updateUser(existingByGoogle.id, {
      email,
      firstName,
      lastName,
      profileImageUrl: photo,
      googleId,
    });
  }

  if (existingByEmail) {
    return updateUser(existingByEmail.id, {
      firstName: firstName ?? existingByEmail.firstName,
      lastName: lastName ?? existingByEmail.lastName,
      profileImageUrl: photo ?? existingByEmail.profileImageUrl,
      googleId,
    });
  }

  try {
    return await createUser({
      email,
      firstName,
      lastName,
      profileImageUrl: photo,
      googleId,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      const linkedUser = await getUserByGoogleId(googleId);
      if (linkedUser) {
        return linkedUser;
      }
    }

    throw error;
  }
}

export async function setupAuth(app: Express): Promise<void> {
  await ensureUserAuthColumns();
  await backfillLegacyGoogleUsers();

  app.set("trust proxy", 1);
  app.use(buildSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: "/api/callback",
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await syncGoogleUser(profile);
          done(null, { claims: { sub: user.id } });
        } catch (error) {
          done(error as Error);
        }
      },
    ),
  );
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({ message: "Unauthorized" });
};

export function registerAuthRoutes(app: Express): void {
  app.get("/api/login", passport.authenticate("google", {
    scope: ["openid", "email", "profile"],
  }));

  app.get("/api/callback", passport.authenticate("google", {
    failureRedirect: "/",
    successRedirect: "/",
  }));

  app.get("/api/logout", (req: Request, res) => {
    req.logout((error) => {
      if (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ message: "Не удалось выйти из аккаунта" });
      }

      if (!req.session) {
        res.redirect("/");
        return;
      }

      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.redirect("/");
      });
    });
  });

  app.post("/api/auth/register", authLimiter, async (req: Request, res) => {
    try {
      const input = registerSchema.parse(req.body);
      const email = normalizeEmail(input.email);
      const existingUser = await getUserByEmail(email);

      if (existingUser) {
        if (!existingUser.passwordHash && existingUser.googleId) {
          return sendError(
            res,
            409,
            "Этот email уже связан с Google-входом. Войдите через Google и задайте пароль в аккаунте.",
          );
        }

        return sendError(res, 409, "Аккаунт с таким email уже существует");
      }

      const passwordHash = await hashPassword(input.password);
      const user = await createUser({ email, passwordHash });
      await logInUser(req, user.id);

      return res.status(201).json(toAuthUser(user));
    } catch (error) {
      if (isUniqueViolation(error)) {
        return sendError(res, 409, "Аккаунт с таким email уже существует");
      }

      console.error("Register error:", error);
      return sendError(res, 400, getErrorMessage(error, "Не удалось создать аккаунт"));
    }
  });

  app.post("/api/auth/login", authLimiter, async (req: Request, res) => {
    try {
      const input = loginSchema.parse(req.body);
      const email = normalizeEmail(input.email);
      const user = await getUserByEmail(email);

      if (!user) {
        return sendError(res, 401, "Неверный email или пароль");
      }

      if (!user.passwordHash) {
        return sendError(res, 401, "Для этого аккаунта используйте вход через Google");
      }

      const isPasswordValid = await verifyPassword(input.password, user.passwordHash);
      if (!isPasswordValid) {
        return sendError(res, 401, "Неверный email или пароль");
      }

      await logInUser(req, user.id);
      return res.json(toAuthUser(user));
    } catch (error) {
      console.error("Login error:", error);
      return sendError(res, 400, getErrorMessage(error, "Не удалось выполнить вход"));
    }
  });

  app.post("/api/auth/password", authLimiter, isAuthenticated, async (req: Request, res) => {
    try {
      const input = passwordSchema.parse(req.body);
      const currentUser = req.user as SessionUser;
      const user = await getUserById(currentUser.claims.sub);

      if (!user) {
        return sendError(res, 404, "Пользователь не найден");
      }

      if (user.passwordHash) {
        if (!input.currentPassword) {
          return sendError(res, 400, "Введите текущий пароль");
        }

        const isCurrentPasswordValid = await verifyPassword(input.currentPassword, user.passwordHash);
        if (!isCurrentPasswordValid) {
          return sendError(res, 401, "Текущий пароль указан неверно");
        }
      }

      const passwordHash = await hashPassword(input.newPassword);
      const updatedUser = await updateUser(user.id, { passwordHash });
      return res.json(toAuthUser(updatedUser));
    } catch (error) {
      console.error("Password update error:", error);
      return sendError(res, 400, getErrorMessage(error, "Не удалось обновить пароль"));
    }
  });

  app.get("/api/auth/user", isAuthenticated, async (req: Request, res) => {
    try {
      const currentUser = req.user as SessionUser;
      const user = await getUserById(currentUser.claims.sub);
      if (!user) {
        return sendError(res, 404, "Пользователь не найден");
      }

      return res.json(toAuthUser(user));
    } catch (error) {
      console.error("Error fetching user:", error);
      return sendError(res, 500, "Не удалось получить профиль");
    }
  });
}
