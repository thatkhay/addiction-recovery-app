// lib/checkers.js
// English draughts / American checkers on an 8x8 board.
// Red (you) moves up from the bottom; black moves down. Captures are mandatory,
// multi-jumps continue, and reaching the far row crowns a king (ending the move).

let uid = 1;

export function newBoard() {
  const pieces = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 0) continue;
      if (r < 3) pieces.push({ id: uid++, color: "b", king: false, r, c });
      if (r > 4) pieces.push({ id: uid++, color: "r", king: false, r, c });
    }
  return pieces;
}

const at = (pieces, r, c) => pieces.find((p) => p.r === r && p.c === c);
const inside = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
const dirs = (p) => (p.king ? [-1, 1] : p.color === "r" ? [-1] : [1]);

function jumpsFrom(pieces, piece, path = [], taken = []) {
  const results = [];
  for (const dr of dirs(piece))
    for (const dc of [-1, 1]) {
      const mr = piece.r + dr, mc = piece.c + dc;
      const lr = piece.r + 2 * dr, lc = piece.c + 2 * dc;
      if (!inside(lr, lc)) continue;
      const mid = at(pieces, mr, mc);
      if (!mid || mid.color === piece.color || taken.includes(mid.id) || at(pieces, lr, lc)) continue;
      const moved = { ...piece, r: lr, c: lc };
      const crowned = !piece.king && (lr === 0 || lr === 7);
      const nextPath = [...path, [lr, lc]];
      const nextTaken = [...taken, mid.id];
      // Temporarily vacate the start square so later jumps can pass through it.
      const others = pieces.filter((p) => p.id !== piece.id);
      const further = crowned ? [] : jumpsFrom([...others, moved], moved, nextPath, nextTaken);
      results.push(...(further.length ? further : [{ path: nextPath, captured: nextTaken }]));
    }
  return results;
}

/** All legal moves for `color`: [{ id, from:[r,c], path:[[r,c]...], captured:[ids] }] */
export function legalMoves(pieces, color) {
  const own = pieces.filter((p) => p.color === color);
  const jumps = own.flatMap((p) => jumpsFrom(pieces, p).map((j) => ({ id: p.id, from: [p.r, p.c], ...j })));
  if (jumps.length) return jumps;
  const steps = [];
  for (const p of own)
    for (const dr of dirs(p))
      for (const dc of [-1, 1]) {
        const r = p.r + dr, c = p.c + dc;
        if (inside(r, c) && !at(pieces, r, c)) steps.push({ id: p.id, from: [p.r, p.c], path: [[r, c]], captured: [] });
      }
  return steps;
}

export function applyMove(pieces, move) {
  const [r, c] = move.path[move.path.length - 1];
  return pieces
    .filter((p) => !move.captured.includes(p.id))
    .map((p) => (p.id === move.id ? { ...p, r, c, king: p.king || (p.color === "r" ? r === 0 : r === 7) } : p));
}

function evaluate(pieces) {
  let score = 0;
  for (const p of pieces) {
    const v = p.king ? 175 : 100 + (p.color === "b" ? p.r : 7 - p.r) * 4;
    const center = p.c >= 2 && p.c <= 5 ? 5 : 0;
    score += (p.color === "b" ? 1 : -1) * (v + center);
  }
  return score; // positive = good for black (computer)
}

function search(pieces, depth, alpha, beta, color) {
  const moves = legalMoves(pieces, color);
  if (!moves.length) return color === "b" ? -100000 - depth : 100000 + depth;
  if (depth === 0) return evaluate(pieces);
  if (color === "b") {
    let best = -Infinity;
    for (const m of moves) {
      best = Math.max(best, search(applyMove(pieces, m), depth - 1, alpha, beta, "r"));
      alpha = Math.max(alpha, best);
      if (alpha >= beta) break;
    }
    return best;
  }
  let best = Infinity;
  for (const m of moves) {
    best = Math.min(best, search(applyMove(pieces, m), depth - 1, alpha, beta, "b"));
    beta = Math.min(beta, best);
    if (alpha >= beta) break;
  }
  return best;
}

export const CHECKERS_DEPTH = { easy: 2, medium: 4, hard: 6 };

export function computerMove(pieces, level = "medium") {
  const moves = legalMoves(pieces, "b");
  if (!moves.length) return null;
  const depth = CHECKERS_DEPTH[level] ?? 4;
  const scored = moves.map((m) => ({ m, s: search(applyMove(pieces, m), depth - 1, -Infinity, Infinity, "r") }));
  scored.sort((a, b) => b.s - a.s);
  const slack = level === "easy" ? 60 : 0;
  const top = scored.filter((x) => x.s >= scored[0].s - slack);
  return top[Math.floor(Math.random() * top.length)].m;
}
