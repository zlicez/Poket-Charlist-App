/**
 * Google OAuth 2.0 auth module.
 * Active when LOCAL_DEV is NOT set.
 * Requires: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_SECRET, DATABASE_URL
 */
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express, RequestHandler } from "express";
import { db } from "./db";
import { users, type UpsertUser } from "@shared/models/auth";
import { eq } from "drizzle-orm";

// ── Auth storage (inlined from deleted replit_integrations/auth/storage.ts) ──

async function getUser(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

async function upsertUser(userData: UpsertUser) {
  const [user] = await db
    .insert(users)
    .values(userData)
    .onConflictDoUpdate({
      target: users.id,
      set: { ...userData, updatedAt: new Date() },
    })
    .returning();
  return user;
}

// ── Session ──────────────────────────────────────────────────────────────────

function buildSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
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
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

// ── Passport serialization ───────────────────────────────────────────────────

passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));

// ── setupAuth ────────────────────────────────────────────────────────────────

export async function setupAuth(app: Express): Promise<void> {
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
          const email = profile.emails?.[0]?.value;
          const photo = profile.photos?.[0]?.value;

          await upsertUser({
            id: profile.id,
            email,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            profileImageUrl: photo,
          });

          // Wrap in the same shape routes.ts expects: req.user.claims.sub
          done(null, { claims: { sub: profile.id } });
        } catch (err) {
          done(err as Error);
        }
      }
    )
  );
}

// ── isAuthenticated ──────────────────────────────────────────────────────────

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Unauthorized" });
};

// ── registerAuthRoutes ───────────────────────────────────────────────────────

export function registerAuthRoutes(app: Express): void {
  app.get("/api/login", passport.authenticate("google", {
    scope: ["openid", "email", "profile"],
  }));

  app.get("/api/callback", passport.authenticate("google", {
    failureRedirect: "/api/login",
    successRedirect: "/",
  }));

  app.get("/api/logout", (req: any, res) => {
    req.logout(() => res.redirect("/api/login"));
  });

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const user = await getUser(req.user.claims.sub);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
