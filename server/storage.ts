import { type Character, type InsertCharacter, DEFAULT_SKILLS_PROFICIENCY, characters } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] !== undefined) {
      const sourceValue = source[key];
      const targetValue = target[key];
      
      if (
        sourceValue !== null &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        (result as any)[key] = deepMerge(targetValue, sourceValue);
      } else {
        (result as any)[key] = sourceValue;
      }
    }
  }
  
  return result;
}

export interface IStorage {
  getCharacters(userId: string): Promise<Character[]>;
  getCharacter(id: string, userId: string): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter, userId: string): Promise<Character>;
  updateCharacter(id: string, userId: string, updates: Partial<Character>): Promise<Character | undefined>;
  deleteCharacter(id: string, userId: string): Promise<boolean>;
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
    const updated = deepMerge(existing, updateData);

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
}

export const storage = new DatabaseStorage();
