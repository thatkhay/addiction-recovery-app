// lib/missions.js
// Pure mission evaluation: given the user's data, how far along is each mission?
import { DAY } from "../utils/dateUtils";

export const CATEGORY_LABELS = {
  daily: "Getting started",
  weekly: "Building habits",
  monthly: "Going strong",
  milestone: "Milestones",
};

const inHourRange = (iso, [from, to]) => {
  const h = new Date(iso).getHours();
  return h >= from && h < to;
};

const consecutiveDaysWithEntry = (entries, hours, max, now) => {
  let count = 0;
  for (let i = 0; i < max; i++) {
    const check = new Date(now);
    check.setDate(check.getDate() - i);
    const found = entries.some(
      (e) =>
        new Date(e.date).toDateString() === check.toDateString() &&
        inHourRange(e.date, hours)
    );
    if (found) count++;
    else if (i === 0) continue; // today isn't over yet
    else break;
  }
  return count;
};

const cleanPeriod = (cravings, daysClean, days, now) => {
  const recent = cravings.filter(
    (c) => now - new Date(c.timestamp).getTime() <= days * DAY
  );
  return {
    progress: Math.min(daysClean, days),
    met:
      daysClean >= days && recent.length > 0 && recent.every((c) => !c.gaveIn),
  };
};

/**
 * Returns [{ mission, progress, target, met }] for every mission definition.
 * `met` reflects the current data only; persisting earned missions is the caller's job.
 */
export function evaluateMissions(definitions, data, now = Date.now()) {
  const {
    daysClean = 0,
    cravings = [],
    diaryEntries = [],
    moodEntries = [],
    aiUsageCount = 0,
  } = data;

  const overcame = cravings.filter((c) => !c.gaveIn).length;

  return definitions.map((mission) => {
    const target = mission.target || 1;
    let progress = 0;
    let met = false;

    switch (mission.type) {
      case "craving-first":
        progress = cravings.length;
        break;
      case "craving-daily":
        progress = overcame;
        break;
      case "journal-first":
        progress = diaryEntries.length;
        break;
      case "mood-first":
        progress = moodEntries.length;
        break;
      case "ai-first":
        progress = aiUsageCount;
        break;
      case "journal-morning":
        progress = diaryEntries.some((e) => inHourRange(e.date, [5, 12])) ? 1 : 0;
        break;
      case "journal-evening":
        progress = diaryEntries.some((e) => inHourRange(e.date, [18, 24])) ? 1 : 0;
        break;
      case "journal-affirmation":
        progress = diaryEntries.some((e) => /\bi am\b/i.test(e.content)) ? 1 : 0;
        break;
      case "craving-count":
        progress = overcame;
        break;
      case "journal-count":
        progress = diaryEntries.length;
        break;
      case "mood-count":
        progress = moodEntries.length;
        break;
      case "ai-count":
        progress = aiUsageCount;
        break;
      case "streak":
        progress = daysClean;
        break;
      case "perfect-week":
        ({ progress, met } = cleanPeriod(cravings, daysClean, 7, now));
        break;
      case "perfect-month":
        ({ progress, met } = cleanPeriod(cravings, daysClean, 30, now));
        break;
      case "morning-streak":
        progress = consecutiveDaysWithEntry(diaryEntries, [5, 12], target, now);
        break;
      case "evening-streak":
        progress = consecutiveDaysWithEntry(diaryEntries, [18, 24], target, now);
        break;
      default:
        break;
    }

    if (!["perfect-week", "perfect-month"].includes(mission.type)) {
      met = progress >= target;
    }

    return { mission, progress: Math.min(progress, target), target, met };
  });
}

// Each level costs 100 XP more than the last (L1→2: 100, L2→3: 200, ...),
// so late-game missions worth thousands of XP don't produce absurd levels.
const xpToReach = (level) => 50 * level * (level - 1);

export const levelFromXP = (xp) => {
  let level = 1;
  while (xpToReach(level + 1) <= xp) level++;
  const span = xpToReach(level + 1) - xpToReach(level);
  const intoLevel = xp - xpToReach(level);
  return { level, intoLevel, toNext: span - intoLevel, progress: intoLevel / span };
};
