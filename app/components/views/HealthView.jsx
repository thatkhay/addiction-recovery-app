// components/views/HealthView.jsx
"use client";
import React from "react";
import { motion } from "motion/react";
import { CheckCircle2, Lock } from "lucide-react";
import { benefitsFor } from "../../constants/healthBenefits";
import { formatDuration, getElapsed } from "../../utils/dateUtils";
import { Bar, Reveal, Rise, Stagger } from "../ui/motion";

const HOUR = 60 * 60 * 1000;

export default function HealthView({ userData, now }) {
  const { totalHours } = getElapsed(userData.quitDate, now);
  const { kind, list } = benefitsFor(userData.addiction);
  const unlockedCount = list.filter((b) => totalHours >= b.hours).length;
  const nextIndex = list.findIndex((b) => totalHours < b.hours);

  return (
    <Stagger className="space-y-4 lg:space-y-6">
      <Rise as="section" className="card lg:p-8">
        <h2 className="font-display text-2xl font-semibold text-slate-900 lg:text-3xl">Your body is healing</h2>
        <p className="mt-1 text-slate-600">
          {unlockedCount} of {list.length} milestones reached
        </p>
        <div className="mt-3">
          <Bar value={unlockedCount / list.length} />
        </div>
      </Rise>

      <ol className="relative grid grid-cols-1 gap-3 pl-6 lg:grid-cols-2 lg:gap-4 lg:pl-0">
        <span className="absolute top-3 bottom-3 left-2.5 w-0.5 bg-slate-200 lg:hidden" aria-hidden="true" />
        {list.map((b, i) => {
          const unlocked = totalHours >= b.hours;
          const isNext = i === nextIndex;
          const prevHours = i === 0 ? 0 : list[i - 1].hours;
          const progress = isNext ? (totalHours - prevHours) / (b.hours - prevHours) : 0;
          return (
            <Reveal as="li" key={b.title} delay={(i % 2) * 0.05} className="relative">
              <span className={`absolute top-6 -left-[1.1rem] h-3 w-3 rounded-full ring-4 ring-[var(--background)] lg:hidden ${unlocked ? "bg-teal-600" : isNext ? "bg-amber-500" : "bg-slate-300"}`} aria-hidden="true" />
              <div className={`card flex h-full items-start gap-4 ${unlocked ? "" : isNext ? "ring-2 ring-amber-300" : "opacity-60"}`}>
                <span className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${unlocked ? "bg-teal-50 text-teal-700" : isNext ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-400"}`}>
                  {isNext && (
                    <motion.span
                      className="absolute inset-0 rounded-2xl ring-2 ring-amber-400"
                      animate={{ scale: [1, 1.25], opacity: [0.7, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                  <b.Icon className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">{b.title}</h3>
                    {unlocked ? <CheckCircle2 className="h-5 w-5 text-teal-600" aria-label="Reached" /> : <Lock className="h-4 w-4 text-slate-400" aria-label="Locked" />}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-600">{b.benefit}</p>
                  {isNext && (
                    <div className="mt-3">
                      <Bar value={Math.max(0.02, progress)} className="bg-amber-500" track="bg-amber-100" height="h-1.5" />
                      <p className="mt-1 text-xs font-medium text-amber-800">{formatDuration((b.hours - totalHours) * HOUR)} to go</p>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          );
        })}
      </ol>

      <p className="px-2 text-xs text-slate-500">
        Typical timelines from public health sources{kind === "general" ? ", generalised across addictions" : ""}. Everyone’s body is different. This isn’t medical advice.
        {kind === "alcohol" && " Stopping heavy drinking suddenly can be dangerous. Talk to a doctor about withdrawal."}
      </p>
    </Stagger>
  );
}
