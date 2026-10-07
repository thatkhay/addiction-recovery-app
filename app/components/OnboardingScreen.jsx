// components/OnboardingScreen.jsx
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Cloud } from "lucide-react";
import Aurora from "./ui/Aurora";
import Logo from "./ui/Logo";
import { fromDateTimeInputs, toDateInput, toTimeInput } from "../utils/dateUtils";

export const ADDICTION_PRESETS = ["Alcohol", "Smoking", "Vaping", "Cannabis", "Gambling", "Opioids", "Porn", "Social media", "Sugar", "Caffeine"];
export const CURRENCIES = ["USD", "EUR", "GBP", "NGN", "CAD", "AUD", "INR", "ZAR", "KES", "GHS"];

const STEPS = ["What", "When", "Why"];

export default function OnboardingScreen({ onComplete, defaultName = "" }) {
  const now = new Date();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: defaultName,
    addiction: "",
    date: toDateInput(now),
    time: toTimeInput(now),
    costPerDay: "",
    currency: "USD",
    motivation: "",
  });

  const set = (key) => (e) => {
    setError("");
    setForm((f) => ({ ...f, [key]: typeof e === "string" ? e : e.target.value }));
  };

  const validate = () => {
    if (step === 0 && !form.addiction.trim()) return "Tell us what you’re recovering from.";
    if (step === 1) {
      if (!form.date) return "Pick the date you quit.";
      if (new Date(fromDateTimeInputs(form.date, form.time)) > new Date()) return "Your quit date can’t be in the future.";
      if (form.costPerDay && Number(form.costPerDay) < 0) return "Cost can’t be negative.";
    }
    if (step === 2 && !form.motivation.trim()) return "Write a few words about your reason. You’ll see it when things get hard.";
    return "";
  };

  const [direction, setDirection] = useState(1);
  const goTo = (n) => {
    setDirection(n > step ? 1 : -1);
    setStep(n);
  };

  const next = () => {
    const problem = validate();
    if (problem) return setError(problem);
    if (step < STEPS.length - 1) return goTo(step + 1);
    onComplete({
      name: form.name.trim(),
      addiction: form.addiction.trim(),
      quitDate: fromDateTimeInputs(form.date, form.time),
      costPerDay: parseFloat(form.costPerDay) || 0,
      currency: form.currency,
      motivation: form.motivation.trim(),
      supportContacts: [],
      relapseHistory: [],
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center p-4">
      <Aurora intense />
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ type: "spring", stiffness: 160, damping: 22 }}
      >
        <div className="mb-6 text-center">
          <Logo size={60} />
          <h1 className="font-display mt-4 text-4xl font-semibold text-slate-900">
            {form.name ? `Welcome, ${form.name}` : "Let’s set things up"}
          </h1>
          <p className="mt-1 text-slate-600">Three quick questions and you’re in.</p>
        </div>

        <div className="glass rounded-4xl p-6 sm:p-8">
          <div className="mb-6 flex gap-1.5" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
            {STEPS.map((s, i) => (
              <div key={s} className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                <motion.div className="h-full rounded-full bg-teal-600" initial={false} animate={{ width: i <= step ? "100%" : "0%" }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              next();
            }}
            className="space-y-5"
          >
            <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              className="space-y-5"
              initial={{ opacity: 0, x: direction * 36, filter: "blur(6px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: direction * -36, filter: "blur(6px)" }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            >
            {step === 0 && (
              <>
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">
                    What should we call you? <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <input id="name" className="field" value={form.name} onChange={set("name")} placeholder="First name or nickname" autoComplete="given-name" />
                </div>
                <div>
                  <label htmlFor="addiction" className="mb-2 block text-sm font-semibold text-slate-700">
                    What are you recovering from?
                  </label>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {ADDICTION_PRESETS.map((a) => (
                      <button type="button" key={a} onClick={() => set("addiction")(a)} className={form.addiction === a ? "chip-on" : "chip-off"}>
                        {a}
                      </button>
                    ))}
                  </div>
                  <input id="addiction" className="field" value={form.addiction} onChange={set("addiction")} placeholder="Or type your own" />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">When did you stop?</span>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <input aria-label="Quit date" type="date" className="field" value={form.date} max={toDateInput(now)} onChange={set("date")} />
                    <input aria-label="Quit time" type="time" className="field" value={form.time} onChange={set("time")} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, date: toDateInput(new Date()), time: toTimeInput(new Date()) }))}
                    className="mt-2 text-sm font-semibold text-teal-700 hover:underline"
                  >
                    I’m starting right now
                  </button>
                </div>
                <div>
                  <label htmlFor="cost" className="mb-2 block text-sm font-semibold text-slate-700">
                    Roughly how much did it cost you per day? <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <div className="grid grid-cols-[auto_1fr] gap-2">
                    <select aria-label="Currency" className="field w-auto" value={form.currency} onChange={set("currency")}>
                      {CURRENCIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <input id="cost" type="number" inputMode="decimal" min="0" step="0.01" className="field" value={form.costPerDay} onChange={set("costPerDay")} placeholder="0.00" />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">We’ll show how much you’ve saved.</p>
                </div>
              </>
            )}

            {step === 2 && (
              <div>
                <label htmlFor="motivation" className="mb-2 block text-sm font-semibold text-slate-700">
                  Why are you doing this?
                </label>
                <textarea
                  id="motivation"
                  rows={4}
                  className="field resize-none"
                  value={form.motivation}
                  onChange={set("motivation")}
                  placeholder="For my kids. For my health. To feel like myself again…"
                />
                <p className="mt-2 text-xs text-slate-500">We’ll remind you of this when cravings hit.</p>
              </div>
            )}

            </motion.div>
            </AnimatePresence>

            {error && (
              <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              {step > 0 && (
                <button type="button" onClick={() => goTo(step - 1)} className="btn-secondary" aria-label="Back">
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <button type="submit" className="btn-primary flex-1 py-4">
                {step < STEPS.length - 1 ? (
                  <>
                    Continue <ArrowRight className="h-5 w-5" />
                  </>
                ) : (
                  "Start my journey"
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <Cloud className="h-4 w-4 shrink-0" /> Saved privately to your account. Only you can see it.
        </p>
      </motion.div>
    </div>
  );
}
