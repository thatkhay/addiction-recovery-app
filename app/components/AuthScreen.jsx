// components/AuthScreen.jsx
"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { ArrowRight, BarChart3, Cloud, Eye, EyeOff, LifeBuoy, Loader2, Lock, Mail, MessageCircleHeart, User } from "lucide-react";
import Aurora from "./ui/Aurora";
import Logo from "./ui/Logo";
import { Rise, Stagger, spring } from "./ui/motion";
import { signIn, signUp } from "../lib/auth";

const FEATURES = [
  { Icon: LifeBuoy, title: "SOS toolkit", text: "Guided breathing and grounding the moment a craving hits." },
  { Icon: BarChart3, title: "See your patterns", text: "Triggers, times of day and mood, all in one place." },
  { Icon: MessageCircleHeart, title: "A coach at 3am", text: "Talk it through whenever you need to." },
  { Icon: Cloud, title: "Safe in your account", text: "Your progress follows you to any device." },
];

const AFFIRMATIONS = ["Progress, not perfection.", "You’re stronger than the urge.", "Every hour counts.", "You don’t have to do this alone."];

function strength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
const STRENGTH = [
  { label: "Too short", color: "bg-rose-500" },
  { label: "Weak", color: "bg-orange-500" },
  { label: "Okay", color: "bg-amber-500" },
  { label: "Good", color: "bg-teal-500" },
  { label: "Strong", color: "bg-emerald-600" },
];

function Field({ icon: Icon, children, trailing }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
      {children}
      {trailing}
    </div>
  );
}

export default function AuthScreen({ initialError }) {
  const [mode, setMode] = useState("signup");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError || "");
  const [affirmation, setAffirmation] = useState(0);
  const shake = useAnimationControls();

  useEffect(() => {
    const t = setInterval(() => setAffirmation((i) => (i + 1) % AFFIRMATIONS.length), 3500);
    return () => clearInterval(t);
  }, []);

  const set = (k) => (e) => {
    setError("");
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "signup") await signUp(form.name, form.email, form.password);
      else await signIn(form.email, form.password);
    } catch (err) {
      setError(err.message);
      shake.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.4 } });
      setBusy(false);
    }
  };

  const pwScore = strength(form.password);

  return (
    <div className="relative flex min-h-dvh items-center justify-center px-4 py-10 lg:px-10">
      <Aurora intense />

      <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        {/* Story (desktop) */}
        <Stagger className="hidden lg:block">
          <Rise className="flex items-center gap-3">
            <Logo size={48} />
            <span className="font-display text-2xl font-semibold text-slate-900">Recovery</span>
          </Rise>
          <Rise as="h1" className="font-display mt-10 text-6xl leading-[1.05] font-semibold tracking-tight text-slate-900">
            Your fresh start, <span className="text-shimmer">one day at a time.</span>
          </Rise>
          <Rise className="mt-5 h-8 text-xl text-slate-600">
            <AnimatePresence mode="wait">
              <motion.p
                key={affirmation}
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                transition={{ duration: 0.45 }}
              >
                {AFFIRMATIONS[affirmation]}
              </motion.p>
            </AnimatePresence>
          </Rise>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {FEATURES.map(({ Icon, title, text }) => (
              <Rise key={title} className="glass rounded-3xl p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-600/10 text-teal-700">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 font-semibold text-slate-900">{title}</p>
                <p className="mt-1 text-sm text-slate-600">{text}</p>
              </Rise>
            ))}
          </div>
        </Stagger>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ type: "spring", stiffness: 160, damping: 22, delay: 0.1 }}
          className="mx-auto w-full max-w-md"
        >
          <div className="mb-8 text-center lg:hidden">
            <Logo size={64} />
            <h1 className="font-display mt-4 text-4xl font-semibold text-slate-900">Recovery</h1>
            <AnimatePresence mode="wait">
              <motion.p key={affirmation} className="mt-1 text-slate-600" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                {AFFIRMATIONS[affirmation]}
              </motion.p>
            </AnimatePresence>
          </div>

          <motion.div animate={shake} className="glass rounded-4xl p-6 sm:p-8">
            <div className="relative mb-6 grid grid-cols-2 rounded-2xl bg-slate-900/5 p-1">
              {[
                ["signup", "Create account"],
                ["signin", "Sign in"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setMode(id);
                    setError("");
                  }}
                  className={`relative z-10 rounded-xl py-2.5 text-sm font-semibold transition-colors ${mode === id ? "text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {mode === id && <motion.span layoutId="auth-tab" className="absolute inset-0 -z-10 rounded-xl bg-white shadow-sm" transition={spring} />}
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="space-y-3.5">
              <AnimatePresence initial={false}>
                {mode === "signup" && (
                  <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                    <Field icon={User}>
                      <input className="field pl-11" value={form.name} onChange={set("name")} placeholder="First name (optional)" autoComplete="given-name" aria-label="First name" />
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>
              <Field icon={Mail}>
                <input className="field pl-11" type="email" required value={form.email} onChange={set("email")} placeholder="Email" autoComplete="email" aria-label="Email" />
              </Field>
              <Field
                icon={Lock}
                trailing={
                  <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-600" aria-label={showPw ? "Hide password" : "Show password"}>
                    {showPw ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                }
              >
                <input
                  className="field pr-11 pl-11"
                  type={showPw ? "text" : "password"}
                  required
                  minLength={mode === "signup" ? 8 : undefined}
                  value={form.password}
                  onChange={set("password")}
                  placeholder={mode === "signup" ? "Password (8+ characters)" : "Password"}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  aria-label="Password"
                />
              </Field>

              {mode === "signup" && form.password && (
                <div className="flex items-center gap-3 px-1">
                  <div className="flex flex-1 gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <motion.span key={i} className={`h-1.5 flex-1 rounded-full ${i < pwScore ? STRENGTH[pwScore].color : "bg-slate-200"}`} layout />
                    ))}
                  </div>
                  <span className="w-16 text-right text-xs font-medium text-slate-500">{STRENGTH[pwScore].label}</span>
                </div>
              )}

              <AnimatePresence>
                {error && (
                  <motion.p role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={busy} className="btn-primary group w-full py-4 text-base">
                {busy ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {mode === "signup" ? "Start my journey" : "Welcome back"}
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
            <Lock className="h-3.5 w-3.5 shrink-0" /> Private by design. Your data is only visible to you.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
