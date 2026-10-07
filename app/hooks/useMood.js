// hooks/useMood.js
import { Annoyed, Frown, Laugh, Meh, Smile } from "lucide-react";
import { usePersistentState } from "../lib/store";

const EMPTY = [];

export const MOODS = [
  { mood: "terrible", Icon: Frown, label: "Awful", value: 1, tint: "text-rose-600", bg: "bg-rose-50", ring: "ring-rose-400" },
  { mood: "bad", Icon: Annoyed, label: "Low", value: 2, tint: "text-orange-600", bg: "bg-orange-50", ring: "ring-orange-400" },
  { mood: "okay", Icon: Meh, label: "Okay", value: 3, tint: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-400" },
  { mood: "good", Icon: Smile, label: "Good", value: 4, tint: "text-teal-600", bg: "bg-teal-50", ring: "ring-teal-500" },
  { mood: "great", Icon: Laugh, label: "Great", value: 5, tint: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-500" },
];

export const moodValue = (mood) =>
  MOODS.find((m) => m.mood === mood)?.value ?? 3;

export function useMood() {
  const [moodEntries, setMoodEntries] = usePersistentState(
    "recovery-mood-entries",
    EMPTY
  );

  /** `pledge: true` marks the entry as the day's check-in. */
  const saveMoodEntry = (mood, note = "", pledge = false) =>
    setMoodEntries((prev) => [
      { id: Date.now(), mood, note, pledge, timestamp: new Date().toISOString() },
      ...prev,
    ]);

  const getMoodTrend = () => {
    if (moodEntries.length < 2) return null;
    const recent = moodEntries.slice(0, 7);
    const avg = recent.reduce((s, e) => s + moodValue(e.mood), 0) / recent.length;
    return avg >= 4 ? "improving" : avg >= 3 ? "stable" : "struggling";
  };

  return { moodEntries, saveMoodEntry, getMoodTrend };
}
