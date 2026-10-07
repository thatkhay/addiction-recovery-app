// lib/server/auth.ts
import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { getDb } from "./db";

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

export const SESSION_COOKIE = "recovery_session";
const SESSION_DAYS = 30;

export type PublicUser = { id: string; email: string; name: string; createdAt: string };

type UserRow = { id: string; email: string; name: string; password_hash: string; created_at: string | Date };

const toPublic = (u: UserRow): PublicUser => ({ id: u.id, email: u.email, name: u.name, createdAt: new Date(u.created_at).toISOString() });

// ---- Passwords -------------------------------------------------------------

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scryptAsync(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

// ---- Validation ------------------------------------------------------------

export const normalizeEmail = (email: unknown) => (typeof email === "string" ? email.trim().toLowerCase() : "");
export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
export const passwordProblem = (password: unknown) => {
  if (typeof password !== "string" || password.length < 8) return "Password must be at least 8 characters.";
  if (password.length > 200) return "Password is too long.";
  return null;
};

// ---- Users -----------------------------------------------------------------

export async function findUserByEmail(email: string) {
  const db = await getDb();
  return (await db.query<UserRow>("SELECT * FROM users WHERE email = $1", [email]))[0];
}

export async function createUser(email: string, name: string, password: string) {
  const row: UserRow = {
    id: randomUUID(),
    email,
    name: name.trim().slice(0, 80),
    password_hash: await hashPassword(password),
    created_at: new Date().toISOString(),
  };
  const db = await getDb();
  await db.query("INSERT INTO users (id, email, name, password_hash, created_at) VALUES ($1, $2, $3, $4, $5)", [
    row.id, row.email, row.name, row.password_hash, row.created_at,
  ]);
  return toPublic(row);
}

export async function deleteUser(userId: string) {
  const db = await getDb();
  await db.query("DELETE FROM users WHERE id = $1", [userId]);
}

export async function getUserRow(userId: string) {
  const db = await getDb();
  return (await db.query<UserRow>("SELECT * FROM users WHERE id = $1", [userId]))[0];
}

export { toPublic };

// ---- Sessions --------------------------------------------------------------

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function startSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const db = await getDb();
  await db.batch([
    { text: "DELETE FROM sessions WHERE expires_at < $1", params: [Date.now()] },
    { text: "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)", params: [hashToken(token), userId, expires] },
  ]);

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expires),
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await (await getDb()).query("DELETE FROM sessions WHERE token_hash = $1", [hashToken(token)]);
  jar.delete(SESSION_COOKIE);
}

/** The signed-in user for this request, or null. */
export async function getCurrentUser(): Promise<PublicUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = await getDb();
  const [row] = await db.query<UserRow>(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > $2`,
    [hashToken(token), Date.now()]
  );
  return row ? toPublic(row) : null;
}

// ---- Abuse protection ------------------------------------------------------

/**
 * Allow `limit` attempts per key per window. Returns false when exceeded.
 * Stored in the database so the limit holds across serverless instances.
 */
export async function rateLimit(key: string, limit = 10, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const db = await getDb();
  // Occasionally sweep expired counters so the table doesn't grow forever.
  if (Math.random() < 0.02) await db.query("DELETE FROM rate_limits WHERE reset_at < $1", [now]);
  const [row] = await db.query<{ count: number }>(
    `INSERT INTO rate_limits (key, count, reset_at) VALUES ($1, 1, $2)
     ON CONFLICT (key) DO UPDATE SET
       count = CASE WHEN rate_limits.reset_at < $3 THEN 1 ELSE rate_limits.count + 1 END,
       reset_at = CASE WHEN rate_limits.reset_at < $3 THEN $2 ELSE rate_limits.reset_at END
     RETURNING count`,
    [key, now + windowMs, now]
  );
  return row.count <= limit;
}

/**
 * Mutating requests must be same-origin JSON. Browsers won't send a
 * cross-site application/json POST without a CORS preflight we never grant.
 */
export function rejectCrossSite(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return Response.json({ error: "Cross-site request blocked" }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ error: "Expected JSON" }, { status: 415 });
  }
  return null;
}

export const clientIp = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
