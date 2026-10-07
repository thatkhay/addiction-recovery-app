// lib/coach.js
// Client for /api/coach with an offline fallback so support never disappears.

const CRISIS_PATTERN =
  /\b(suicid\w*|kill (myself|me)|end (it all|my life)|want to die|self[- ]?harm|hurt myself|overdos\w*|no reason to live)\b/i;

export const detectCrisis = (text = "") => CRISIS_PATTERN.test(text);

const OFFLINE_REPLIES = [
  {
    match: /\b(crav\w*|urge\w*|tempt\w*|want to (use|drink|smoke|gamble))\b/i,
    reply: (p) =>
      `That urge is real, and it will pass. Cravings usually peak and fade within 15 to 30 minutes. Right now:\n\n1. Tap the SOS button and do one round of box breathing.\n2. Change rooms or step outside for 10 minutes.\n3. Text someone you trust: “Having a rough moment.”\n\nRemember why you started${p.motivation ? `: “${p.motivation.replace(/[.!?\s]+$/, "")}”` : ""}. You’ve got this.`,
  },
  {
    match: /\b(slip\w*|relaps\w*|gave in|messed up|used again|drank again)\b/i,
    reply: () =>
      "A slip doesn’t erase the work you’ve done. What matters most is what you do next. Be as kind to yourself as you would be to a friend. When you’re ready, write down what led up to it. That’s how you learn your triggers. Then pick one small thing to do differently next time.",
  },
  {
    match: /\b(stress\w*|anxi\w*|overwhelm\w*|panic\w*|angry|anger)\b/i,
    reply: () =>
      "That sounds heavy. Try this: breathe in for 4, hold for 4, out for 6, five times. Then name one thing you can control in the next hour, and do just that. Stress is one of the most common triggers. Noticing it is a real skill.",
  },
  {
    match: /\b(lonely|alone|isolat\w*|no one)\b/i,
    reply: () =>
      "Loneliness is one of the hardest parts of recovery, and you’re not alone in feeling it. Could you reach out to one person today, even just a short text? Online meetings (SMART Recovery, AA, and others) run around the clock if you need people who get it.",
  },
  {
    match: /\b(bored|boredom|nothing to do)\b/i,
    reply: () =>
      "Boredom is a sneaky trigger. Pick something that uses your hands or body for 20 minutes: a walk, cooking, cleaning one drawer, a workout video. Bonus points for something you used to love before.",
  },
  {
    match: /\b(sleep|tired|exhaust\w*|insomnia)\b/i,
    reply: () =>
      "Tiredness lowers our defences. Sleep often gets worse before it gets better in early recovery. Keep a steady bedtime, avoid screens for the last 30 minutes, and keep caffeine to mornings. If you’re having physical withdrawal symptoms, please check in with a doctor.",
  },
];

export function offlineReply(text, profile = {}) {
  if (detectCrisis(text)) {
    return "I’m really glad you told me. You deserve support right now from a real person. Please call or text 988 (Suicide & Crisis Lifeline, US) or your local emergency number. If you can, reach out to someone near you and let them know how you’re feeling.";
  }
  const hit = OFFLINE_REPLIES.find((r) => r.match.test(text));
  if (hit) return hit.reply(profile);
  return `Thank you for sharing that. Putting it into words takes courage. ${
    profile.daysClean > 0
      ? `You’ve stayed on track for ${profile.daysClean} day${profile.daysClean === 1 ? "" : "s"}. That’s real proof you can do hard things. `
      : ""
  }What’s one small thing that would make the next hour easier?`;
}

/**
 * Ask the coach. Calls onText(partialText) as the reply streams in and
 * resolves to { text, offline }.
 */
export async function askCoach({ messages, profile, mode = "chat", onText }) {
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  try {
    const res = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, profile, mode }),
    });
    if (!res.ok || !res.body) throw new Error(`Coach unavailable (${res.status})`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      onText?.(text);
    }
    if (!text.trim()) throw new Error("Empty reply");
    return { text, offline: false };
  } catch {
    const text = offlineReply(lastUser, profile);
    onText?.(text);
    return { text, offline: true };
  }
}
