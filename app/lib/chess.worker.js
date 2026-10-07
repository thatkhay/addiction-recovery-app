// lib/chess.worker.js
// Runs the chess opponent off the main thread so the board stays smooth.
import { bestMove } from "./chessAI";

self.onmessage = (event) => {
  const { id, fen, level } = event.data;
  const move = bestMove(fen, level);
  self.postMessage({ id, move: move && { from: move.from, to: move.to, promotion: move.promotion } });
};
