// components/play/MemoryMatch.jsx
"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bird, Cloud, Coffee, Fish, Flower2, Heart, Leaf, Moon, Mountain, Music, RotateCcw, Star, Sun, Trophy } from "lucide-react";
import { haptic } from "../../lib/haptics";

const ICONS = [Heart, Star, Sun, Moon, Leaf, Flower2, Fish, Bird, Cloud, Mountain, Coffee, Music];
const TINTS = ["text-rose-500", "text-amber-500", "text-orange-500", "text-indigo-500", "text-emerald-500", "text-pink-500", "text-sky-500", "text-teal-500", "text-cyan-500", "text-violet-500", "text-yellow-600", "text-fuchsia-500"];

function deal() {
  const picks = [...ICONS.keys()].sort(() => Math.random() - 0.5).slice(0, 8);
  return [...picks, ...picks]
    .sort(() => Math.random() - 0.5)
    .map((icon, i) => ({ id: i, icon, matched: false }));
}

export default function MemoryMatch({ best, onFinish }) {
  const [cards, setCards] = useState(deal);
  const [open, setOpen] = useState([]);
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // { moves, newBest }

  const restart = () => {
    setCards(deal());
    setOpen([]);
    setMoves(0);
    setResult(null);
  };

  const flip = (card) => {
    if (busy || card.matched || open.includes(card.id) || result) return;
    haptic(6);
    const next = [...open, card.id];
    setOpen(next);
    if (next.length < 2) return;

    const total = moves + 1;
    setMoves(total);
    const [a, b] = next.map((id) => cards.find((c) => c.id === id));
    setBusy(true);
    if (a.icon === b.icon) {
      setTimeout(() => {
        const updated = cards.map((c) => (c.id === a.id || c.id === b.id ? { ...c, matched: true } : c));
        setCards(updated);
        setOpen([]);
        setBusy(false);
        haptic([10, 40, 10]);
        if (updated.every((c) => c.matched)) setResult({ moves: total, newBest: onFinish(total) });
      }, 350);
    } else {
      setTimeout(() => {
        setOpen([]);
        setBusy(false);
      }, 850);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-900 tabular-nums">{moves} moves</span>
        <span className="text-slate-500">{best ? `Best: ${best} moves` : "Find all 8 pairs"}</span>
      </div>
      <div className="relative">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2 sm:gap-3" style={{ perspective: 900 }}>
          {cards.map((card) => {
            const Icon = ICONS[card.icon];
            const faceUp = card.matched || open.includes(card.id);
            return (
              <button key={card.id} onClick={() => flip(card)} className="relative aspect-square" aria-label={faceUp ? "Card" : "Hidden card"}>
                <motion.div
                  className="absolute inset-0"
                  style={{ transformStyle: "preserve-3d" }}
                  animate={{ rotateY: faceUp ? 180 : 0, scale: card.matched ? 0.94 : 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                >
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-linear-to-br from-teal-500 to-emerald-600 shadow-md" style={{ backfaceVisibility: "hidden" }}>
                    <span className="h-3 w-3 rounded-full bg-white/40" />
                  </div>
                  <div
                    className={`absolute inset-0 flex items-center justify-center rounded-2xl bg-white shadow-md ring-1 ${card.matched ? "ring-teal-300" : "ring-slate-200"}`}
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <Icon className={`h-8 w-8 ${TINTS[card.icon]}`} strokeWidth={2} />
                  </div>
                </motion.div>
              </button>
            );
          })}
        </div>
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-white/80 text-center backdrop-blur-sm">
              {result.newBest && (
                <p className="mb-2 flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
                  <Trophy className="h-4 w-4" /> New best!
                </p>
              )}
              <p className="font-display text-4xl font-semibold text-slate-900">All matched</p>
              <p className="mt-1 text-slate-600">in {result.moves} moves</p>
              <button onClick={restart} className="btn-primary mt-5">
                <RotateCcw className="h-4 w-4" /> Play again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
