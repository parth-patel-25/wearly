import { setDefaultResultOrder } from "node:dns";
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
 * Prefer IPv4 when a host publishes both A and AAAA records. Node 17+ returns
 * DNS results in OS order, so a host that also has an IPv6 record can be
 * dialled over IPv6 first; hosts with IPv4-only egress (Render, Railway) then
 * fail with `ENETUNREACH` even though an IPv4 record exists. Supabase's
 * session pooler is IPv4-capable, so preferring IPv4 keeps that path working.
 */
setDefaultResultOrder("ipv4first");

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
