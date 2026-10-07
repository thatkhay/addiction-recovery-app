// components/views/MissionsView.jsx
"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, CheckCircle2, Star } from "lucide-react";
import { CATEGORY_LABELS } from "../../lib/missions";
import { missionIcon } from "../../lib/icons";
import { AnimatedNumber, Bar, Rise, Stagger, spring } from "../ui/motion";

export default function MissionsView({ missions, totalXP, level, levelProgress, toNext, onBack }) {
  const [filter, setFilter] = useState("active");
  const done = missions.filter((m) => m.completed).length;

  const filters = [
    { id: "active", label: "In progress" },
    ...Object.entries(CATEGORY_LABELS).map(([id, label]) => ({ id, label })),
    { id: "done", label: `Completed (${done})` },
  ];

  const ratio = (m) => m.progress / m.target;
  const shown = missions
    .filter((m) => {
      if (filter === "active") return !m.completed;
      if (filter === "done") return m.completed;
      return m.category === filter;
    })
    .sort((a, b) => {
      if (filter === "done") return (b.completedAt || "").localeCompare(a.completedAt || "");
      return Number(a.completed) - Number(b.completed) || ratio(b) - ratio(a) || a.xp - b.xp;
    })
    .slice(0, filter === "active" ? 12 : undefined);

  return (
    <Stagger className="space-y-4 lg:space-y-6">
      <Rise>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 lg:hidden">
          <ArrowLeft className="h-4 w-4" /> Home
        </button>
      </Rise>

      <Rise as="section" className="card relative overflow-hidden bg-linear-to-br from-amber-50 to-orange-50 ring-amber-200 lg:p-8">
        <motion.div
          className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-amber-300/30 blur-2xl"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative flex items-center gap-4">
          <motion.div
            className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30"
            animate={{ rotate: [0, -4, 4, 0] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
          >
            <Star className="h-5 w-5" fill="currentColor" />
            <span className="text-sm font-bold">Lv {level}</span>
          </motion.div>
          <div className="flex-1">
            <p className="font-display text-2xl font-semibold text-slate-900 lg:text-3xl">
              <AnimatedNumber value={totalXP} /> XP
            </p>
            <div className="mt-2">
              <Bar value={levelProgress} className="bg-amber-500" track="bg-amber-100" />
            </div>
            <p className="mt-1 text-xs text-amber-900">
              {toNext} XP to level {level + 1} · {done}/{missions.length} missions
            </p>
          </div>
        </div>
      </Rise>

      <Rise className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`relative shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${filter === f.id ? "border-transparent text-white" : "border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300"}`}
          >
            {filter === f.id && <motion.span layoutId="mission-filter" className="absolute inset-0 rounded-full bg-teal-600" transition={spring} />}
            <span className="relative">{f.label}</span>
          </button>
        ))}
      </Rise>

      <motion.div layout className="grid grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((m, i) => {
            const { Icon, tint } = missionIcon(m);
            return (
              <motion.div
                layout
                key={m.id}
                initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { delay: Math.min(i, 10) * 0.03 } }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                className={`card flex items-start gap-4 p-4 ${m.completed ? "bg-teal-50/70 ring-teal-200" : ""}`}
              >
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${m.completed ? "bg-teal-600 text-white" : ratio(m) === 0 ? "bg-slate-100 text-slate-400" : tint}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">{m.title}</h3>
                    {m.completed ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-600" aria-label="Completed" />
                    ) : (
                      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">+{m.xp} XP</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{m.description}</p>
                  {!m.completed && m.target > 1 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1">
                        <Bar value={ratio(m)} height="h-1.5" />
                      </div>
                      <span className="text-xs text-slate-500 tabular-nums">
                        {m.progress}/{m.target}
                      </span>
                    </div>
                  )}
                  {m.completed && m.completedAt && (
                    <p className="mt-1 text-xs text-teal-700">Earned {new Date(m.completedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · +{m.xp} XP</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
      {shown.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Nothing here yet. Keep going!</p>}
    </Stagger>
  );
}
