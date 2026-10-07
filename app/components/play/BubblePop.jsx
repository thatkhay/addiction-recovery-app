// components/play/BubblePop.jsx
// Pop floating bubbles for 45 seconds. Nothing is lost by missing one.
"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Play, RotateCcw, Trophy } from "lucide-react";
import { haptic } from "../../lib/haptics";

const ROUND_MS = 45000;
const COLORS = ["#5eead4", "#7dd3fc", "#c4b5fd", "#f9a8d4", "#fcd34d", "#86efac"];

export default function BubblePop({ best, onFinish }) {
  const [phase, setPhase] = useState("ready");
  const [bubbles, setBubbles] = useState([]);
  const [pops, setPops] = useState([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_MS);
  const [newBest, setNewBest] = useState(false);
  const areaRef = useRef(null);
  const scoreRef = useRef(0);
  const lastPopRef = useRef(-Infinity);
  const finishRef = useRef(onFinish);

  useEffect(() => {
    finishRef.current = onFinish;
  });

  useEffect(() => {
    if (phase !== "playing") return;
    const endAt = Date.now() + ROUND_MS;
    const spawn = setInterval(() => {
      setBubbles((list) => [
        ...list.slice(-24),
        {
          id: Math.random().toString(36).slice(2),
          x: 4 + Math.random() * 80,
          size: 44 + Math.random() * 44,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          duration: 5 + Math.random() * 4,
          drift: (Math.random() - 0.5) * 60,
        },
      ]);
    }, 520);
    const clock = setInterval(() => {
      const left = Math.max(0, endAt - Date.now());
      setTimeLeft(left);
      if (left === 0) {
        clearInterval(spawn);
        clearInterval(clock);
        setPhase("done");
        setBubbles([]);
        setNewBest(finishRef.current(scoreRef.current));
      }
    }, 200);
    return () => {
      clearInterval(spawn);
      clearInterval(clock);
    };
  }, [phase]);

  const start = () => {
    scoreRef.current = 0;
    setScore(0);
    setCombo(0);
    setTimeLeft(ROUND_MS);
    setNewBest(false);
    setPhase("playing");
  };

  const pop = (bubble, e) => {
    const rect = areaRef.current.getBoundingClientRect();
    const now = e.timeStamp;
    const nextCombo = now - lastPopRef.current < 900 ? combo + 1 : 1;
    lastPopRef.current = now;
    const points = nextCombo >= 5 ? 2 : 1;
    scoreRef.current += points;
    setScore(scoreRef.current);
    setCombo(nextCombo);
    setBubbles((list) => list.filter((b) => b.id !== bubble.id));
    setPops((list) => [...list, { id: bubble.id, x: e.clientX - rect.left, y: e.clientY - rect.top, color: bubble.color, points }]);
    setTimeout(() => setPops((list) => list.filter((p) => p.id !== bubble.id)), 700);
    haptic(8);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-900 tabular-nums">Score {score}</span>
        {combo >= 3 && phase === "playing" && (
          <motion.span key={combo} initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
            Combo ×{combo}
          </motion.span>
        )}
        <span className="text-slate-500 tabular-nums">{Math.ceil(timeLeft / 1000)}s</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-teal-500 transition-[width] duration-200" style={{ width: `${(timeLeft / ROUND_MS) * 100}%` }} />
      </div>

      <div ref={areaRef} className="relative h-[52dvh] min-h-80 touch-manipulation overflow-hidden rounded-3xl bg-linear-to-b from-sky-50 via-teal-50 to-emerald-50 select-none">
        <AnimatePresence>
          {bubbles.map((b) => (
            <motion.button
              key={b.id}
              aria-label="Bubble"
              onPointerDown={(e) => pop(b, e)}
              className="absolute rounded-full"
              style={{
                left: `${b.x}%`,
                width: b.size,
                height: b.size,
                background: `radial-gradient(circle at 30% 28%, rgba(255,255,255,0.95) 0 12%, ${b.color}cc 45%, ${b.color} 100%)`,
                boxShadow: `inset -6px -8px 14px ${b.color}, 0 6px 18px -6px ${b.color}`,
              }}
              initial={{ top: "100%", x: 0, scale: 0.6, opacity: 0 }}
              animate={{ top: "-20%", x: b.drift, scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0, transition: { duration: 0.15 } }}
              transition={{ top: { duration: b.duration, ease: "linear" }, x: { duration: b.duration, ease: "easeInOut" }, scale: { duration: 0.3 }, opacity: { duration: 0.3 } }}
              onAnimationComplete={(def) => def?.top === "-20%" && setBubbles((list) => list.filter((x) => x.id !== b.id))}
            />
          ))}
        </AnimatePresence>

        {pops.map((p) => (
          <React.Fragment key={p.id}>
            <motion.span
              className="pointer-events-none absolute rounded-full border-2"
              style={{ left: p.x - 30, top: p.y - 30, width: 60, height: 60, borderColor: p.color }}
              initial={{ scale: 0.3, opacity: 1 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
            <motion.span
              className="pointer-events-none absolute text-sm font-bold text-teal-700"
              style={{ left: p.x - 8, top: p.y - 10 }}
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.7 }}
            >
              +{p.points}
            </motion.span>
          </React.Fragment>
        ))}

        <AnimatePresence>
          {phase !== "playing" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 p-6 text-center backdrop-blur-sm">
              {phase === "done" ? (
                <>
                  {newBest && (
                    <motion.p initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-2 flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
                      <Trophy className="h-4 w-4" /> New best!
                    </motion.p>
                  )}
                  <p className="font-display text-5xl font-semibold text-slate-900">{score}</p>
                  <p className="mt-1 text-slate-600">bubbles popped</p>
                  <button onClick={start} className="btn-primary mt-5">
                    <RotateCcw className="h-4 w-4" /> Play again
                  </button>
                </>
              ) : (
                <>
                  <p className="font-display text-2xl font-semibold text-slate-900">Pop as many as you can</p>
                  <p className="mt-1 max-w-xs text-sm text-slate-600">45 seconds. Pop quickly in a row for combos.{best ? ` Your best: ${best}.` : ""}</p>
                  <button onClick={start} className="btn-primary mt-5">
                    <Play className="h-4 w-4" fill="currentColor" /> Start
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
