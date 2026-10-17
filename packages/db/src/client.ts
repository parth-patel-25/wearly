import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { adminInvites } from "./schema/admin-invites.js";
import {
  account,
  accountRelations,
  session,
  sessionRelations,
  user,
  userRelations,
  verification,
} from "./schema/auth.js";

/**
 * Read lazily from process.env: the API loads root `.env` in `load-env.ts`
 * before this module is imported (see `apps/api/src/main.ts`).
 * The connection itself is opened on first query, not at import time — so a
 * missing DATABASE_URL fails at query time with Postgres's usual error rather
 * than crashing module import (e.g. during `auth generate`).
 */
const client = process.env.DATABASE_URL
  ? postgres(process.env.DATABASE_URL, { max: 10 })
  : postgres({ max: 10 });

const schema = {
  account,
  accountRelations,
  adminInvites,
  session,
  sessionRelations,
  user,
  userRelations,
  verification,
};

export const db = drizzle(client, { schema });
export type Database = typeof db;
