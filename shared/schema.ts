import { pgTable, varchar, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export * from "./models/auth";

export * from "./data/d5e-constants";
export * from "./data/d5e-classes";
export * from "./data/d5e-races";
export * from "./data/d5e-equipment";
export * from "./types/character-types";

export const characters = pgTable("characters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: varchar("name").notNull(),
  data: jsonb("data").notNull(),
  shareToken: varchar("share_token").unique(),
  isShared: boolean("is_shared").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type DbCharacter = typeof characters.$inferSelect;
export type InsertDbCharacter = typeof characters.$inferInsert;
