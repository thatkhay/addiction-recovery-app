// hooks/useUserData.js
import { usePersistentState } from "../lib/store";
import { getElapsed } from "../utils/dateUtils";

export const USER_KEY = "recovery-user-data";

export function useUserData() {
  const [userData, setUserData] = usePersistentState(USER_KEY, null);

  const saveUserData = (data) => setUserData(data);

  const updateProfile = (patch) =>
    setUserData((prev) => (prev ? { ...prev, ...patch } : prev));

  /** Record a slip and restart the counter. All other data is kept. */
  const recordRelapse = ({ trigger = "", reflection = "" } = {}) =>
    setUserData((prev) => {
      if (!prev) return prev;
      const elapsed = getElapsed(prev.quitDate);
      return {
        ...prev,
        quitDate: new Date().toISOString(),
        relapseHistory: [
          ...(prev.relapseHistory || []),
          {
            date: new Date().toISOString(),
            daysClean: elapsed.days,
            durationMs: elapsed.ms,
            trigger,
            reflection,
          },
        ],
      };
    });

  return { userData, saveUserData, updateProfile, recordRelapse };
}
