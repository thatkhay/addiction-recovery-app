// components/ui/Logo.jsx
"use client";
import React from "react";
import { motion } from "motion/react";
import { Heart } from "lucide-react";

/** The heart mark with a slow heartbeat and ripple. */
export default function Logo({ size = 44, beat = true }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      {beat && (
        <motion.span
          className="absolute inset-0 rounded-[30%] bg-teal-500/40"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <span className="hero-gradient relative flex h-full w-full items-center justify-center rounded-[30%] shadow-lg shadow-teal-700/30">
        <motion.span
          animate={beat ? { scale: [1, 1.14, 1, 1.08, 1] } : undefined}
          transition={{ duration: 2.2, repeat: Infinity, times: [0, 0.12, 0.24, 0.36, 0.6] }}
          className="flex"
        >
          <Heart className="text-white" style={{ width: size * 0.48, height: size * 0.48 }} fill="currentColor" />
        </motion.span>
      </span>
    </span>
  );
}

export function Splash({ label = "Loading" }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5">
      <motion.div initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
        <Logo size={72} />
      </motion.div>
      <motion.p className="text-sm font-medium text-slate-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        {label}
      </motion.p>
    </div>
  );
}
