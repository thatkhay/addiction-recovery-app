import { getCurrentUser, rateLimit, rejectCrossSite } from "@/app/lib/server/auth";
import { handle } from "@/app/lib/server/http";
import { notifyUser, pushConfigured } from "@/app/lib/server/push";

export const runtime = "nodejs";

export const POST = handle(async (request: Request) => {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });
  if (!(await rateLimit(`push-test:${user.id}`, 5, 10 * 60 * 1000))) {
    return Response.json({ error: "Too many test notifications. Try again in a few minutes." }, { status: 429 });
  }
  const delivered = await notifyUser(user.id, {
    title: "Test notification",
    body: "This is what your reminders will look like. You’ve got this.",
    url: "/",
    kind: "test",
  });
  return Response.json({ ok: true, delivered, pushConfigured: pushConfigured() });
});
