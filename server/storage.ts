import {
  type Character,
  type CollectionName,
  type CollectionOp,
  type InsertCharacter,
  DEFAULT_SKILLS_PROFICIENCY,
  characterSchema,
  characters,
  equipmentSchema,
  featureSchema,
  spellSchema,
  weaponSchema,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { type ZodTypeAny } from "zod";
import { deepMerge } from "./deep-merge";

// Результат updateCharacter: явно разделяем три исхода, чтобы route мог
// вернуть правильный HTTP-статус (200 / 409 / 404) без гаданий.
export type UpdateCharacterResult =
  | { status: "ok"; character: Character }
  | { status: "conflict"; current: Character }
  | { status: "notfound" };

// Для applyCollectionOps добавлена ветка "invalid": семантическая ошибка применения
// (ids не совпадают, невалидный item после merge) — 400 на route-уровне.
export type ApplyOpsResult =
  | UpdateCharacterResult
  | { status: "invalid"; reason: string };

export interface IStorage {
  getCharacters(userId: string): Promise<Character[]>;
  getCharacter(id: string, userId: string): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter, userId: string): Promise<Character>;
  updateCharacter(
    id: string,
    userId: string,
    updates: Partial<Character>,
    expectedUpdatedAt?: string,
  ): Promise<UpdateCharacterResult>;
  applyCollectionOps(
    id: string,
    userId: string,
    ops: CollectionOp[],
    expectedUpdatedAt: string,
  ): Promise<ApplyOpsResult>;
  deleteCharacter(id: string, userId: string): Promise<boolean>;
  enableSharing(id: string, userId: string): Promise<{ shareToken: string } | undefined>;
  disableSharing(id: string, userId: string): Promise<boolean>;
  getShareInfo(id: string, userId: string): Promise<{ shareToken: string | null; isShared: boolean } | undefined>;
  getCharacterByShareToken(token: string): Promise<Character | undefined>;
}

// ─── Collection-ops helpers ────────────────────────────────────────────────

type CollectionItem = { id: string } & Record<string, unknown>;

const ITEM_SCHEMAS: Record<CollectionName, ZodTypeAny> = {
  weapons: weaponSchema,
  equipment: equipmentSchema,
  features: featureSchema,
  spells: spellSchema,
};

function getCollectionItems(
  character: Character,
  collection: CollectionName,
): CollectionItem[] {
  if (collection === "spells") {
    return (character.spellcasting?.spells ?? []) as CollectionItem[];
  }
  return (character[collection] ?? []) as CollectionItem[];
}

function setCollectionItems(
  character: Character,
  collection: CollectionName,
  items: CollectionItem[],
): Character {
  if (collection === "spells") {
    if (!character.spellcasting) {
      // Нельзя прикрутить заклинания к не-кастеру через ops — такой сценарий
      // должен прийти full-PATCH'ем (инициализация spellcasting целиком).
      throw new Error("spellcasting is not initialized for this character");
    }
    return {
      ...character,
      spellcasting: { ...character.spellcasting, spells: items as never },
    };
  }
  return { ...character, [collection]: items } as Character;
}

// Применяет батч ops к снапшоту персонажа. Бросает Error с человекочитаемым
// сообщением на любые семантические нарушения (unknown id, schema fail и т.д.).
function applyOpsToCharacter(
  character: Character,
  ops: CollectionOp[],
): Character {
  let working = character;
  for (const op of ops) {
    const items = getCollectionItems(working, op.collection);
    const schema = ITEM_SCHEMAS[op.collection];

    if (op.op === "upsertItem") {
      const idx = items.findIndex((it) => it.id === op.id);
      const base = idx >= 0 ? items[idx] : { id: op.id };
      const merged = { ...base, ...op.patch, id: op.id } as CollectionItem;
      const parsed = schema.safeParse(merged);
      if (!parsed.success) {
        throw new Error(
          `upsertItem on ${op.collection}/${op.id} failed schema validation: ${parsed.error.issues
            .map((i) => `${i.path.join(".")}:${i.message}`)
            .join("; ")}`,
        );
      }
      const next = idx >= 0
        ? items.map((it, i) => (i === idx ? (parsed.data as CollectionItem) : it))
        : [...items, parsed.data as CollectionItem];
      working = setCollectionItems(working, op.collection, next);
    } else if (op.op === "removeItem") {
      const idx = items.findIndex((it) => it.id === op.id);
      if (idx < 0) {
        throw new Error(`removeItem: ${op.collection}/${op.id} not found`);
      }
      working = setCollectionItems(
        working,
        op.collection,
        items.filter((_, i) => i !== idx),
      );
    } else {
      // reorderItems
      const existingIds = items.map((it) => it.id);
      const requestedIds = op.orderedIds;
      const requestedSet = new Set(requestedIds);
      if (
        existingIds.length !== requestedIds.length ||
        existingIds.some((eid) => !requestedSet.has(eid))
      ) {
        throw new Error(
          `reorderItems: orderedIds must be a permutation of existing ids for ${op.collection}`,
        );
      }
      const byId = new Map(items.map((it) => [it.id, it] as const));
      const reordered = op.orderedIds.map((id) => byId.get(id) as CollectionItem);
      working = setCollectionItems(working, op.collection, reordered);
    }
  }
  return working;
}

