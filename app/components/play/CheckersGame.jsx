// components/play/CheckersGame.jsx
// You play red (bottom) against the computer. Captures are mandatory.
"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Crown, RotateCcw, Trophy } from "lucide-react";
import { applyMove, computerMove, legalMoves, newBoard } from "../../lib/checkers";
import { haptic } from "../../lib/haptics";
import { spring } from "../ui/motion";

export default function CheckersGame({ onFinish }) {
  const [pieces, setPieces] = useState(newBoard);
  const [selected, setSelected] = useState(null);
  const [turn, setTurn] = useState("r");
  const [level, setLevel] = useState("medium");
  const [result, setResult] = useState(null);
  const [lastPath, setLastPath] = useState([]);

  const myMoves = turn === "r" && !result ? legalMoves(pieces, "r") : [];
  const mustCapture = myMoves.some((m) => m.captured.length);
  const selectedMoves = myMoves.filter((m) => m.id === selected);
  const movable = new Set(myMoves.map((m) => m.id));

  const end = (outcome) => {
    setResult(outcome);
    onFinish?.(outcome);
    haptic(outcome === "win" ? [20, 60, 20] : 30);
  };

  const computerTurn = (board) => {
    setTurn("b");
    setTimeout(() => {
      const move = computerMove(board, level);
      if (!move) return end("win");
      const next = applyMove(board, move);
      setPieces(next);
      setLastPath([move.from, ...move.path]);
      if (move.captured.length) haptic(12);
      setTurn("r");
      if (!legalMoves(next, "r").length) end("loss");
    }, 450);
  };

  const tapSquare = (r, c) => {
    if (turn !== "r" || result) return;
    const piece = pieces.find((p) => p.r === r && p.c === c);
    if (piece?.color === "r") {
      setSelected(movable.has(piece.id) && selected !== piece.id ? piece.id : null);
      if (!movable.has(piece.id) && mustCapture) haptic([5, 30, 5]);
      return;
    }
    const move = selectedMoves.find((m) => {
      const [er, ec] = m.path[m.path.length - 1];
      return er === r && ec === c;
    });
    if (!move) return;
    const next = applyMove(pieces, move);
    setPieces(next);
    setSelected(null);
    setLastPath([move.from, ...move.path]);
    haptic(move.captured.length ? 14 : 6);
    if (!legalMoves(next, "b").length) return end("win");
    computerTurn(next);
  };

  const restart = () => {
    setPieces(newBoard());
    setSelected(null);
    setTurn("r");
    setResult(null);
    setLastPath([]);
  };

  const destinations = selectedMoves.map((m) => m.path[m.path.length - 1]);
  const counts = { r: pieces.filter((p) => p.color === "r").length, b: pieces.filter((p) => p.color === "b").length };
  const status = result
    ? result === "win" ? "You win!" : "The computer wins."
    : turn === "b"
      ? "Thinking…"
      : mustCapture
        ? "You must capture. Jumps are mandatory."
        : "Your move (red)";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative grid grid-cols-3 rounded-xl bg-slate-100 p-0.5 text-xs font-semibold">
          {["easy", "medium", "hard"].map((l) => (
            <button key={l} onClick={() => setLevel(l)} className={`relative rounded-lg px-3 py-1.5 capitalize ${level === l ? "text-slate-900" : "text-slate-500"}`}>
              {level === l && <motion.span layoutId="checkers-level" className="absolute inset-0 rounded-lg bg-white shadow-sm" transition={spring} />}
              <span className="relative">{l}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold">
          <span className="flex items-center gap-1 text-rose-600"><span className="h-3 w-3 rounded-full bg-rose-500" /> {counts.r}</span>
          <span className="flex items-center gap-1 text-slate-700"><span className="h-3 w-3 rounded-full bg-slate-800" /> {counts.b}</span>
          <button onClick={restart} className="flex items-center gap-1 rounded-xl px-2 py-1.5 text-slate-500 hover:bg-slate-100">
            <RotateCcw className="h-4 w-4" /> New
          </button>
        </div>
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl shadow-lg ring-4 ring-amber-900/15 select-none">
        <div className="grid h-full grid-cols-8 grid-rows-8">
          {Array.from({ length: 64 }, (_, i) => {
            const r = Math.floor(i / 8), c = i % 8;
            const dark = (r + c) % 2 === 1;
            const isDest = destinations.some(([dr, dc]) => dr === r && dc === c);
            const onPath = lastPath.some(([pr, pc]) => pr === r && pc === c);
            return (
              <button key={i} onClick={() => tapSquare(r, c)} aria-label={`Row ${r + 1}, column ${c + 1}`} className={`relative ${dark ? "bg-amber-800/85" : "bg-amber-50"}`}>
                {onPath && dark && <span className="absolute inset-0 bg-amber-400/30" />}
                {isDest && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-[35%] rounded-full bg-white/70" />}
              </button>
            );
          })}
        </div>

        <div className="pointer-events-none absolute inset-0">
          <AnimatePresence>
            {pieces.map((p) => {
              const canMove = movable.has(p.id);
              return (
                <motion.div
                  key={p.id}
                  className="absolute flex items-center justify-center"
                  style={{ width: "12.5%", height: "12.5%" }}
                  initial={false}
                  animate={{ left: `${p.c * 12.5}%`, top: `${p.r * 12.5}%`, scale: selected === p.id ? 1.12 : 1 }}
                  exit={{ scale: 0, opacity: 0, transition: { duration: 0.25 } }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                >
                  <span
                    className={`flex h-[78%] w-[78%] items-center justify-center rounded-full shadow-[inset_0_-4px_0_rgba(0,0,0,0.25),0_3px_6px_rgba(0,0,0,0.3)] ${
                      p.color === "r" ? "bg-linear-to-br from-rose-400 to-rose-600" : "bg-linear-to-br from-slate-600 to-slate-900"
                    } ${selected === p.id ? "ring-4 ring-amber-300" : canMove && mustCapture ? "ring-2 ring-amber-300/80" : ""}`}
                  >
                    {p.king && <Crown className="h-1/2 w-1/2 text-amber-300" fill="currentColor" />}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/80 p-6 text-center backdrop-blur-sm">
              {result === "win" && <Trophy className="mb-2 h-10 w-10 text-amber-500" />}
              <p className="font-display text-3xl font-semibold text-slate-900">{status}</p>
              <button onClick={restart} className="btn-primary mt-5">
                <RotateCcw className="h-4 w-4" /> Play again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className={`text-center text-sm font-semibold ${mustCapture && !result ? "text-amber-700" : "text-slate-600"}`} aria-live="polite">
        {status}
      </p>
    </div>
  );
}
