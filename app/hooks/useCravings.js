// hooks/useCravings.js
import { usePersistentState } from "../lib/store";
import { DAY } from "../utils/dateUtils";

const EMPTY = [];

export function useCravings() {
  const [cravings, setCravings] = usePersistentState("recovery-cravings", EMPTY);

  const addCraving = (craving) =>
    setCravings((prev) => [
      {
        ...craving,
        id: Date.now(),
        // Stamp at save time - the modal can stay mounted for hours.
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);

  const restoreCraving = (craving) =>
    setCravings((prev) =>
      prev.some((c) => c.id === craving.id) ? prev : [...prev, craving].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    );

  const deleteCraving = (id) =>
    setCravings((prev) => prev.filter((c) => c.id !== id));

  const getCravingStats = () => {
    const total = cravings.length;
    const overcame = cravings.filter((c) => !c.gaveIn).length;
    const gaveIn = total - overcame;
    const now = Date.now();
    const last24h = cravings.filter(
      (c) => now - new Date(c.timestamp).getTime() < DAY
    ).length;
    const avgIntensity =
      total > 0
        ? Math.round(
            (cravings.reduce((sum, c) => sum + (c.intensity || 0), 0) / total) * 10
          ) / 10
        : 0;
    const successRate = total > 0 ? Math.round((overcame / total) * 100) : 0;
    return { total, overcame, gaveIn, last24h, avgIntensity, successRate };
  };

  return { cravings, addCraving, deleteCraving, restoreCraving, getCravingStats };
}
