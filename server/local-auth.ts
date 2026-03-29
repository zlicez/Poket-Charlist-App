/**
 * Local development auth — bypasses Replit OIDC.
 * Active when LOCAL_DEV=true. Never use in production.
 */
import session from "express-session";
import memorystore from "memorystore";
import type { Express, RequestHandler } from "express";

const LOCAL_USER_ID = "local-dev-user";

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

  // Auto-login: visiting /api/login sets session and redirects home
  app.get("/api/login", (req: any, res) => {
    req.session.userId = LOCAL_USER_ID;
    res.redirect("/");
  });

  app.get("/api/logout", (req: any, res) => {
    req.session.destroy(() => res.redirect("/api/login"));
  });

  app.get("/api/callback", (_req, res) => res.redirect("/"));
}

export const isAuthenticated: RequestHandler = (req: any, res, next) => {
  // Auto-inject local user so the app never shows a login wall
  req.user = { claims: { sub: LOCAL_USER_ID } };
  next();
};

export function registerAuthRoutes(app: Express): void {
  app.get("/api/auth/user", isAuthenticated, (_req, res) => {
    res.json({
      id: LOCAL_USER_ID,
      email: "local@dev.local",
      firstName: "Local",
      lastName: "Dev",
    });
  });
}
