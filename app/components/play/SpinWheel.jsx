// components/play/SpinWheel.jsx
"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, RotateCw } from "lucide-react";
import { CHALLENGES } from "../../constants/play";
import { haptic } from "../../lib/haptics";

const WHEEL = 248;

export default function SpinWheel({ onComplete, challenges = CHALLENGES }) {
  const SEG = 360 / challenges.length;
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [done, setDone] = useState(false);

  const gradient = `conic-gradient(${challenges.map((c, i) => `${c.color} ${i * SEG}deg ${(i + 1) * SEG}deg`).join(", ")})`;

  const spin = () => {
    if (spinning) return;
    const target = Math.floor(Math.random() * challenges.length);
    const jitter = (Math.random() - 0.5) * SEG * 0.6;
    const landing = (360 - (target * SEG + SEG / 2) + jitter + 360) % 360;
    setRotation((r) => r - (r % 360) + 360 * 6 + landing);
    setSpinning(true);
    setResult(null);
    setDone(false);
    haptic(15);
    setTimeout(() => {
      setSpinning(false);
      setResult(challenges[target]);
      haptic([10, 30, 10]);
    }, 4200);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: WHEEL, height: WHEEL }}>
        <div className="absolute -top-2 left-1/2 z-10 -translate-x-1/2">
          <div className="h-0 w-0 border-x-[11px] border-t-[18px] border-x-transparent border-t-slate-900 drop-shadow" />
        </div>
        <motion.div
          className="absolute inset-0 rounded-full shadow-xl ring-4 ring-white"
          style={{ background: gradient }}
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: [0.12, 0.8, 0.18, 1] }}
        >
          {challenges.map((c, i) => {
            const angle = i * SEG + SEG / 2;
            return (
              <span
                key={c.label}
                className="absolute top-1/2 left-1/2 flex h-8 w-8 items-center justify-center text-white"
                style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${WHEEL * 0.36}px)` }}
              >
                <c.Icon className="h-5 w-5 drop-shadow" style={{ transform: `rotate(${-angle}deg)` }} />
              </span>
            );
          })}
        </motion.div>
        <motion.button
          onClick={spin}
          disabled={spinning}
          whileTap={{ scale: 0.9 }}
          className="absolute top-1/2 left-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white text-sm font-bold text-slate-900 shadow-lg ring-1 ring-slate-900/5"
        >
          <motion.span animate={spinning ? { rotate: 360 } : { rotate: 0 }} transition={spinning ? { duration: 0.8, repeat: Infinity, ease: "linear" } : {}}>
            <RotateCw className="h-5 w-5 text-teal-600" />
          </motion.span>
          {spinning ? "…" : "Spin"}
        </motion.button>
      </div>

      <div className="mt-5 min-h-24 w-full">
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={result.label}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 rounded-2xl p-3 ring-1 ring-slate-900/5"
              style={{ background: `${result.color}14` }}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: result.color }}>
                <result.Icon className="h-5 w-5" />
              </span>
              <p className="flex-1 font-semibold text-slate-900">{result.label}</p>
              <motion.button
                whileTap={{ scale: 0.92 }}
                disabled={done}
                onClick={() => {
                  setDone(true);
                  onComplete(result);
                }}
                className={`btn shrink-0 px-3 py-2 text-sm ${done ? "bg-teal-100 text-teal-800" : "bg-slate-900 text-white"}`}
              >
                <Check className="h-4 w-4" /> {done ? "Done" : "I did it"}
              </motion.button>
            </motion.div>
          )}
          {!result && !spinning && (
            <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-3 text-center text-sm text-slate-500">
              Spin for a quick, healthy thing to do right now.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
