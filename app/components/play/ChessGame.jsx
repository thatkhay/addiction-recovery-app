// components/play/ChessGame.jsx
// You play White against a computer opponent (runs in a Web Worker).
"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Chess } from "chess.js";
import { ChessBishop, ChessKing, ChessKnight, ChessPawn, ChessQueen, ChessRook, Loader2, RotateCcw, Trophy, Undo2 } from "lucide-react";
import { haptic } from "../../lib/haptics";
import { spring } from "../ui/motion";

const ICONS = { p: ChessPawn, n: ChessKnight, b: ChessBishop, r: ChessRook, q: ChessQueen, k: ChessKing };
const FILES = "abcdefgh";
const sq = (r, c) => `${FILES[c]}${8 - r}`;
const rc = (square) => [8 - Number(square[1]), FILES.indexOf(square[0])];

function Piece({ piece, size = "h-[72%] w-[72%]" }) {
  const Icon = ICONS[piece.type];
  const white = piece.color === "w";
  return <Icon className={`${size} drop-shadow-sm`} fill={white ? "#ffffff" : "#1e293b"} stroke={white ? "#334155" : "#0f172a"} strokeWidth={1.6} />;
}

let requestId = 0;

export default function ChessGame({ onFinish }) {
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [selected, setSelected] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [level, setLevel] = useState("medium");
  const [result, setResult] = useState(null);
  const workerRef = useRef(null);

  useEffect(() => {
    try {
      workerRef.current = new Worker(new URL("../../lib/chess.worker.js", import.meta.url), { type: "module" });
    } catch {
      workerRef.current = null;
    }
    return () => workerRef.current?.terminate();
  }, []);

  const game = gameRef.current;

  const askEngine = (position, lvl) =>
    new Promise((resolve) => {
      const worker = workerRef.current;
      if (!worker) {
        import("../../lib/chessAI").then(({ bestMove }) => setTimeout(() => resolve(bestMove(position, lvl)), 30));
        return;
      }
      const id = ++requestId;
      const onMessage = (e) => {
        if (e.data.id !== id) return;
        worker.removeEventListener("message", onMessage);
        resolve(e.data.move);
      };
      worker.addEventListener("message", onMessage);
      worker.postMessage({ id, fen: position, level: lvl });
    });

  const finishIfOver = () => {
    if (!game.isGameOver()) return false;
    const outcome = game.isCheckmate() ? (game.turn() === "w" ? "loss" : "win") : "draw";
    setResult(outcome);
    onFinish?.(outcome);
    haptic(outcome === "win" ? [20, 60, 20] : 30);
    return true;
  };

  const sync = (move) => {
    setFen(game.fen());
    setLastMove(move ? { from: move.from, to: move.to, n: game.history().length } : null);
  };

  const engineTurn = async () => {
    setThinking(true);
    const position = game.fen();
    const [move] = await Promise.all([askEngine(position, level), new Promise((r) => setTimeout(r, 350))]);
    // Ignore stale replies (e.g. after undo or new game).
    if (game.fen() !== position || !move) return setThinking(false);
    const made = game.move(move);
    sync(made);
    setThinking(false);
    if (made.captured) haptic(12);
    finishIfOver();
  };

  const tap = (square) => {
    if (thinking || result || game.turn() !== "w") return;
    const piece = game.get(square);
    if (selected) {
      const move = game.moves({ square: selected, verbose: true }).find((m) => m.to === square);
      if (move) {
        const made = game.move({ from: selected, to: square, promotion: "q" });
        setSelected(null);
        sync(made);
        haptic(made.captured ? 14 : 6);
        if (!finishIfOver()) engineTurn();
        return;
      }
    }
    setSelected(piece && piece.color === "w" && selected !== square ? square : null);
  };

  const undo = () => {
    if (thinking) return;
    game.undo();
    if (game.turn() === "b") game.undo();
    setResult(null);
    setSelected(null);
    sync(null);
  };

  const restart = () => {
    gameRef.current = new Chess();
    setFen(gameRef.current.fen());
    setSelected(null);
    setLastMove(null);
    setResult(null);
    setThinking(false);
  };

  const board = new Chess(fen).board();
  const targets = selected ? game.moves({ square: selected, verbose: true }).map((m) => m.to) : [];
  const inCheck = game.inCheck();
  const kingSquare = inCheck ? board.flat().find((p) => p && p.type === "k" && p.color === game.turn())?.square : null;
  const captured = { w: [], b: [] };
  game.history({ verbose: true }).forEach((m) => m.captured && captured[m.color].push({ type: m.captured, color: m.color === "w" ? "b" : "w" }));

  const status = result
    ? { win: "Checkmate. You win!", loss: "Checkmate. The computer wins.", draw: "It’s a draw." }[result]
    : thinking
      ? "Thinking…"
      : inCheck
        ? "Check! Protect your king."
        : "Your move (White)";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative grid grid-cols-3 rounded-xl bg-slate-100 p-0.5 text-xs font-semibold">
          {["easy", "medium", "hard"].map((l) => (
            <button key={l} onClick={() => setLevel(l)} className={`relative rounded-lg px-3 py-1.5 capitalize ${level === l ? "text-slate-900" : "text-slate-500"}`}>
              {level === l && <motion.span layoutId="chess-level" className="absolute inset-0 rounded-lg bg-white shadow-sm" transition={spring} />}
              <span className="relative">{l}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <button onClick={undo} disabled={thinking || game.history().length === 0} className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-40">
            <Undo2 className="h-4 w-4" /> Undo
          </button>
          <button onClick={restart} className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-100">
            <RotateCcw className="h-4 w-4" /> New
          </button>
        </div>
      </div>

      <div className="flex min-h-6 items-center gap-0.5">
        {captured.b.map((p, i) => (
          <Piece key={i} piece={p} size="h-5 w-5" />
        ))}
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl shadow-lg ring-4 ring-teal-900/10 select-none">
        <div className="grid h-full grid-cols-8 grid-rows-8">
          {board.map((row, r) =>
            row.map((piece, c) => {
              const square = sq(r, c);
              const dark = (r + c) % 2 === 1;
              const isTarget = targets.includes(square);
              const highlight = selected === square || lastMove?.from === square || lastMove?.to === square;
              const moved = piece && lastMove?.to === square;
              const [fr, fc] = moved ? rc(lastMove.from) : [r, c];
              return (
                <button
                  key={square}
                  onClick={() => tap(square)}
                  aria-label={`${square}${piece ? ` ${piece.color === "w" ? "white" : "black"} ${piece.type}` : ""}`}
                  className={`relative flex items-center justify-center ${dark ? "bg-teal-700/80" : "bg-teal-50"}`}
                >
                  {highlight && <span className="absolute inset-0 bg-amber-300/45" />}
                  {kingSquare === square && <span className="absolute inset-0 bg-rose-500/50" />}
                  {c === 0 && <span className={`absolute top-0.5 left-1 text-[9px] font-bold ${dark ? "text-teal-50" : "text-teal-700"}`}>{8 - r}</span>}
                  {r === 7 && <span className={`absolute right-1 bottom-0 text-[9px] font-bold ${dark ? "text-teal-50" : "text-teal-700"}`}>{FILES[c]}</span>}
                  {piece && (
                    <motion.span
                      key={moved ? `m${lastMove.n}` : square}
                      className="relative z-10 flex h-full w-full items-center justify-center"
                      initial={moved ? { x: `${(fc - c) * 100}%`, y: `${(fr - r) * 100}%` } : false}
                      animate={{ x: 0, y: 0, scale: selected === square ? 1.12 : 1 }}
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    >
                      <Piece piece={piece} />
                    </motion.span>
                  )}
                  {isTarget && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute z-20 rounded-full ${piece ? "inset-1 border-4 border-slate-900/30" : "h-1/4 w-1/4 bg-slate-900/30"}`}
                    />
                  )}
                </button>
              );
            })
          )}
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

      <div className="flex min-h-6 items-center gap-0.5">
        {captured.w.map((p, i) => (
          <Piece key={i} piece={p} size="h-5 w-5" />
        ))}
      </div>

      <p className={`flex items-center justify-center gap-2 text-center text-sm font-semibold ${inCheck && !result ? "text-rose-600" : "text-slate-600"}`} aria-live="polite">
        {thinking && <Loader2 className="h-4 w-4 animate-spin" />}
        {status}
      </p>
    </div>
  );
}
