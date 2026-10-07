import {
  clientIp, createUser, findUserByEmail, isValidEmail, normalizeEmail,
  passwordProblem, rateLimit, rejectCrossSite, startSession,
} from "@/app/lib/server/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  if (!(await rateLimit(`signup:${clientIp(request)}`, 10, 60 * 60 * 1000))) {
    return Response.json({ error: "Too many sign-ups from this network. Try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(body.email);
  const name = typeof body.name === "string" ? body.name : "";

  if (!isValidEmail(email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  const problem = passwordProblem(body.password);
  if (problem) return Response.json({ error: problem }, { status: 400 });
  if (await findUserByEmail(email)) {
    return Response.json({ error: "An account with this email already exists. Try signing in." }, { status: 409 });
  }

  const user = await createUser(email, name, body.password);
  await startSession(user.id);
  return Response.json({ user }, { status: 201 });
}
