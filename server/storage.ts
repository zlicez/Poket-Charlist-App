import { type Character, type InsertCharacter, DEFAULT_SKILLS_PROFICIENCY, characterSchema, characters } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { deepMerge } from "./deep-merge";

export interface IStorage {
  getCharacters(userId: string): Promise<Character[]>;
  getCharacter(id: string, userId: string): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter, userId: string): Promise<Character>;
  updateCharacter(id: string, userId: string, updates: Partial<Character>): Promise<Character | undefined>;
  deleteCharacter(id: string, userId: string): Promise<boolean>;
  enableSharing(id: string, userId: string): Promise<{ shareToken: string } | undefined>;
  disableSharing(id: string, userId: string): Promise<boolean>;
  getShareInfo(id: string, userId: string): Promise<{ shareToken: string | null; isShared: boolean } | undefined>;
  getCharacterByShareToken(token: string): Promise<Character | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getCharacters(userId: string): Promise<Character[]> {
    const rows = await db.select().from(characters).where(eq(characters.userId, userId));
    return rows.map(row => ({
      id: row.id,
      userId: row.userId,
      ...(row.data as object),
    } as Character));
  }

  async getCharacter(id: string, userId: string): Promise<Character | undefined> {
    const [row] = await db.select().from(characters)
      .where(and(eq(characters.id, id), eq(characters.userId, userId)));
    
    if (!row) return undefined;
    
    return {
      id: row.id,
      userId: row.userId,
      ...(row.data as object),
    } as Character;
  }

  async createCharacter(insertCharacter: InsertCharacter, userId: string): Promise<Character> {
    const characterData = {
      ...insertCharacter,
      skills: insertCharacter.skills || { ...DEFAULT_SKILLS_PROFICIENCY },
    };

    const [row] = await db.insert(characters).values({
      userId,
      name: characterData.name,
      data: characterData,
    }).returning();

    return {
      id: row.id,
      userId: row.userId,
      ...(row.data as object),
    } as Character;
  }

  async updateCharacter(id: string, userId: string, updates: Partial<Character>): Promise<Character | undefined> {
    const existing = await this.getCharacter(id, userId);
    if (!existing) return undefined;

    const { id: _, userId: __, ...updateData } = updates;
    const merged = deepMerge(existing, updateData);
    const validated = characterSchema.safeParse(merged);
    if (!validated.success) {
      console.warn("Merged character failed schema validation:", validated.error.flatten());
    }
    const updated = validated.success ? validated.data : merged;

    const [row] = await db.update(characters)
      .set({ 
        name: updated.name,
        data: updated,
        updatedAt: new Date(),
      })
      .where(and(eq(characters.id, id), eq(characters.userId, userId)))
      .returning();

    if (!row) return undefined;

    return {
      id: row.id,
      userId: row.userId,
      ...(row.data as object),
    } as Character;
  }

  async deleteCharacter(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(characters)
      .where(and(eq(characters.id, id), eq(characters.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async enableSharing(id: string, userId: string): Promise<{ shareToken: string } | undefined> {
    const [row] = await db.select({ shareToken: characters.shareToken, isShared: characters.isShared })
      .from(characters)
      .where(and(eq(characters.id, id), eq(characters.userId, userId)));
    if (!row) return undefined;

    if (row.isShared && row.shareToken) {
      return { shareToken: row.shareToken };
    }

    const token = randomUUID();
    await db.update(characters)
      .set({ shareToken: token, isShared: true })
      .where(and(eq(characters.id, id), eq(characters.userId, userId)));
    return { shareToken: token };
  }

  async disableSharing(id: string, userId: string): Promise<boolean> {
    const result = await db.update(characters)
      .set({ isShared: false, shareToken: null })
      .where(and(eq(characters.id, id), eq(characters.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async getShareInfo(id: string, userId: string): Promise<{ shareToken: string | null; isShared: boolean } | undefined> {
    const [row] = await db.select({ shareToken: characters.shareToken, isShared: characters.isShared })
      .from(characters)
      .where(and(eq(characters.id, id), eq(characters.userId, userId)));
    if (!row) return undefined;
    return { shareToken: row.shareToken, isShared: row.isShared };
  }

  async getCharacterByShareToken(token: string): Promise<Character | undefined> {
    const [row] = await db.select().from(characters)
      .where(and(eq(characters.shareToken, token), eq(characters.isShared, true)));
    if (!row) return undefined;
    return {
      id: row.id,
      userId: row.userId,
      ...(row.data as object),
    } as Character;
  }
}

class MemStorage implements IStorage {
  private chars = new Map<string, Character>();
  private shareTokens = new Map<string, { charId: string; isShared: boolean }>();
  private charTokenMap = new Map<string, string>();

  async getCharacters(userId: string): Promise<Character[]> {
    return Array.from(this.chars.values()).filter(c => c.userId === userId);
  }

  async getCharacter(id: string, userId: string): Promise<Character | undefined> {
    const c = this.chars.get(id);
    return c?.userId === userId ? c : undefined;
  }

  async createCharacter(character: InsertCharacter, userId: string): Promise<Character> {
    const id = randomUUID();
    const newChar = {
      ...character,
      id,
      userId,
      skills: character.skills || { ...DEFAULT_SKILLS_PROFICIENCY },
    } as Character;
    this.chars.set(id, newChar);
    return newChar;
  }

  async updateCharacter(id: string, userId: string, updates: Partial<Character>): Promise<Character | undefined> {
    const existing = await this.getCharacter(id, userId);
    if (!existing) return undefined;
    const { id: _, userId: __, ...updateData } = updates;
    const updated = deepMerge(existing, updateData);
    this.chars.set(id, updated);
    return updated;
  }

  async deleteCharacter(id: string, userId: string): Promise<boolean> {
    const c = this.chars.get(id);
    if (!c || c.userId !== userId) return false;
    this.chars.delete(id);
    const token = this.charTokenMap.get(id);
    if (token) {
      this.shareTokens.delete(token);
      this.charTokenMap.delete(id);
    }
    return true;
  }

  async enableSharing(id: string, userId: string): Promise<{ shareToken: string } | undefined> {
    const c = this.chars.get(id);
    if (!c || c.userId !== userId) return undefined;
    const existingToken = this.charTokenMap.get(id);
    if (existingToken && this.shareTokens.get(existingToken)?.isShared) {
      return { shareToken: existingToken };
    }
    const token = existingToken || randomUUID();
    this.shareTokens.set(token, { charId: id, isShared: true });
    this.charTokenMap.set(id, token);
    return { shareToken: token };
  }

  async disableSharing(id: string, userId: string): Promise<boolean> {
    const c = this.chars.get(id);
    if (!c || c.userId !== userId) return false;
    const token = this.charTokenMap.get(id);
    if (token) {
      this.shareTokens.delete(token);
      this.charTokenMap.delete(id);
    }
    return true;
  }

  async getShareInfo(id: string, userId: string): Promise<{ shareToken: string | null; isShared: boolean } | undefined> {
    const c = this.chars.get(id);
    if (!c || c.userId !== userId) return undefined;
    const token = this.charTokenMap.get(id);
    const info = token ? this.shareTokens.get(token) : undefined;
    return { shareToken: token || null, isShared: info?.isShared || false };
  }

  async getCharacterByShareToken(token: string): Promise<Character | undefined> {
    const info = this.shareTokens.get(token);
    if (!info || !info.isShared) return undefined;
    return this.chars.get(info.charId);
  }
}

export const storage: IStorage = process.env.DATABASE_URL
  ? new DatabaseStorage()
  : new MemStorage();
