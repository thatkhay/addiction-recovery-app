// lib/server/db.ts
// Postgres everywhere:
// - Production (Vercel): Neon over HTTP, via DATABASE_URL (set automatically when
//   you add a Neon database from the Vercel dashboard).
// - Local development: an embedded Postgres (PGlite) stored in ./data/pglite,
//   so `npm run dev` works with zero setup.
import path from "node:path";

export type Statement = { text: string; params?: unknown[] };

export type Db = {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
  /** Run statements atomically. */
  batch(statements: Statement[]): Promise<void>;
};

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
     id TEXT PRIMARY KEY,
     email TEXT NOT NULL UNIQUE,
     name TEXT NOT NULL DEFAULT '',
     password_hash TEXT NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS sessions (
     token_hash TEXT PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     expires_at BIGINT NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id)`,
  `CREATE TABLE IF NOT EXISTS user_data (
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     key TEXT NOT NULL,
     value JSONB NOT NULL,
     updated_at BIGINT NOT NULL,
     PRIMARY KEY (user_id, key)
   )`,
  `CREATE TABLE IF NOT EXISTS push_subscriptions (
     endpoint TEXT PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     p256dh TEXT NOT NULL,
     auth TEXT NOT NULL,
     created_at BIGINT NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS push_subscriptions_user ON push_subscriptions(user_id)`,
  `CREATE TABLE IF NOT EXISTS push_prefs (
     user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
     tz TEXT NOT NULL DEFAULT 'UTC',
     checkin_time TEXT NOT NULL DEFAULT '09:00',
     types JSONB NOT NULL DEFAULT '{"checkin":true,"milestone":true,"risky":true,"comeback":true}',
     last_sent JSONB NOT NULL DEFAULT '{}'
   )`,
  `CREATE TABLE IF NOT EXISTS notifications (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     body TEXT NOT NULL,
     url TEXT NOT NULL DEFAULT '/',
     kind TEXT NOT NULL DEFAULT 'info',
     created_at BIGINT NOT NULL,
     read BOOLEAN NOT NULL DEFAULT false
   )`,
  `CREATE INDEX IF NOT EXISTS notifications_user ON notifications(user_id, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS rate_limits (
     key TEXT PRIMARY KEY,
     count INTEGER NOT NULL,
     reset_at BIGINT NOT NULL
   )`,
];

async function connectNeon(url: string): Promise<Db> {
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(url);
  return {
    query: async <T>(text: string, params: unknown[] = []) => (await sql.query(text, params)) as T[],
    batch: async (statements) => {
      await sql.transaction(statements.map((s) => sql.query(s.text, s.params ?? [])));
    },
  };
}

async function connectLocal(): Promise<Db> {
  const { PGlite } = await import("@electric-sql/pglite");
  const dir = process.env.PGLITE_DIR || path.join(process.cwd(), "data", "pglite");
  const pg = new PGlite(dir);
  return {
    query: async <T>(text: string, params: unknown[] = []) => (await pg.query<T>(text, params)).rows,
    batch: async (statements) => {
      await pg.transaction(async (tx) => {
        for (const s of statements) await tx.query(s.text, s.params ?? []);
      });
    },
  };
}

/**
 * The Postgres connection string. Vercel's Neon integration may add a custom
 * prefix (e.g. STORAGE_DATABASE_URL), so accept any *DATABASE_URL / *POSTGRES_URL.
 */
export function databaseUrl(): { name: string; url: string } | null {
  for (const name of ["DATABASE_URL", "POSTGRES_URL"]) {
    if (process.env[name]) return { name, url: process.env[name] as string };
  }
  const name = Object.keys(process.env).find((k) => /(^|_)(DATABASE_URL|POSTGRES_URL)$/.test(k) && process.env[k]);
  return name ? { name, url: process.env[name] as string } : null;
}

async function connect() {
  const url = databaseUrl()?.url;
  if (!url && process.env.VERCEL) {
    throw new Error("DATABASE_URL is not set. Add a Neon database to this Vercel project (Storage tab).");
  }
  const db = url ? await connectNeon(url) : await connectLocal();
  for (const statement of SCHEMA) await db.query(statement);
  return db;
}

const globalForDb = globalThis as unknown as { recoveryDb?: Promise<Db> };

export function getDb(): Promise<Db> {
  // One connection (and one schema check) per server instance; reused across hot reloads.
  globalForDb.recoveryDb ??= connect().catch((error) => {
    globalForDb.recoveryDb = undefined;
    throw error;
  });
  return globalForDb.recoveryDb;
}
