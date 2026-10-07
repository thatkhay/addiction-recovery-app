// components/SOSButton.jsx
"use client";
import React from "react";
import { motion } from "motion/react";
import { LifeBuoy } from "lucide-react";

export default function SOSButton({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.3 }}
      className="pulse-ring fixed right-4 bottom-24 z-30 flex items-center gap-2 rounded-full bg-rose-600 py-3.5 pr-5 pl-4 font-bold text-white shadow-xl shadow-rose-600/30 lg:hidden"
      aria-label="I’m having a craving: open the SOS toolkit"
    >
      <LifeBuoy className="h-5 w-5" />
      SOS
    </motion.button>
  );
}
