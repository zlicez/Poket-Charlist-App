/**
 * Local development auth — bypasses Replit OIDC.
 * Active when LOCAL_DEV=true. Never use in production.
 */
import session from "express-session";
import memorystore from "memorystore";
import type { Express, RequestHandler } from "express";
import type { User } from "@shared/models/auth";
import { AUTH_PATHS } from "@shared/constants";

const LOCAL_USER_ID = "local-dev-user";

const LOCAL_USER: User = {
  id: LOCAL_USER_ID,
  email: "local@dev.local",
  firstName: "Local",
  lastName: "Dev",
  profileImageUrl: null,
  createdAt: null,
  updatedAt: null,
  hasPassword: true,
  hasGoogle: false,
};

export async function setupAuth(app: Express): Promise<void> {
  const MemoryStore = memorystore(session);
  app.use(
    session({
      secret: "local-dev-secret-do-not-use-in-production",
      store: new MemoryStore({ checkPeriod: 86400000 }),
      resave: false,
      saveUninitialized: false,
      cookie: { httpOnly: true, secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 },
    })
  );

  // Auto-login: visiting AUTH_PATHS.oauthLogin sets session and redirects home
  app.get(AUTH_PATHS.oauthLogin, (req: any, res) => {
    req.session.userId = LOCAL_USER_ID;
    res.redirect("/");
  });

  app.post(AUTH_PATHS.logout, (req: any, res) => {
    if (!req.session) {
      return res.json({ ok: true });
    }

    req.session.destroy(() => res.json({ ok: true }));
  });

  app.get(AUTH_PATHS.oauthCallback, (_req, res) => res.redirect("/"));
}

export const isAuthenticated: RequestHandler = (req: any, res, next) => {
  // Auto-inject local user so the app never shows a login wall
  req.user = { claims: { sub: LOCAL_USER_ID } };
  next();
};

export function registerAuthRoutes(app: Express): void {
  app.get(AUTH_PATHS.user, isAuthenticated, (_req, res) => {
    res.json(LOCAL_USER);
  });

  app.post(AUTH_PATHS.login, (_req, res) => {
    res.json(LOCAL_USER);
  });

  app.post(AUTH_PATHS.register, (_req, res) => {
    res.status(201).json(LOCAL_USER);
  });

  app.post(AUTH_PATHS.password, (_req, res) => {
    res.json(LOCAL_USER);
  });
}
