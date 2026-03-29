import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL && !process.env.LOCAL_DEV) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : (null as unknown as InstanceType<typeof Pool>);

export const db = process.env.DATABASE_URL
  ? drizzle(pool, { schema })
  : (null as unknown as ReturnType<typeof drizzle>);