// Проекция Drizzle-row в возвращаемый клиенту Character.
// updatedAt идёт ПОСЛЕ spread'а data — канонический источник правды один (колонка БД),
// даже если старые записи случайно содержат поле внутри JSONB.
function rowToCharacter(row: {
  id: string;
  userId: string;
  data: unknown;
  updatedAt: Date | null;
}): Character {
  return {
    id: row.id,
    userId: row.userId,
    ...(row.data as object),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : undefined,
  } as Character;
}

export class DatabaseStorage implements IStorage {
  async getCharacters(userId: string): Promise<Character[]> {
    const rows = await db.select().from(characters).where(eq(characters.userId, userId));
    return rows.map(rowToCharacter);
  }

  async getCharacter(id: string, userId: string): Promise<Character | undefined> {
    const [row] = await db.select().from(characters)
      .where(and(eq(characters.id, id), eq(characters.userId, userId)));

    if (!row) return undefined;

    return rowToCharacter(row);
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

    return rowToCharacter(row);
  }

  async updateCharacter(
    id: string,
    userId: string,
    updates: Partial<Character>,
    expectedUpdatedAt?: string,
  ): Promise<UpdateCharacterResult> {
    const existing = await this.getCharacter(id, userId);
    if (!existing) return { status: "notfound" };

    // Optimistic concurrency: клиент передаёт известную ему версию в If-Match
    // (прокидывается сюда как expectedUpdatedAt). Сравнение ISO-строк — DB и
    // client оба округляют Date до миллисекунд на этом пути, совпадут.
    // TOCTOU-окно между getCharacter и db.update небольшое и открывается только
    // при конкурентной записи от одного пользователя; полная атомарность
    // потребует миграции колонки на precision 3 и CAS в WHERE.
    if (expectedUpdatedAt !== undefined && existing.updatedAt !== expectedUpdatedAt) {
      return { status: "conflict", current: existing };
    }

    // updatedAt пишется только сервером — любое значение из тела клиента игнорируется.
    // existing тоже содержит server-side updatedAt (из rowToCharacter); вырезаем его
    // один раз перед merge, чтобы потом ничего не попало в JSONB data.
    const { updatedAt: _exUpd, ...existingData } = existing;
    const { id: _, userId: __, updatedAt: ___, ...updateData } = updates;
    const merged = deepMerge(existingData, updateData);
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

    if (!row) return { status: "notfound" };

    return { status: "ok", character: rowToCharacter(row) };
  }

  async applyCollectionOps(
    id: string,
    userId: string,
    ops: CollectionOp[],
    expectedUpdatedAt: string,
  ): Promise<ApplyOpsResult> {
    const existing = await this.getCharacter(id, userId);
    if (!existing) return { status: "notfound" };

    if (existing.updatedAt !== expectedUpdatedAt) {
      return { status: "conflict", current: existing };
    }

    let applied: Character;
    try {
      applied = applyOpsToCharacter(existing, ops);
    } catch (err) {
      return {
        status: "invalid",
        reason: err instanceof Error ? err.message : "unknown ops failure",
      };
    }

    // Та же санитаризация JSONB, что и в updateCharacter: не кладём updatedAt внутрь.
    const { updatedAt: _drop, ...dataForStorage } = applied;
    const [row] = await db
      .update(characters)
      .set({
        name: applied.name,
        data: dataForStorage,
        updatedAt: new Date(),
      })
      .where(and(eq(characters.id, id), eq(characters.userId, userId)))
      .returning();

    if (!row) return { status: "notfound" };

    return { status: "ok", character: rowToCharacter(row) };
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
    return rowToCharacter(row);
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
      updatedAt: new Date().toISOString(),
    } as Character;
    this.chars.set(id, newChar);
    return newChar;
  }

  async updateCharacter(
    id: string,
    userId: string,
    updates: Partial<Character>,
    expectedUpdatedAt?: string,
  ): Promise<UpdateCharacterResult> {
    const existing = await this.getCharacter(id, userId);
    if (!existing) return { status: "notfound" };
    if (expectedUpdatedAt !== undefined && existing.updatedAt !== expectedUpdatedAt) {
      return { status: "conflict", current: existing };
    }
    const { id: _, userId: __, updatedAt: ___, ...updateData } = updates;
    const merged = deepMerge(existing, updateData);
    const updated = { ...merged, updatedAt: new Date().toISOString() };
    this.chars.set(id, updated);
    return { status: "ok", character: updated };
  }

  async applyCollectionOps(
    id: string,
    userId: string,
    ops: CollectionOp[],
    expectedUpdatedAt: string,
  ): Promise<ApplyOpsResult> {
    const existing = await this.getCharacter(id, userId);
    if (!existing) return { status: "notfound" };
    if (existing.updatedAt !== expectedUpdatedAt) {
      return { status: "conflict", current: existing };
    }
    let applied: Character;
    try {
      applied = applyOpsToCharacter(existing, ops);
    } catch (err) {
      return {
        status: "invalid",
        reason: err instanceof Error ? err.message : "unknown ops failure",
      };
    }
    const updated = { ...applied, updatedAt: new Date().toISOString() };
    this.chars.set(id, updated);
    return { status: "ok", character: updated };
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
