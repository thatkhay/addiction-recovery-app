// lib/chessAI.js
// A small chess opponent: alpha-beta search over chess.js moves with
// material + piece-square evaluation. Easy is deliberately sloppy.
import { Chess } from "chess.js";

const VALUE = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

// Piece-square tables from White's point of view, rank 8 first (index 0 = a8).
const PST = {
  p: [0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10, 5,5,10,25,25,10,5,5, 0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5, 5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0],
  n: [-50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30, -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30, -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50],
  b: [-20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10, -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10, -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20],
  r: [0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0],
  q: [-20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5, 0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10, -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20],
  k: [-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10, 20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20],
};

/** Score from White's perspective. */
function evaluate(game) {
  let score = 0;
  const board = game.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = board[r][c];
      if (!sq) continue;
      const idx = sq.color === "w" ? r * 8 + c : (7 - r) * 8 + c;
      const v = VALUE[sq.type] + PST[sq.type][idx];
      score += sq.color === "w" ? v : -v;
    }
  }
  return score;
}

const ordered = (moves) => moves.sort((a, b) => (b.captured ? VALUE[b.captured] - VALUE[b.piece] / 10 : -1) - (a.captured ? VALUE[a.captured] - VALUE[a.piece] / 10 : -1));

class Timeout extends Error {}

function negamax(game, depth, alpha, beta, sign, deadline) {
  if (Date.now() > deadline) throw new Timeout();
  if (game.isCheckmate()) return -100000 - depth;
  if (game.isDraw() || game.isStalemate()) return 0;
  if (depth === 0) return sign * evaluate(game);
  let best = -Infinity;
  for (const move of ordered(game.moves({ verbose: true }))) {
    game.move(move);
    const score = -negamax(game, depth - 1, -beta, -alpha, -sign, deadline);
    game.undo();
    if (score > best) best = score;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

export const LEVELS = { easy: 1, medium: 2, hard: 3 };

/**
 * Best move (verbose chess.js move) for the side to move in `fen`.
 * Iterative deepening: searches depth 1, 2, ... up to the level, and returns
 * the deepest fully searched result within `budgetMs`.
 */
export function bestMove(fen, level = "medium", budgetMs = 1200) {
  const game = new Chess(fen);
  const moves = game.moves({ verbose: true });
  if (!moves.length) return null;
  const maxDepth = LEVELS[level] ?? 2;
  const sign = game.turn() === "w" ? 1 : -1;
  const deadline = Date.now() + budgetMs;

  let scored = null;
  for (let depth = 1; depth <= maxDepth; depth++) {
    try {
      // Search the previous best line first for better pruning.
      const order = scored ? scored.map((s) => s.move) : ordered(moves);
      const next = order.map((move) => {
        game.move(move);
        try {
          return { move, score: -negamax(game, depth - 1, -Infinity, Infinity, -sign, deadline) };
        } finally {
          game.undo();
        }
      });
      scored = next.sort((a, b) => b.score - a.score);
      if (scored[0].score > 90000) break; // found a forced mate
    } catch (error) {
      if (!(error instanceof Timeout)) throw error;
      break;
    }
  }

  if (level === "easy") {
    // Pick among the top few, sometimes a clearly worse move, so beginners can win.
    const pool = scored.slice(0, Math.min(scored.length, Math.random() < 0.3 ? 6 : 3));
    return pool[Math.floor(Math.random() * pool.length)].move;
  }
  const top = scored.filter((s) => s.score >= scored[0].score - 10);
  return top[Math.floor(Math.random() * top.length)].move;
}
