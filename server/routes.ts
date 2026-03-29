import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCharacterSchema } from "@shared/schema";
import { z } from "zod";

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
  app.get("/api/characters", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const characters = await storage.getCharacters(userId);
      res.json(characters);
    } catch (error) {
      console.error("Error fetching characters:", error);
      res.status(500).json({ error: "Failed to fetch characters" });
    }
  });

  app.get("/api/characters/:id", isAuthenticated, async (req: any, res) => {
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

  app.post("/api/characters", isAuthenticated, async (req: any, res) => {
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

  app.patch("/api/characters/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const character = await storage.updateCharacter(req.params.id, userId, req.body);
      if (!character) {
        return res.status(404).json({ error: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      console.error("Error updating character:", error);
      res.status(500).json({ error: "Failed to update character" });
    }
  });

  app.delete("/api/characters/:id", isAuthenticated, async (req: any, res) => {
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

  app.get("/api/characters/:id/share", isAuthenticated, async (req: any, res) => {
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

  app.post("/api/characters/:id/share", isAuthenticated, async (req: any, res) => {
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

  app.delete("/api/characters/:id/share", isAuthenticated, async (req: any, res) => {
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

  app.get("/api/shared/:token", async (req, res) => {
    try {
      const character = await storage.getCharacterByShareToken(req.params.token);
      if (!character) {
        return res.status(404).json({ error: "Shared character not found" });
      }
      const { userId: _userId, ...safeCharacter } = character;
      res.json(safeCharacter);
    } catch (error) {
      console.error("Error fetching shared character:", error);
      res.status(500).json({ error: "Failed to fetch shared character" });
    }
  });

  return httpServer;
}
