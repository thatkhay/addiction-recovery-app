// components/ui/Celebration.jsx
"use client";
import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useBursts } from "../../lib/celebrate";

function Burst({ pieces }) {
  return (
    <div className="pointer-events-none fixed top-[38%] left-1/2 z-[70]">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute block"
          style={{ width: p.w, height: p.round ? p.w : p.w * 0.45, background: p.color, borderRadius: p.round ? 999 : 2 }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
          animate={{ x: p.x, y: [p.y * 0.6, p.y, p.y + 160], opacity: [1, 1, 0], scale: 1, rotate: p.rotate }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], times: [0, 0.45, 1] }}
        />
      ))}
    </div>
  );
}

export default function Celebration() {
  const bursts = useBursts();
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <AnimatePresence>
      {bursts.map((b) => (
        <motion.div key={b.id} exit={{ opacity: 0 }}>
          <Burst pieces={b.pieces} />
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
