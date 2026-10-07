// components/NowPlaying.jsx
// Floating pill while an ambient sound plays anywhere in the app.
"use client";
import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Square } from "lucide-react";
import { SOUNDS, stopAmbient, useAmbient } from "../lib/ambient";

export function Equalizer({ className = "bg-white" }) {
  return (
    <span className="flex h-4 items-end gap-0.5" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className={`w-0.5 rounded-full ${className}`}
          animate={{ height: ["30%", "100%", "50%", "80%", "30%"] }}
          transition={{ duration: 1.2 + i * 0.15, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
        />
      ))}
    </span>
  );
}

export default function NowPlaying() {
  const { playing } = useAmbient();
  const sound = SOUNDS.find((s) => s.id === playing);
  return (
    <AnimatePresence>
      {sound && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-24 left-4 z-30 flex items-center gap-2 rounded-full bg-slate-900/90 py-2 pr-2 pl-3.5 text-sm font-medium text-white shadow-xl backdrop-blur lg:bottom-6 lg:left-auto lg:right-6"
        >
          <Equalizer />
          {sound.label}
          <button onClick={stopAmbient} className="rounded-full bg-white/15 p-1.5 hover:bg-white/25" aria-label={`Stop ${sound.label}`}>
            <Square className="h-3 w-3" fill="currentColor" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
