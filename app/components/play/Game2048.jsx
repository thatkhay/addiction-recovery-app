// components/play/Game2048.jsx
// Arrow keys or swipe. Tiles slide and merge.
"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RotateCcw, Trophy } from "lucide-react";
import { haptic } from "../../lib/haptics";

const SIZE = 4;
let nextId = 1;

const COLORS = {
  2: "bg-slate-100 text-slate-700",
  4: "bg-teal-50 text-teal-800",
  8: "bg-teal-200 text-teal-900",
  16: "bg-teal-400 text-white",
  32: "bg-emerald-500 text-white",
  64: "bg-emerald-600 text-white",
  128: "bg-amber-300 text-amber-950",
  256: "bg-amber-400 text-white",
  512: "bg-orange-500 text-white",
  1024: "bg-rose-500 text-white",
  2048: "bg-violet-600 text-white",
};

function addRandom(tiles) {
  const empty = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (!tiles.some((t) => t.r === r && t.c === c)) empty.push({ r, c });
  if (!empty.length) return tiles;
  const spot = empty[Math.floor(Math.random() * empty.length)];
  return [...tiles, { id: nextId++, value: Math.random() < 0.9 ? 2 : 4, ...spot, isNew: true }];
}

const fresh = () => addRandom(addRandom([]));

function slide(tiles, dir) {
  const horizontal = dir === "left" || dir === "right";
  const forward = dir === "left" || dir === "up";
  const next = [];
  let gained = 0;
  let moved = false;
  for (let i = 0; i < SIZE; i++) {
    const line = tiles
      .filter((t) => (horizontal ? t.r === i : t.c === i))
      .sort((a, b) => {
        const ka = horizontal ? a.c : a.r;
        const kb = horizontal ? b.c : b.r;
        return forward ? ka - kb : kb - ka;
      });
    let pos = 0;
    let last = null;
    for (const t of line) {
      if (last && last.value === t.value && !last.merged) {
        last.value *= 2;
        last.merged = true;
        gained += last.value;
        moved = true;
        continue;
      }
      const p = forward ? pos : SIZE - 1 - pos;
      pos++;
      const placed = { ...t, isNew: false, merged: false, r: horizontal ? i : p, c: horizontal ? p : i };
      if (placed.r !== t.r || placed.c !== t.c) moved = true;
      next.push(placed);
      last = placed;
    }
  }
  return { tiles: next, gained, moved };
}

function canMove(tiles) {
  if (tiles.length < SIZE * SIZE) return true;
  return tiles.some((t) => tiles.some((u) => u.value === t.value && Math.abs(u.r - t.r) + Math.abs(u.c - t.c) === 1));
}

export default function Game2048({ best, onFinish }) {
  const [tiles, setTiles] = useState(fresh);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(null); // { newBest }
  const start = useRef(null);
  const state = useRef({ tiles, score, over });

  useEffect(() => {
    state.current = { tiles, score, over };
  });

  const move = (dir) => {
    const { tiles: current, score: s, over: done } = state.current;
    if (done) return;
    const result = slide(current, dir);
    if (!result.moved) return;
    const withNew = addRandom(result.tiles);
    const total = s + result.gained;
    setTiles(withNew);
    setScore(total);
    if (result.gained) haptic(8);
    if (!canMove(withNew)) setOver({ newBest: onFinish(total) });
  };

  const moveRef = useRef(move);
  useEffect(() => {
    moveRef.current = move;
  });

  useEffect(() => {
    const keys = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
    const onKey = (e) => {
      if (!keys[e.key]) return;
      e.preventDefault();
      moveRef.current(keys[e.key]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const restart = () => {
    setTiles(fresh());
    setScore(0);
    setOver(null);
  };

  const onPointerUp = (e) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    start.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
  };

  const top = tiles.reduce((m, t) => Math.max(m, t.value), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="flex gap-2">
          <span className="rounded-xl bg-slate-100 px-3 py-1.5 font-semibold text-slate-900 tabular-nums">Score {score}</span>
          <span className="rounded-xl bg-amber-50 px-3 py-1.5 font-semibold text-amber-800 tabular-nums">Best {Math.max(best || 0, score)}</span>
        </div>
        <button onClick={restart} className="flex items-center gap-1 rounded-xl px-2 py-1.5 font-semibold text-slate-500 hover:bg-slate-100" aria-label="New game">
          <RotateCcw className="h-4 w-4" /> New
        </button>
      </div>
      <div
        className="relative mx-auto aspect-square w-full max-w-sm touch-none rounded-3xl bg-slate-200/70 p-2 select-none"
        onPointerDown={(e) => (start.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={onPointerUp}
        role="application"
        aria-label={`2048 board. Highest tile ${top}. Use arrow keys or swipe.`}
      >
        <div className="grid h-full grid-cols-4 grid-rows-4 gap-2">
          {Array.from({ length: 16 }, (_, i) => (
            <div key={i} className="rounded-2xl bg-white/50" />
          ))}
        </div>
        <div className="absolute inset-2">
          {tiles.map((t) => (
            <motion.div
              key={t.id}
              className="absolute p-1"
              style={{ width: "25%", height: "25%" }}
              initial={t.isNew ? { left: `${t.c * 25}%`, top: `${t.r * 25}%`, scale: 0 } : false}
              animate={{ left: `${t.c * 25}%`, top: `${t.r * 25}%`, scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 38 }}
            >
              <motion.div
                key={t.value}
                initial={t.isNew ? false : { scale: 1.18 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={`font-display flex h-full w-full items-center justify-center rounded-2xl font-semibold shadow-sm ${COLORS[t.value] || "bg-slate-800 text-white"} ${t.value >= 1024 ? "text-xl" : t.value >= 128 ? "text-2xl" : "text-3xl"}`}
              >
                {t.value}
              </motion.div>
            </motion.div>
          ))}
        </div>
        <AnimatePresence>
          {over && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-white/80 text-center backdrop-blur-sm">
              {over.newBest && (
                <p className="mb-2 flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
                  <Trophy className="h-4 w-4" /> New best!
                </p>
              )}
              <p className="font-display text-4xl font-semibold text-slate-900">{score}</p>
              <p className="mt-1 text-slate-600">No moves left</p>
              <button onClick={restart} className="btn-primary mt-5">
                <RotateCcw className="h-4 w-4" /> Play again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="text-center text-xs text-slate-500">Swipe or use arrow keys. Join matching numbers to reach 2048.</p>
    </div>
  );
}
