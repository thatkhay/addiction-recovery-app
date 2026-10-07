// components/views/InsightsView.jsx
"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BarChart3, Lightbulb, MapPin, Trash2, Zap } from "lucide-react";
import { AnimatedNumber, Rise, Stagger } from "../ui/motion";
import { MOODS, moodValue } from "../../hooks/useMood";
import { dayKey, formatDateTime } from "../../utils/dateUtils";

// Validated (CVD-safe, ≥3:1 on white) two-series palette.
const RESISTED = "#0d9488";
const GAVE_IN = "#d97706";

const DAYS = 14;

function lastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

const BUCKETS = [
  { id: "morning", label: "Morning", range: [5, 12] },
  { id: "afternoon", label: "Afternoon", range: [12, 17] },
  { id: "evening", label: "Evening", range: [17, 22] },
  { id: "night", label: "Night", range: [22, 29] },
];

const bucketOf = (iso) => {
  let h = new Date(iso).getHours();
  if (h < 5) h += 24;
  return BUCKETS.find((b) => h >= b.range[0] && h < b.range[1])?.id;
};

function ChartCard({ title, subtitle, readout, children, legend }) {
  return (
    <Rise as="section" className="card">
      <div className="mb-1 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        {legend}
      </div>
      <p className="mb-3 h-5 text-sm font-medium text-slate-700 tabular-nums" aria-live="polite">{readout}</p>
      {children}
    </Rise>
  );
}

function CravingTrend({ cravings }) {
  const [active, setActive] = useState(null);
  const days = lastNDays(DAYS).map((d) => {
    const key = dayKey(d);
    const dayCravings = cravings.filter((c) => dayKey(c.timestamp) === key);
    return {
      key,
      date: d,
      resisted: dayCravings.filter((c) => !c.gaveIn).length,
      gaveIn: dayCravings.filter((c) => c.gaveIn).length,
    };
  });
  const max = Math.max(1, ...days.map((d) => d.resisted + d.gaveIn));
  const shown = active !== null ? days[active] : null;
  const fmt = (d) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const total = days.reduce((s, d) => s + d.resisted + d.gaveIn, 0);

  return (
    <ChartCard
      title="Cravings, last 14 days"
      subtitle={`${total} logged`}
      readout={shown ? `${fmt(shown.date)}: ${shown.resisted} resisted · ${shown.gaveIn} gave in` : "Tap a bar for details"}
      legend={
        <div className="flex shrink-0 flex-col gap-1 text-xs text-slate-600">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: RESISTED }} /> Resisted</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: GAVE_IN }} /> Gave in</span>
        </div>
      }
    >
      <div className="relative">
        <span className="absolute -top-1 left-0 text-[10px] text-slate-400 tabular-nums">{max}</span>
        <div className="flex h-36 items-end gap-1 border-b border-slate-200 pt-3" onMouseLeave={() => setActive(null)}>
          {days.map((d, i) => (
            <button
              key={d.key}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className={`flex h-full flex-1 flex-col-reverse items-stretch gap-0.5 rounded-t ${active === i ? "bg-slate-100" : ""}`}
              aria-label={`${fmt(d.date)}: ${d.resisted} resisted, ${d.gaveIn} gave in`}
            >
              {d.resisted > 0 && (
                <motion.span
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.resisted / max) * 100}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 18, delay: i * 0.03 }}
                  style={{ background: RESISTED, borderRadius: d.gaveIn ? 0 : "4px 4px 0 0" }}
                />
              )}
              {d.gaveIn > 0 && (
                <motion.span
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.gaveIn / max) * 100}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 18, delay: i * 0.03 + 0.1 }}
                  style={{ background: GAVE_IN, borderRadius: "4px 4px 0 0" }}
                />
              )}
            </button>
          ))}
        </div>
        <div className="mt-1 flex gap-1 text-[10px] text-slate-400">
          {days.map((d, i) => (
            <span key={d.key} className="flex-1 text-center tabular-nums">{i % 2 === 1 ? d.date.getDate() : ""}</span>
          ))}
        </div>
      </div>
      <table className="sr-only">
        <caption>Cravings per day</caption>
        <thead><tr><th>Date</th><th>Resisted</th><th>Gave in</th></tr></thead>
        <tbody>{days.map((d) => <tr key={d.key}><td>{fmt(d.date)}</td><td>{d.resisted}</td><td>{d.gaveIn}</td></tr>)}</tbody>
      </table>
    </ChartCard>
  );
}

function HorizontalBars({ rows, color = RESISTED }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.label} className="grid grid-cols-[6.5rem_1fr_2rem] items-center gap-2 text-sm">
          <span className="truncate text-slate-600">{r.label}</span>
          <div className="h-3 rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(r.value / max) * 100}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 18 }}
              style={{ background: color, minWidth: r.value ? 6 : 0 }}
            />
          </div>
          <span className="text-right font-semibold text-slate-800 tabular-nums">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

