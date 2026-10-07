// components/modals/CravingModal.jsx
"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Sheet from "../ui/Sheet";

export const TRIGGERS = ["Stress", "Boredom", "Loneliness", "Anxiety", "Anger", "Tired", "Hungry", "Social pressure", "Celebration", "Saw or smelled it", "Pain", "Habit / routine"];
export const PLACES = ["Home", "Work", "Social event", "Commute", "Outside", "Online"];

const intensityLabel = (n) => (n <= 3 ? "Mild" : n <= 6 ? "Moderate" : n <= 8 ? "Strong" : "Overwhelming");

/**
 * resisted: when opened from the SOS toolkit we already know the outcome,
 * so the last step becomes a simple save.
 */
export default function CravingModal({ onClose, onSave, onGaveIn, resisted = false }) {
  const [step, setStep] = useState(1);
  const [craving, setCraving] = useState({ intensity: 5, triggers: [], location: "", trigger: "" });

  const toggleTrigger = (t) =>
    setCraving((c) => ({
      ...c,
      triggers: c.triggers.includes(t) ? c.triggers.filter((x) => x !== t) : [...c.triggers, t],
    }));

  const back = (
    <button onClick={() => setStep(step - 1)} className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800">
      <ArrowLeft className="h-4 w-4" /> Back
    </button>
  );

  return (
    <Sheet
      onClose={onClose}
      title={step === 1 ? "Log a craving" : step === 2 ? "What was going on?" : "How did it end?"}
      subtitle={step === 1 ? "Noticing an urge is a skill. Let’s capture it." : step === 2 ? "Patterns show up over time. Tap all that apply." : "Honesty helps you learn. There’s no wrong answer."}
    >
      <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 30, filter: "blur(6px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, x: -30, filter: "blur(6px)" }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <div className="mb-3 flex items-end justify-between">
              <span className="text-sm font-semibold text-slate-700">Intensity</span>
              <span className="text-sm text-slate-500">
                <span className="font-display text-3xl font-semibold text-slate-900 tabular-nums">{craving.intensity}</span>/10 · {intensityLabel(craving.intensity)}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={craving.intensity}
              onChange={(e) => setCraving({ ...craving, intensity: Number(e.target.value) })}
              className="w-full accent-teal-600"
              aria-label="Craving intensity"
            />
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              <span>Barely there</span>
              <span>Overwhelming</span>
            </div>
          </div>
          <button onClick={() => setStep(2)} className="btn-primary w-full py-4">Next</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          {back}
          <div>
            <span className="eyebrow">Triggers</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {TRIGGERS.map((t) => (
                <motion.button whileTap={{ scale: 0.92 }} layout key={t} onClick={() => toggleTrigger(t)} className={craving.triggers.includes(t) ? "chip-on" : "chip-off"} aria-pressed={craving.triggers.includes(t)}>
                  {t}
                </motion.button>
              ))}
            </div>
          </div>
          <div>
            <span className="eyebrow">Where</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {PLACES.map((p) => (
                <button key={p} onClick={() => setCraving({ ...craving, location: craving.location === p ? "" : p })} className={craving.location === p ? "chip-on" : "chip-off"} aria-pressed={craving.location === p}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <textarea
            rows={2}
            placeholder="Anything else? (optional)"
            value={craving.trigger}
            onChange={(e) => setCraving({ ...craving, trigger: e.target.value })}
            className="field resize-none"
          />
          <button onClick={() => setStep(3)} className="btn-primary w-full py-4">Next</button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          {back}
          {resisted ? (
            <button onClick={() => onSave({ ...craving, gaveIn: false })} className="btn-primary w-full py-4">
              <CheckCircle2 className="h-5 w-5" /> Save. I rode it out.
            </button>
          ) : (
            <>
              <button onClick={() => onSave({ ...craving, gaveIn: false })} className="btn-primary w-full py-5 text-lg">
                <CheckCircle2 className="h-6 w-6" /> I didn’t give in
              </button>
              <button onClick={() => onGaveIn({ ...craving, gaveIn: true })} className="btn-secondary w-full py-4">
                I gave in
              </button>
            </>
          )}
        </div>
      )}
      </motion.div>
      </AnimatePresence>
    </Sheet>
  );
}
