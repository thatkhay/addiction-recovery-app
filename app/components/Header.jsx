// components/Header.jsx
"use client";
import React from "react";
import { motion } from "motion/react";
import { Bell, CloudCheck, CloudOff, Loader2, Settings, Star } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useNotifications } from "../hooks/useNotifications";
import { timeOfDayGreeting } from "../utils/dateUtils";
import { useSyncStatus } from "../lib/sync";
import { useScrolled } from "../lib/useMedia";

function SyncBadge() {
  const status = useSyncStatus();
  const map = {
    idle: { Icon: CloudCheck, cls: "text-teal-600", label: "All changes saved to your account" },
    saving: { Icon: Loader2, cls: "animate-spin text-slate-400", label: "Saving…" },
    offline: { Icon: CloudOff, cls: "text-amber-600", label: "Offline. Changes will sync when you reconnect" },
    error: { Icon: CloudOff, cls: "text-rose-600", label: "Couldn’t sync. Retrying" },
  };
  const { Icon, cls, label } = map[status];
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full" title={label} aria-label={label} role="status">
      <Icon className={`h-4.5 w-4.5 ${cls}`} />
    </span>
  );
}

export default function Header({ userData, level, levelProgress, toNext, onOpenMissions, onOpenSettings, onOpenNotifications, now }) {
  const scrolled = useScrolled();
  const { unread } = useNotifications();
  return (
    <header
      className={`sticky top-0 z-20 border-b transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300 ${
        scrolled
          ? "border-slate-900/5 bg-white/80 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] backdrop-blur-2xl"
          : "border-transparent bg-white/40 backdrop-blur-xl lg:bg-transparent lg:backdrop-blur-none"
      }`}
    >
      <div className={`mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3 transition-[padding] duration-300 lg:max-w-6xl lg:px-10 ${scrolled ? "lg:py-3" : "lg:pt-8 lg:pb-2"}`}>
        <motion.div className="min-w-0" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-xs font-medium text-slate-500 lg:text-sm">{now ? timeOfDayGreeting(now) : "Welcome"}</p>
          <h1 className={`font-display truncate text-xl font-semibold text-slate-900 transition-[font-size] duration-300 ${scrolled ? "lg:text-2xl" : "lg:text-3xl"}`}>{userData.name || "Your recovery"}</h1>
        </motion.div>
        <div className="flex items-center gap-1">
          <SyncBadge />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onOpenNotifications}
            className="relative rounded-full p-2.5 text-slate-500 transition hover:bg-white/70"
            aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
          >
            <motion.span key={unread} animate={unread ? { rotate: [0, -18, 18, -10, 0] } : {}} transition={{ duration: 0.6 }} className="flex">
              <Bell className="h-5 w-5" />
            </motion.span>
            <AnimatePresence>
              {unread > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-1 right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white"
                >
                  {unread > 9 ? "9+" : unread}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenMissions}
            className="flex items-center gap-2 rounded-full bg-amber-50/90 py-1.5 pr-3 pl-1.5 ring-1 ring-amber-200"
            aria-label={`Level ${level}, ${toNext} XP to next level. Open missions`}
          >
            <span className="relative flex h-7 w-7 items-center justify-center">
              <svg viewBox="0 0 28 28" className="absolute inset-0 -rotate-90" aria-hidden="true">
                <circle cx="14" cy="14" r="12" fill="none" stroke="#fde68a" strokeWidth="3" />
                <motion.circle
                  cx="14" cy="14" r="12" fill="none" stroke="#d97706" strokeWidth="3" strokeLinecap="round" strokeDasharray={75.4}
                  initial={{ strokeDashoffset: 75.4 }}
                  animate={{ strokeDashoffset: 75.4 * (1 - levelProgress) }}
                  transition={{ type: "spring", stiffness: 60, damping: 16 }}
                />
              </svg>
              <Star className="h-3.5 w-3.5 text-amber-600" fill="currentColor" />
            </span>
            <span className="text-sm font-bold text-amber-900">Lv {level}</span>
          </motion.button>
          <button onClick={onOpenSettings} className="rounded-full p-2.5 text-slate-500 transition hover:bg-white/70 lg:hidden" aria-label="Settings">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
