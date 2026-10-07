// hooks/useMissions.js
import { useEffect, useMemo } from "react";
import { DEFAULT_MISSIONS } from "../constants/missions";
import { evaluateMissions, levelFromXP } from "../lib/missions";
import { readValue, usePersistentState, writeValue } from "../lib/store";
import { toast } from "../lib/toast";
import { celebrate } from "../lib/celebrate";

const EARNED_KEY = "recovery-missions-earned";
const LEGACY_KEY = "recovery-missions";
const NONE = {};

/** Earned missions ({ [id]: isoDate }) used to live inside a stored copy of every mission. */
function migrateLegacy() {
  if (readValue(EARNED_KEY, null) !== null) return;
  const legacy = readValue(LEGACY_KEY, null);
  if (!Array.isArray(legacy)) return;
  const earned = {};
  legacy.filter((m) => m.completed).forEach((m) => {
    earned[m.id] = new Date().toISOString();
  });
  writeValue(EARNED_KEY, earned);
  writeValue(LEGACY_KEY, undefined);
}

export function useMissions(data, enabled = true) {
  const [earned] = usePersistentState(EARNED_KEY, NONE);

  const evaluated = useMemo(
    () => evaluateMissions(DEFAULT_MISSIONS, data),
    [data]
  );

  const newlyMet = evaluated
    .filter((e) => e.met && !earned[e.mission.id])
    .map((e) => e.mission.id)
    .join(",");

  // Persist newly completed missions; once earned, a mission stays earned
  // (a reset streak doesn't take back XP).
  useEffect(() => {
    if (typeof window === "undefined" || !enabled) return;
    migrateLegacy();
    if (!newlyMet) return;
    const current = readValue(EARNED_KEY, NONE);
    const ids = newlyMet.split(",").map(Number).filter((id) => !current[id]);
    if (ids.length === 0) return;

    const prevXP = DEFAULT_MISSIONS.filter((m) => current[m.id]).reduce((s, m) => s + m.xp, 0);
    const next = { ...current };
    const stamp = new Date().toISOString();
    ids.forEach((id) => (next[id] = stamp));
    writeValue(EARNED_KEY, next);

    const won = DEFAULT_MISSIONS.filter((m) => ids.includes(m.id));
    const gained = won.reduce((s, m) => s + m.xp, 0);
    toast(
      won.length === 1
        ? `Mission complete: ${won[0].title} (+${won[0].xp} XP)`
        : `${won.length} missions complete (+${gained} XP)`,
      "achievement",
      5000
    );
    const before = levelFromXP(prevXP).level;
    const after = levelFromXP(prevXP + gained).level;
    celebrate(after > before ? "big" : "small");
    if (after > before) setTimeout(() => toast(`Level up! You reached level ${after}`, "achievement", 5000), 600);
  }, [newlyMet, enabled]);

  const missions = evaluated.map((e) => ({
    ...e.mission,
    progress: e.progress,
    target: e.target,
    completed: Boolean(earned[e.mission.id]) || e.met,
    completedAt: earned[e.mission.id],
  }));

  const totalXP = missions.filter((m) => m.completed).reduce((s, m) => s + m.xp, 0);

  return { missions, totalXP, ...levelFromXP(totalXP) };
}
