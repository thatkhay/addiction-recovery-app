// hooks/useDiary.js
import { usePersistentState } from "../lib/store";

const EMPTY = [];

export function useDiary() {
  const [diaryEntries, setDiaryEntries] = usePersistentState(
    "recovery-diary-entries",
    EMPTY
  );

  const addDiaryEntry = (content, extra = {}) => {
    if (!content.trim()) return null;
    const entry = {
      id: Date.now(),
      content: content.trim(),
      date: new Date().toISOString(),
      ...extra,
    };
    setDiaryEntries((prev) => [entry, ...prev]);
    return entry;
  };

  const updateDiaryEntry = (id, patch) =>
    setDiaryEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );

  /** Put a deleted entry back where it was (newest first). */
  const restoreDiaryEntry = (entry) =>
    setDiaryEntries((prev) =>
      prev.some((e) => e.id === entry.id) ? prev : [...prev, entry].sort((a, b) => b.date.localeCompare(a.date))
    );

  const deleteDiaryEntry = (id) =>
    setDiaryEntries((prev) => prev.filter((e) => e.id !== id));

  return { diaryEntries, addDiaryEntry, updateDiaryEntry, deleteDiaryEntry, restoreDiaryEntry };
}
