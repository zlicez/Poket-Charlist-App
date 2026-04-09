import type { Express } from "express";
import { createServer, type Server } from "http";
import { rateLimit } from "express-rate-limit";
import { storage } from "./storage";
import { insertCharacterSchema, publicCharacterSchema, characterSchema } from "@shared/schema";
import { z } from "zod";

// Authenticated routes: key by userId so each account gets 120 req/min
const apiLimiter = rateLimit({
  windowMs: 60_000,
  max: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  // Authenticated requests always have a userId — no IP fallback needed
  skip: (req: any) => !req.user?.claims?.sub,
  keyGenerator: (req: any) => req.user.claims.sub as string,
  message: { error: "Слишком много запросов, попробуйте позже" },
});

// Public endpoint: default IP-based keying (library handles IPv6 correctly)
const sharedLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Слишком много запросов, попробуйте позже" },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Use simple local auth when LOCAL_DEV=true, otherwise Google OAuth
  const { setupAuth, registerAuthRoutes, isAuthenticated } = process.env.LOCAL_DEV
    ? await import("./local-auth")
    : await import("./google-auth");

  // Setup auth BEFORE registering other routes
  await setupAuth(app);
  registerAuthRoutes(app);
  
  // All character routes require authentication
  app.get("/api/characters", apiLimiter, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const characters = await storage.getCharacters(userId);
      res.json(characters);
    } catch (error) {
      console.error("Error fetching characters:", error);
      res.status(500).json({ error: "Failed to fetch characters" });
    }
  });

  app.get("/api/characters/:id", apiLimiter, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const character = await storage.getCharacter(req.params.id, userId);
      if (!character) {
        return res.status(404).json({ error: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      console.error("Error fetching character:", error);
      res.status(500).json({ error: "Failed to fetch character" });
    }
  });

  app.post("/api/characters", apiLimiter, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertCharacterSchema.parse(req.body);
      const character = await storage.createCharacter(validatedData, userId);
      res.status(201).json(character);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid character data", details: error.errors });
      }
      console.error("Error creating character:", error);
      res.status(500).json({ error: "Failed to create character" });
    }
  });

  app.patch("/api/characters/:id", apiLimiter, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = characterSchema.partial().parse(req.body);
      const character = await storage.updateCharacter(req.params.id, userId, validated);
      if (!character) {
        return res.status(404).json({ error: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid character data", details: error.errors });
      }
      console.error("Error updating character:", error);
      res.status(500).json({ error: "Failed to update character" });
    }
  });

  app.delete("/api/characters/:id", apiLimiter, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deleted = await storage.deleteCharacter(req.params.id, userId);
      if (!deleted) {
        return res.status(404).json({ error: "Character not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting character:", error);
      res.status(500).json({ error: "Failed to delete character" });
    }
  });

  app.get("/api/characters/:id/share", apiLimiter, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const info = await storage.getShareInfo(req.params.id, userId);
      if (!info) {
        return res.status(404).json({ error: "Character not found" });
      }
      res.json(info);
    } catch (error) {
      console.error("Error getting share info:", error);
      res.status(500).json({ error: "Failed to get share info" });
    }
  });

  app.post("/api/characters/:id/share", apiLimiter, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = await storage.enableSharing(req.params.id, userId);
      if (!result) {
        return res.status(404).json({ error: "Character not found" });
      }
      res.json(result);
    } catch (error) {
      console.error("Error enabling sharing:", error);
      res.status(500).json({ error: "Failed to enable sharing" });
    }
  });

  app.delete("/api/characters/:id/share", apiLimiter, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const disabled = await storage.disableSharing(req.params.id, userId);
      if (!disabled) {
        return res.status(404).json({ error: "Character not found" });
      }
      res.json({ isShared: false, shareToken: null });
    } catch (error) {
      console.error("Error disabling sharing:", error);
      res.status(500).json({ error: "Failed to disable sharing" });
    }
  });

  app.get("/api/shared/:token", sharedLimiter, async (req, res) => {
    try {
      const character = await storage.getCharacterByShareToken(req.params.token as string);
      if (!character) {
        return res.status(404).json({ error: "Shared character not found" });
      }
      // Allowlist: Zod strips unknown fields and omits userId + notes.
      // Any future private field must be added to publicCharacterSchema.omit().
      const result = publicCharacterSchema.safeParse(character);
      if (!result.success) {
        console.error("Public character schema validation failed:", result.error);
        return res.status(500).json({ error: "Failed to fetch shared character" });
      }
      res.json(result.data);
    } catch (error) {
      console.error("Error fetching shared character:", error);
      res.status(500).json({ error: "Failed to fetch shared character" });
    }
  });

  return httpServer;
}
