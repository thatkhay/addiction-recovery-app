// components/modals/CheckInModal.jsx
// Daily check-in (mood + pledge) or a quick mood log.
"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { HandHeart } from "lucide-react";
import Sheet from "../ui/Sheet";
import { MOODS } from "../../hooks/useMood";

export default function CheckInModal({ mode = "checkin", addiction, onClose, onSave }) {
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState("");
  const isCheckin = mode === "checkin";

  return (
    <Sheet
      onClose={onClose}
      title={isCheckin ? "Daily check-in" : "How are you feeling?"}
      subtitle={isCheckin ? "A minute to check in with yourself." : "Logging moods shows you patterns over time."}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Mood">
          {MOODS.map((m, i) => {
            const selected = mood === m.mood;
            return (
              <motion.button
                key={m.mood}
                role="radio"
                aria-checked={selected}
                onClick={() => setMood(m.mood)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: mood && !selected ? 0.55 : 1, y: 0, scale: selected ? 1.06 : 1 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 22, delay: mood ? 0 : i * 0.04 }}
                className={`flex flex-col items-center gap-1.5 rounded-2xl py-3 ${selected ? `${m.bg} ring-2 ${m.ring}` : "bg-slate-50"}`}
              >
                <motion.span animate={selected ? { rotate: [0, -12, 12, 0] } : { rotate: 0 }} transition={{ duration: 0.45 }}>
                  <m.Icon className={`h-8 w-8 ${selected ? m.tint : "text-slate-400"}`} strokeWidth={1.8} />
                </motion.span>
                <span className="text-xs font-semibold text-slate-700">{m.label}</span>
              </motion.button>
            );
          })}
        </div>

        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={isCheckin ? "One thing on your mind today (optional)" : "What’s behind this feeling? (optional)"}
          className="field resize-none"
        />

        <AnimatePresence>
          {isCheckin && mood && (
            <motion.div
              initial={{ opacity: 0, height: 0, filter: "blur(6px)" }}
              animate={{ opacity: 1, height: "auto", filter: "blur(0px)" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl bg-linear-to-br from-teal-50 to-emerald-50 p-4 text-teal-950 ring-1 ring-teal-100">
                <p className="flex items-center gap-2 font-semibold">
                  <HandHeart className="h-5 w-5 text-teal-700" /> Today’s pledge
                </p>
                <p className="font-display mt-1 text-lg">Just for today, I choose to stay free from {addiction?.toLowerCase() || "my addiction"}.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button whileTap={{ scale: 0.98 }} disabled={!mood} onClick={() => onSave(mood, note.trim(), isCheckin)} className="btn-primary w-full py-4">
          {isCheckin ? "I commit for today" : "Save mood"}
        </motion.button>
      </div>
    </Sheet>
  );
}
