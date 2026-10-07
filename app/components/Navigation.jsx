// components/Navigation.jsx
// Mobile bottom tab bar with a sliding active pill.
"use client";
import React from "react";
import { motion } from "motion/react";
import { spring } from "./ui/motion";

export default function Navigation({ tabs, currentView, onViewChange }) {
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-white/60 bg-white/75 backdrop-blur-2xl lg:hidden" aria-label="Main">
      <div className="mx-auto flex max-w-2xl justify-around px-2 pt-1.5">
        {tabs.map((tab) => {
          const active = currentView === tab.id;
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => onViewChange(tab.id)}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-16 flex-col items-center gap-0.5 px-3 py-1.5 text-[11px] font-semibold transition-colors ${active ? "text-teal-700" : "text-slate-500"}`}
            >
              <span className="relative flex h-8 w-14 items-center justify-center">
                {active && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-full bg-teal-100" transition={spring} />}
                <tab.icon className="relative h-5 w-5" strokeWidth={active ? 2.4 : 2} />
              </span>
              {tab.label}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
