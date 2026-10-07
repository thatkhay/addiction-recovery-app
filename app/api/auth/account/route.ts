import { deleteUser, endSession, getCurrentUser, getUserRow, rejectCrossSite, verifyPassword } from "@/app/lib/server/auth";
import { handle } from "@/app/lib/server/http";

export const runtime = "nodejs";

/** Permanently delete the signed-in account and all of its data. */
export const DELETE = handle(async (request: Request) => {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });

  const { password } = await request.json().catch(() => ({}));
  const row = await getUserRow(user.id);
  if (!row || typeof password !== "string" || !(await verifyPassword(password, row.password_hash))) {
    return Response.json({ error: "Password is incorrect." }, { status: 401 });
  }

  await endSession();
  await deleteUser(user.id);
  return Response.json({ ok: true });
});
