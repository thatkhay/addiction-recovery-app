import {
  clientIp, findUserByEmail, hashPassword, normalizeEmail, rateLimit,
  rejectCrossSite, startSession, toPublic, verifyPassword,
} from "@/app/lib/server/auth";
import { handle } from "@/app/lib/server/http";

export const runtime = "nodejs";

// Hash once so unknown emails take as long as wrong passwords.
const dummyHash = hashPassword("not-a-real-password");

export const POST = handle(async (request: Request) => {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;

  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";

  if (!(await rateLimit(`login:${clientIp(request)}:${email}`, 8))) {
    return Response.json({ error: "Too many attempts. Wait 15 minutes and try again." }, { status: 429 });
  }

  const user = await findUserByEmail(email);
  const ok = await verifyPassword(password, user?.password_hash ?? (await dummyHash));
  if (!user || !ok) return Response.json({ error: "Email or password is incorrect." }, { status: 401 });

  await startSession(user.id);
  return Response.json({ user: toPublic(user) });
});
