// components/play/SnakeGame.jsx
// Classic snake. Arrow keys / WASD, swipe, or the on-screen pad.
"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Apple, Play, RotateCcw, Trophy } from "lucide-react";
import { haptic } from "../../lib/haptics";

const N = 17;
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };

function randomFood(snake) {
  for (;;) {
    const f = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)];
    if (!snake.some(([x, y]) => x === f[0] && y === f[1])) return f;
  }
}

const START = () => {
  const snake = [[8, 8], [7, 8], [6, 8]];
  return { snake, food: [12, 8], dir: "right", score: 0 };
};

function Pad({ dir, Icon, onTurn }) {
  return (
    <motion.button whileTap={{ scale: 0.85 }} onPointerDown={() => onTurn(dir)} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 active:bg-teal-100" aria-label={dir}>
      <Icon className="h-6 w-6" />
    </motion.button>
  );
}

export default function SnakeGame({ best, onFinish }) {
  const [state, setState] = useState(START);
  const [phase, setPhase] = useState("ready"); // ready | playing | over
  const [newBest, setNewBest] = useState(false);
  const queue = useRef([]);
  const live = useRef(state);
  const finishRef = useRef(onFinish);
  const touch = useRef(null);

  useEffect(() => {
    finishRef.current = onFinish;
    live.current = state;
  });

  const turn = (dir) => {
    const last = queue.current[queue.current.length - 1] || live.current.dir;
    if (dir !== last && dir !== OPPOSITE[last] && queue.current.length < 3) queue.current.push(dir);
  };

  useEffect(() => {
    if (phase !== "playing") return;
    let timer;
    const tick = () => {
      const s = live.current;
      const dir = queue.current.shift() || s.dir;
      const [dx, dy] = DIRS[dir];
      const head = [s.snake[0][0] + dx, s.snake[0][1] + dy];
      const ate = head[0] === s.food[0] && head[1] === s.food[1];
      const body = ate ? s.snake : s.snake.slice(0, -1);
      const dead = head[0] < 0 || head[1] < 0 || head[0] >= N || head[1] >= N || body.some(([x, y]) => x === head[0] && y === head[1]);
      if (dead) {
        haptic([30, 50, 30]);
        setPhase("over");
        setNewBest(finishRef.current(s.score));
        return;
      }
      const snake = [head, ...body];
      const next = { snake, dir, food: ate ? randomFood(snake) : s.food, score: s.score + (ate ? 1 : 0) };
      if (ate) haptic(10);
      live.current = next;
      setState(next);
      timer = setTimeout(tick, Math.max(65, 150 - next.score * 4));
    };
    timer = setTimeout(tick, 150);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    const keys = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right" };
    const onKey = (e) => {
      const dir = keys[e.key];
      if (!dir) return;
      e.preventDefault();
      turn(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const start = () => {
    const s = START();
    live.current = s;
    queue.current = [];
    setState(s);
    setNewBest(false);
    setPhase("playing");
  };

  const cell = 100 / N;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-semibold text-slate-900 tabular-nums">
          <Apple className="h-4 w-4 text-rose-500" /> {state.score}
        </span>
        <span className="text-slate-500">Best {Math.max(best || 0, state.score)}</span>
      </div>

      <div
        className="relative mx-auto aspect-square w-full max-w-md touch-none overflow-hidden rounded-3xl bg-emerald-950 select-none"
        onPointerDown={(e) => (touch.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => {
          if (!touch.current) return;
          const dx = e.clientX - touch.current.x, dy = e.clientY - touch.current.y;
          touch.current = null;
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
          turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
        }}
      >
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, #34d399 1px, transparent 1px)", backgroundSize: `${cell}% ${cell}%` }} />
        <motion.span
          key={`${state.food[0]}-${state.food[1]}`}
          className="absolute flex items-center justify-center"
          style={{ left: `${state.food[0] * cell}%`, top: `${state.food[1] * cell}%`, width: `${cell}%`, height: `${cell}%` }}
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ scale: { duration: 1, repeat: Infinity } }}
        >
          <span className="h-[70%] w-[70%] rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]" />
        </motion.span>
        {state.snake.map(([x, y], i) => (
          <span
            key={i}
            className="absolute p-[1px]"
            style={{ left: `${x * cell}%`, top: `${y * cell}%`, width: `${cell}%`, height: `${cell}%` }}
          >
            <span
              className={`block h-full w-full ${i === 0 ? "rounded-md bg-emerald-300" : "rounded-sm bg-emerald-400"}`}
              style={{ opacity: Math.max(0.45, 1 - i * 0.025) }}
            />
          </span>
        ))}

        <AnimatePresence>
          {phase !== "playing" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/70 p-6 text-center text-white backdrop-blur-sm">
              {phase === "over" ? (
                <>
                  {newBest && <p className="mb-2 flex items-center gap-1.5 rounded-full bg-amber-300 px-3 py-1 text-sm font-bold text-amber-950"><Trophy className="h-4 w-4" /> New best!</p>}
                  <p className="font-display text-5xl font-semibold">{state.score}</p>
                  <p className="mt-1 text-emerald-100">apples eaten</p>
                  <button onClick={start} className="btn mt-5 bg-white text-emerald-900"><RotateCcw className="h-4 w-4" /> Play again</button>
                </>
              ) : (
                <>
                  <p className="font-display text-2xl font-semibold">Eat the apples. Don’t bite yourself.</p>
                  <p className="mt-1 text-sm text-emerald-100">Swipe, use the arrows below, or your keyboard.</p>
                  <button onClick={start} className="btn mt-5 bg-white text-emerald-900"><Play className="h-4 w-4" fill="currentColor" /> Start</button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mx-auto grid w-48 grid-cols-3 gap-2 lg:hidden">
        <span />
        <Pad onTurn={turn} dir="up" Icon={ArrowUp} />
        <span />
        <Pad onTurn={turn} dir="left" Icon={ArrowLeft} />
        <Pad onTurn={turn} dir="down" Icon={ArrowDown} />
        <Pad onTurn={turn} dir="right" Icon={ArrowRight} />
      </div>
    </div>
  );
}