function MoodHistory({ moodEntries }) {
  const [active, setActive] = useState(null);
  const days = lastNDays(DAYS).map((d) => {
    const entries = moodEntries.filter((e) => dayKey(e.timestamp) === dayKey(d));
    const avg = entries.length ? entries.reduce((s, e) => s + moodValue(e.mood), 0) / entries.length : null;
    return { date: d, avg, count: entries.length };
  });
  const shown = active !== null ? days[active] : null;
  const fmt = (d) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const moodFor = (v) => MOODS[Math.round(v) - 1];

  return (
    <ChartCard
      title="Mood, last 14 days"
      subtitle="Daily average"
      readout={shown ? (shown.avg ? `${fmt(shown.date)}: ${moodFor(shown.avg).label} (${shown.count} log${shown.count > 1 ? "s" : ""})` : `${fmt(shown.date)}: no entries`) : "Tap a day for details"}
    >
      <div className="flex h-28 items-end gap-1 border-b border-slate-200" onMouseLeave={() => setActive(null)}>
        {days.map((d, i) => (
          <button
            key={i}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            className={`flex h-full flex-1 items-end rounded-t ${active === i ? "bg-slate-100" : ""}`}
            aria-label={d.avg ? `${fmt(d.date)}: ${moodFor(d.avg).label}` : `${fmt(d.date)}: no entries`}
          >
            {d.avg && (
              <motion.span
                className="w-full"
                initial={{ height: 0 }}
                animate={{ height: `${(d.avg / 5) * 100}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 18, delay: i * 0.03 }}
                style={{ background: "#7c3aed", borderRadius: "4px 4px 0 0" }}
              />
            )}
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
        <span>{fmt(days[0].date)}</span>
        <span>Today</span>
      </div>
    </ChartCard>
  );
}

export default function InsightsView({ cravings, moodEntries, getCravingStats, onDeleteCraving }) {
  const stats = getCravingStats();

  const triggerCounts = {};
  cravings.forEach((c) => (c.triggers || []).forEach((t) => (triggerCounts[t] = (triggerCounts[t] || 0) + 1)));
  const topTriggers = Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value }));

  const timeRows = BUCKETS.map((b) => ({ label: b.label, value: cravings.filter((c) => bucketOf(c.timestamp) === b.id).length }));
  const peak = [...timeRows].sort((a, b) => b.value - a.value)[0];

  const tips = [];
  if (peak?.value >= 3) tips.push(`Most of your cravings hit in the ${peak.label.toLowerCase()}. Plan something for that time: a walk, a call, a meal.`);
  if (topTriggers[0]?.value >= 2) tips.push(`"${topTriggers[0].label}" is your most common trigger. Ask the coach for a plan to handle it.`);
  if (stats.total >= 3 && stats.successRate >= 80) tips.push(`You’ve resisted ${stats.successRate}% of logged cravings. That’s a real skill you’re building.`);

  return (
    <Stagger className="space-y-4 lg:space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {[
          { v: stats.overcame, l: "Resisted" },
          { v: stats.successRate, l: "Success rate", f: (n) => `${Math.round(n)}%` },
          { v: stats.last24h, l: "Last 24 hours" },
          { v: stats.avgIntensity, l: "Avg intensity", f: (n) => (stats.total ? `${n.toFixed(1)}/10` : "–") },
        ].map((s) => (
          <Rise key={s.l} className="card p-4">
            <div className="font-display text-3xl font-semibold text-slate-900 tabular-nums">
              <AnimatedNumber value={s.v} format={s.f} />
            </div>
            <div className="text-sm text-slate-500">{s.l}</div>
          </Rise>
        ))}
      </div>

      {tips.length > 0 && (
        <Rise className="card bg-amber-50/90 ring-amber-200">
          <p className="eyebrow flex items-center gap-1.5 text-amber-800"><Lightbulb className="h-3.5 w-3.5" /> What we’re noticing</p>
          <ul className="mt-2 space-y-1.5 text-sm text-amber-950">
            {tips.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </Rise>
      )}

      {cravings.length === 0 ? (
        <Rise className="card py-12 text-center">
          <BarChart3 className="mx-auto mb-3 h-12 w-12 text-slate-300" />
          <p className="font-semibold text-slate-700">Your patterns will show up here</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">Log cravings when they happen, and you’ll see your triggers and the times of day to watch.</p>
        </Rise>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <CravingTrend cravings={cravings} />
          {topTriggers.length > 0 && (
            <ChartCard title="Top triggers" subtitle="How often each came up">
              <HorizontalBars rows={topTriggers} />
            </ChartCard>
          )}
          <ChartCard title="Time of day" subtitle="When cravings tend to hit">
            <HorizontalBars rows={timeRows} />
          </ChartCard>
          {moodEntries.length > 0 && <MoodHistory moodEntries={moodEntries} />}
        </div>
      )}

      {cravings.length === 0 && moodEntries.length > 0 && <MoodHistory moodEntries={moodEntries} />}

      {cravings.length > 0 && (
        <Rise as="section" className="space-y-2">
          <h3 className="px-1 font-semibold text-slate-900">Craving log</h3>
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-3">
          <AnimatePresence initial={false}>
          {cravings.map((c) => (
            <motion.div key={c.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.gaveIn ? GAVE_IN : RESISTED }} />
                  <span className="text-sm font-semibold text-slate-900">{c.gaveIn ? "Gave in" : "Resisted"}</span>
                  {c.intensity && <span className="text-sm text-slate-500">· <Zap className="-mt-0.5 inline h-3.5 w-3.5" /> {c.intensity}/10</span>}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-400">{formatDateTime(c.timestamp)}</span>
                  <button onClick={() => onDeleteCraving(c)} className="rounded-lg p-1.5 text-slate-300 transition hover:bg-rose-50 hover:text-rose-600" aria-label="Delete craving">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {(c.triggers?.length > 0 || c.location || c.activity || c.withPeople) && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.location && <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"><MapPin className="h-3 w-3" />{c.location}</span>}
                  {(c.triggers || []).map((t) => <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{t}</span>)}
                  {c.activity && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{c.activity}</span>}
                  {c.withPeople && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">With {c.withPeople}</span>}
                </div>
              )}
              {c.trigger && <p className="mt-2 text-sm text-slate-600 italic">{c.trigger}</p>}
            </motion.div>
          ))}
          </AnimatePresence>
          </div>
        </Rise>
      )}
    </Stagger>
  );
}
