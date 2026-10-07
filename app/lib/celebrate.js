// lib/celebrate.js
// Fire a confetti burst from anywhere: celebrate() or celebrate("big").
import { useSyncExternalStore } from "react";

let bursts = [];
const listeners = new Set();
const EMPTY = [];
const emit = () => listeners.forEach((l) => l());

const COLORS = ["#0d9488", "#10b981", "#f59e0b", "#8b5cf6", "#0ea5e9", "#f43f5e"];

function makePieces(size) {
  const count = size === "big" ? 54 : 26;
  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const dist = (size === "big" ? 220 : 140) * (0.5 + Math.random() * 0.6);
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist - 40,
      rotate: Math.random() * 540 - 270,
      color: COLORS[i % COLORS.length],
      round: i % 3 === 0,
      w: 6 + Math.random() * 6,
    };
  });
}

export function celebrate(size = "small") {
  const id = Date.now() + Math.random();
  bursts = [...bursts, { id, pieces: makePieces(size) }];
  emit();
  setTimeout(() => {
    bursts = bursts.filter((b) => b.id !== id);
    emit();
  }, 1800);
}

export function useBursts() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => bursts,
    () => EMPTY
  );
}
