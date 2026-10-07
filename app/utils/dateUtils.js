// utils/dateUtils.js
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

/**
 * Quit dates used to be stored as "YYYY-MM-DD". `new Date("2024-05-01")` parses
 * that as UTC midnight, which shifts the day count for anyone west of UTC.
 * Date-only strings are read as local midnight; full timestamps as-is.
 */
export const parseQuitDate = (quitDate) => {
  if (!quitDate) return null;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(quitDate);
  if (dateOnly) {
    const [, y, m, d] = dateOnly;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  const date = new Date(quitDate);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getElapsed = (quitDate, now = Date.now()) => {
  const start = parseQuitDate(quitDate);
  const ms = start ? Math.max(0, now - start.getTime()) : 0;
  return {
    ms,
    days: Math.floor(ms / DAY),
    hours: Math.floor((ms % DAY) / HOUR),
    minutes: Math.floor((ms % HOUR) / MINUTE),
    seconds: Math.floor((ms % MINUTE) / 1000),
    totalHours: ms / HOUR,
  };
};

export const calculateDaysClean = (quitDate, now = Date.now()) =>
  getElapsed(quitDate, now).days;

/** Money saved accrues continuously, not in whole-day jumps. */
export const calculateMoneySaved = (costPerDay, quitDate, now = Date.now()) =>
  ((Number(costPerDay) || 0) * getElapsed(quitDate, now).ms) / DAY;

export const formatMoney = (amount, currency = "USD", digits = 0) => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(digits)}`;
  }
};

export const formatDuration = (ms) => {
  const days = Math.floor(ms / DAY);
  const hours = Math.floor((ms % DAY) / HOUR);
  const minutes = Math.floor((ms % HOUR) / MINUTE);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const pad = (n) => String(n).padStart(2, "0");

/** Local calendar day key, e.g. "2026-10-06". */
export const dayKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const toDateInput = (date) => dayKey(date);
export const toTimeInput = (date) => {
  const d = new Date(date);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Combine local date ("YYYY-MM-DD") and time ("HH:MM") inputs into an ISO string. */
export const fromDateTimeInputs = (date, time = "00:00") => {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = (time || "00:00").split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm).toISOString();
};

export const formatDate = (dateString, options = {}) =>
  new Date(dateString).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });

export const formatDateTime = (dateString) =>
  new Date(dateString).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const timeOfDayGreeting = (now = Date.now()) => {
  const h = new Date(now).getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

// ---- Milestones -----------------------------------------------------------

export const MILESTONE_DAYS = [
  1, 3, 7, 14, 21, 30, 45, 60, 90, 120, 180, 270, 365, 500, 730, 1095, 1460,
  1825, 3650,
];

export const milestoneLabel = (days) => {
  if (days >= 365 && days % 365 === 0) {
    const y = days / 365;
    return `${y} year${y > 1 ? "s" : ""}`;
  }
  if (days === 7) return "1 week";
  if (days === 14) return "2 weeks";
  if (days === 21) return "3 weeks";
  if (days === 30) return "1 month";
  if (days === 60) return "2 months";
  if (days === 90) return "3 months";
  if (days === 120) return "4 months";
  if (days === 180) return "6 months";
  if (days === 270) return "9 months";
  return `${days} day${days === 1 ? "" : "s"}`;
};

export const getMilestoneProgress = (elapsedMs) => {
  const days = elapsedMs / DAY;
  const next = MILESTONE_DAYS.find((d) => d > days) ?? null;
  const prev = [...MILESTONE_DAYS].reverse().find((d) => d <= days) ?? 0;
  if (!next) return { prev, next: null, progress: 1, remainingMs: 0 };
  return {
    prev,
    next,
    progress: (days - prev) / (next - prev),
    remainingMs: next * DAY - elapsedMs,
  };
};

// ---- Streaks --------------------------------------------------------------

/** Consecutive days (ending today, or yesterday if today isn't done yet) with a check-in. */
export const getCheckinStreak = (moodEntries, now = Date.now()) => {
  const days = new Set(
    moodEntries.filter((e) => e.pledge).map((e) => dayKey(e.timestamp))
  );
  const cursor = new Date(now);
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export const hasCheckedInToday = (moodEntries, now = Date.now()) =>
  moodEntries.some((e) => e.pledge && dayKey(e.timestamp) === dayKey(now));

export const getLongestStreakMs = (userData, now = Date.now()) => {
  const current = getElapsed(userData?.quitDate, now).ms;
  const past = (userData?.relapseHistory || []).map(
    (r) => r.durationMs ?? (r.daysClean || 0) * DAY
  );
  return Math.max(current, ...past);
};
