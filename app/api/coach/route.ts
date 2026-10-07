// app/api/coach/route.ts
// Streams a reply from the recovery coach. Returns 503 when no Claude
// credentials are configured so the client can fall back to offline support.
import Anthropic from "@anthropic-ai/sdk";
import { getCurrentUser, rateLimit } from "@/app/lib/server/auth";
import { handle } from "@/app/lib/server/http";

export const runtime = "nodejs";
// Streaming replies can take a while; give the function room on Vercel.
export const maxDuration = 60;

type Profile = {
  addiction?: string;
  daysClean?: number;
  motivation?: string;
};

type CoachRequest = {
  mode?: "chat" | "journal";
  profile?: Profile;
  messages?: { role: "user" | "assistant"; content: string }[];
};

const SYSTEM_PROMPT = `You are a warm, steady recovery coach inside an addiction recovery app. You are not a therapist or doctor, and you don’t pretend to be one.

How you help:
- Lead with empathy and without judgment. Slips are part of recovery, not failure.
- Be practical. Offer one to three concrete things the person can do right now (urge surfing, paced breathing, delaying 15 minutes, changing location, calling someone, HALT: hungry/angry/lonely/tired).
- Use what you know about the person (what they’re recovering from, how long they’ve been clean, their stated motivation) naturally, without reciting it.
- Keep replies short: usually under 120 words, plain conversational text. Short lists are fine; no headings.
- Ask at most one gentle question to keep them talking when it helps.

Safety:
- If the person mentions suicide, self-harm, overdose, or being in danger, respond with care and clearly urge them to call or text 988 (US) or their local emergency number now.
- Stopping alcohol, benzodiazepines, or opioids abruptly can be medically dangerous. If withdrawal symptoms come up (shakes, sweating, confusion, hallucinations, seizures), recommend medical help promptly.`;

const JOURNAL_INSTRUCTION =
  "The person just wrote the journal entry below. Reflect back what you notice with compassion, name one strength you see in it, and offer one small, specific suggestion. Under 100 words.";

function contextNote(profile: Profile = {}) {
  const parts = [];
  if (profile.addiction) parts.push(`Recovering from: ${profile.addiction}.`);
  if (typeof profile.daysClean === "number")
    parts.push(`Current streak: ${profile.daysClean} day(s).`);
  if (profile.motivation) parts.push(`Their motivation: "${profile.motivation}".`);
  return parts.join(" ");
}

export const POST = handle(async (request: Request) => {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in to use the coach" }, { status: 401 });
  if (!(await rateLimit(`coach:${user.id}`, 60, 60 * 60 * 1000))) {
    return Response.json({ error: "Too many messages. Take a breather and try again soon." }, { status: 429 });
  }

  let body: CoachRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const history = (body.messages ?? [])
    .filter((m) => m.content?.trim())
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  if (history.length === 0 || history[0].role !== "user") {
    return Response.json({ error: "Conversation must start with a user message" }, { status: 400 });
  }

  let client: Anthropic;
  try {
    client = new Anthropic();
  } catch {
    return Response.json({ error: "AI coach is not configured" }, { status: 503 });
  }

  const system = [
    SYSTEM_PROMPT,
    contextNote(body.profile),
    body.mode === "journal" ? JOURNAL_INSTRUCTION : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const stream = client.beta.messages.stream({
    model: "claude-opus-5-5",
    max_tokens: 2000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low" },
    system,
    messages: history,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(
            encoder.encode(
              "\n\nI can’t help with that one, but I’m still here for you. If you’re in danger, please call or text 988 or your local emergency number."
            )
          );
        }
        controller.close();
      } catch (error) {
        if (error instanceof Anthropic.AuthenticationError) {
          console.error("Coach: Claude credentials are missing or invalid");
        } else if (error instanceof Anthropic.RateLimitError) {
          console.error("Coach: rate limited");
        } else if (error instanceof Anthropic.APIError) {
          console.error(`Coach: API error ${error.status}`, error.message);
        } else {
          console.error("Coach: unexpected error", error);
        }
        controller.error(error);
      }
    },
    cancel() {
      stream.abort();
    },
  });

  // Surface auth/config failures as a 503 before streaming begins, so the
  // client can fall back cleanly instead of showing a half-written reply.
  try {
    await stream.withResponse();
  } catch (error) {
    const status =
      error instanceof Anthropic.AuthenticationError || !(error instanceof Anthropic.APIError)
        ? 503
        : error.status ?? 502;
    return Response.json({ error: "AI coach unavailable" }, { status });
  }

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
});
