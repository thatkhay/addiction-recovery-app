// hooks/useDailyInsight.js
// Today's "For you" card. Shows tailored offline content instantly, then
// upgrades to an AI-written card (cached for the day, synced to the account).
import { useEffect, useMemo, useState } from "react";
import { readValue, usePersistentState, writeValue } from "../lib/store";
import { offlineInsight, signalsFrom } from "../lib/personalize";
import { dayKey } from "../utils/dateUtils";

const KEY = "recovery-daily-insight";
const NONE = null;
let inflight = null;

async function fetchInsight(userData, signals) {
  const res = await fetch("/api/insight", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ addiction: userData.addiction, motivation: userData.motivation, signals }),
  });
  if (!res.ok) throw new Error(String(res.status));
  return (await res.json()).insight;
}

export function useDailyInsight({ userData, cravings, moodEntries, daysClean, now }) {
  const [cached] = usePersistentState(KEY, NONE);
  const [loading, setLoading] = useState(false);
  const today = now ? dayKey(now) : null;
  const signals = useMemo(
    () => (userData ? signalsFrom({ userData, cravings, moodEntries, daysClean }) : null),
    [userData, cravings, moodEntries, daysClean]
  );

  const refresh = async (force = false) => {
    if (!signals || !today || inflight) return;
    const current = readValue(KEY, null);
    if (!force && current?.date === today && current.source === "ai") return;
    setLoading(true);
    inflight = fetchInsight(userData, signals)
      .then((insight) =>
        writeValue(KEY, {
          date: today,
          source: "ai",
          title: insight.title,
          body: insight.body,
          action: insight.action,
          journalPrompt: insight.journal_prompt,
        })
      )
      .catch(() => {
        // Offline content stays on screen; we'll try again tomorrow or on refresh.
        if (force) writeValue(KEY, { date: today, source: "offline", ...offlineInsight(signals, userData, Date.now() + Math.random() * 1e9) });
      })
      .finally(() => {
        inflight = null;
        setLoading(false);
      });
  };

  useEffect(() => {
    const current = readValue(KEY, null);
    if (today && signals && current?.date !== today) refresh();
    // Once per day is enough; signals change constantly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);

  const insight =
    cached?.date === today ? cached : signals ? { source: "offline", ...offlineInsight(signals, userData, now) } : null;

  return { insight, loading, refresh: () => refresh(true) };
}
