// components/modals/SOSSheet.jsx
// The "I’m craving right now" toolkit.
"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Wind, Hand, Heart, Phone, MessageCircleHeart, X, MessageSquare, CheckCircle2, Gamepad2 } from "lucide-react";
import { spring } from "../ui/motion";
import Sheet from "../ui/Sheet";
import { useNow } from "../../lib/store";
import { calculateMoneySaved, formatMoney, getElapsed } from "../../utils/dateUtils";

const URGE_WINDOW_MIN = 20;

const TOOLS = [
  { id: "breathe", label: "Breathe", icon: Wind },
  { id: "ground", label: "Ground", icon: Hand },
  { id: "why", label: "My why", icon: Heart },
  { id: "reach", label: "Reach out", icon: Phone },
];

const BOX_PHASES = ["Breathe in", "Hold", "Breathe out", "Hold"];

function Breathe({ startedAt, now }) {
  const secs = Math.max(0, Math.floor((now - startedAt) / 1000));
  const phaseIndex = Math.floor(secs / 4) % 4;
  const count = 4 - (secs % 4);
  const rounds = Math.floor(secs / 16);
  const expanded = phaseIndex === 0 || phaseIndex === 1;

  return (
    <div className="flex flex-col items-center py-4">
      <div className="relative flex h-56 w-56 items-center justify-center">
        <motion.div
          className="absolute -inset-4 rounded-full bg-[conic-gradient(from_0deg,#5eead4,#a7f3d0,#bae6fd,#5eead4)] opacity-40 blur-2xl"
          animate={{ rotate: 360, scale: expanded ? 1 : 0.7 }}
          transition={{ rotate: { duration: 12, repeat: Infinity, ease: "linear" }, scale: { duration: 4, ease: "easeInOut" } }}
        />
        <motion.div
          className="absolute inset-0 rounded-full bg-teal-100"
          animate={{ scale: expanded ? 1 : 0.6 }}
          transition={{ duration: 4, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-6 rounded-full bg-linear-to-br from-teal-200 to-emerald-200"
          animate={{ scale: expanded ? 1 : 0.55 }}
          transition={{ duration: 4, ease: "easeInOut" }}
        />
        <div className="relative text-center">
          <AnimatePresence mode="wait">
            <motion.div key={phaseIndex} initial={{ opacity: 0, y: 6, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -6, filter: "blur(4px)" }} className="text-xl font-semibold text-teal-900">
              {BOX_PHASES[phaseIndex]}
            </motion.div>
          </AnimatePresence>
          <motion.div key={secs} initial={{ scale: 1.25, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} transition={spring} className="font-display text-5xl font-semibold text-teal-800 tabular-nums">
            {count}
          </motion.div>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500">
        Box breathing: 4 in, 4 hold, 4 out, 4 hold. {rounds > 0 && <span className="font-semibold text-teal-700">{rounds} round{rounds > 1 ? "s" : ""} done</span>}
      </p>
    </div>
  );
}

const GROUND_STEPS = [
  { n: 5, sense: "things you can see", hint: "A lamp, a crack in the ceiling, the color of your sleeve…" },
  { n: 4, sense: "things you can feel", hint: "Your feet on the floor, the fabric of your clothes…" },
  { n: 3, sense: "things you can hear", hint: "Traffic, a fan, your own breathing…" },
  { n: 2, sense: "things you can smell", hint: "Coffee, soap, fresh air. Move somewhere if you need to." },
  { n: 1, sense: "thing you can taste", hint: "Take a sip of water and notice it." },
];

function Ground() {
  const [i, setI] = useState(0);
  const done = i >= GROUND_STEPS.length;
  const step = GROUND_STEPS[i];
  return (
    <div className="py-4 text-center">
      {done ? (
        <div className="animate-fadeIn py-6">
          <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-teal-600" />
          <p className="font-display text-2xl font-semibold text-slate-900">You’re here. You’re present.</p>
          <p className="mt-2 text-slate-600">Notice how the urge feels now compared to a few minutes ago.</p>
          <button onClick={() => setI(0)} className="btn-secondary mt-5">Do it again</button>
        </div>
      ) : (
        <motion.div key={i} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={spring}>
          <div className="font-display mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-sky-100 text-4xl font-semibold text-sky-800">{step.n}</div>
          <p className="text-xl font-semibold text-slate-900">Name {step.n} {step.sense}</p>
          <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">{step.hint}</p>
          <div className="mt-5 flex justify-center gap-1.5">
            {GROUND_STEPS.map((s, j) => (
              <span key={s.n} className={`h-1.5 w-6 rounded-full ${j <= i ? "bg-sky-500" : "bg-slate-200"}`} />
            ))}
          </div>
          <button onClick={() => setI(i + 1)} className="btn-primary mt-6 w-full">Done, next</button>
        </motion.div>
      )}
    </div>
  );
}

function MyWhy({ userData, now }) {
  const elapsed = getElapsed(userData.quitDate, now);
  const saved = calculateMoneySaved(userData.costPerDay, userData.quitDate, now);
  return (
    <div className="space-y-4 py-2">
      <blockquote className="font-display rounded-3xl bg-rose-50 p-5 text-xl leading-relaxed text-rose-950">
        “{userData.motivation}”
      </blockquote>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="font-display text-3xl font-semibold text-slate-900">{elapsed.days}d {elapsed.hours}h</div>
          <div className="text-sm text-slate-500">of freedom you’d be giving up</div>
        </div>
        {saved > 0 && (
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="font-display text-3xl font-semibold text-slate-900">{formatMoney(saved, userData.currency)}</div>
            <div className="text-sm text-slate-500">saved so far</div>
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">Play the tape forward</p>
        <p className="mt-1">Picture the next hour if you give in, then tomorrow morning. Now picture it if you don’t. Which version of you do you want to wake up as?</p>
      </div>
    </div>
  );
}

function ReachOut({ contacts, onOpenSettings }) {
  return (
    <div className="space-y-3 py-2">
      {contacts.length > 0 ? (
        contacts.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
            <div>
              <div className="font-semibold text-slate-900">{c.name}</div>
              <div className="text-sm text-slate-500">{c.phone}</div>
            </div>
            <div className="flex gap-2">
              <a href={`sms:${c.phone}?&body=${encodeURIComponent("Hey, I’m having a tough moment. Can you talk?")}`} className="rounded-full bg-white p-3 text-sky-700 ring-1 ring-slate-200" aria-label={`Text ${c.name}`}>
                <MessageSquare className="h-5 w-5" />
              </a>
              <a href={`tel:${c.phone}`} className="rounded-full bg-teal-600 p-3 text-white" aria-label={`Call ${c.name}`}>
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-600">
          Add a sponsor, friend or family member so they’re one tap away.
          <button onClick={onOpenSettings} className="mt-3 block w-full font-semibold text-teal-700">Add support contacts</button>
        </div>
      )}
      <a href="tel:988" className="flex items-center justify-between rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-200">
        <div>
          <div className="font-semibold text-rose-900">988 Suicide & Crisis Lifeline</div>
          <div className="text-sm text-rose-700">US · 24/7 · call or text</div>
        </div>
        <Phone className="h-5 w-5 text-rose-700" />
      </a>
      <a href="tel:18006624357" className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
        <div>
          <div className="font-semibold text-slate-900">SAMHSA National Helpline</div>
          <div className="text-sm text-slate-500">US · free, confidential, 24/7</div>
        </div>
        <Phone className="h-5 w-5 text-slate-500" />
      </a>
    </div>
  );
}

export default function SOSSheet({ onClose, userData, onTalkToCoach, onLogCraving, onSlip, onOpenSettings, onDistract }) {
  const now = useNow();
  const [startedAt] = useState(() => Date.now());
  const [tool, setTool] = useState("breathe");

  const minutes = Math.floor(Math.max(0, now - startedAt) / 60000);
  const seconds = Math.floor(Math.max(0, now - startedAt) / 1000) % 60;
  const urgeProgress = Math.min(1, (now - startedAt) / (URGE_WINDOW_MIN * 60000));

  const header = (
    <div className="hero-gradient px-6 pt-7 pb-5 text-white">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">Riding the wave</p>
          <h2 className="font-display text-3xl font-semibold">This will pass.</h2>
        </div>
        <button onClick={onClose} className="-mt-1 -mr-2 rounded-full p-2 hover:bg-white/15" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-sm">
          <span className="tabular-nums">
            {minutes}:{String(seconds).padStart(2, "0")} surfed
          </span>
          <span className="text-white/80">Most urges fade in 15–30 min</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
          <motion.div className="h-full rounded-full bg-white" animate={{ width: `${urgeProgress * 100}%` }} transition={{ duration: 1, ease: "linear" }} />
        </div>
      </div>
    </div>
  );

  return (
    <Sheet onClose={onClose} header={header} size="lg">
      <div className="scrollbar-hide -mx-6 mt-2 flex gap-2 overflow-x-auto px-6">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`relative flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${tool === t.id ? "border-transparent text-white" : "border-slate-200 bg-white text-slate-600"}`}
          >
            {tool === t.id && <motion.span layoutId="sos-tool" className="absolute inset-0 rounded-full bg-teal-600" transition={spring} />}
            <t.icon className="relative h-4 w-4" /> <span className="relative">{t.label}</span>
          </button>
        ))}
        <button onClick={onTalkToCoach} className="chip-off flex shrink-0 items-center gap-1.5">
          <MessageCircleHeart className="h-4 w-4 text-amber-500" /> Talk it out
        </button>
        <button onClick={onDistract} className="chip-off flex shrink-0 items-center gap-1.5">
          <Gamepad2 className="h-4 w-4 text-violet-500" /> Distract me
        </button>
      </div>

      <div className="min-h-72">
        <AnimatePresence mode="wait">
          <motion.div
            key={tool}
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
            transition={{ duration: 0.22 }}
          >
            {tool === "breathe" && <Breathe startedAt={startedAt} now={now} />}
            {tool === "ground" && <Ground />}
            {tool === "why" && <MyWhy userData={userData} now={now} />}
            {tool === "reach" && <ReachOut contacts={userData.supportContacts || []} onOpenSettings={onOpenSettings} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-2 space-y-2 border-t border-slate-100 pt-4">
        <button onClick={onLogCraving} className="btn-primary w-full py-4">
          <CheckCircle2 className="h-5 w-5" /> The urge passed. Log it.
        </button>
        <button onClick={onSlip} className="w-full py-2 text-sm font-medium text-slate-500 hover:text-slate-800">
          I slipped
        </button>
      </div>
    </Sheet>
  );
}
