// components/Sidebar.jsx
// Desktop navigation rail.
"use client";
import React from "react";
import { motion } from "motion/react";
import { LifeBuoy, LogOut, Settings, Trophy } from "lucide-react";
import Logo from "./ui/Logo";
import { spring } from "./ui/motion";

function NavItem({ item, active, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${active ? "text-teal-800" : "text-slate-600 hover:bg-white/60 hover:text-slate-900"}`}
    >
      {active && <motion.span layoutId="side-pill" className="absolute inset-0 rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5" transition={spring} />}
      <item.icon className="relative h-5 w-5" strokeWidth={active ? 2.4 : 2} />
      <span className="relative">{item.label}</span>
    </motion.button>
  );
}

export default function Sidebar({ tabs, currentView, onViewChange, onSOS, user, onSignOut }) {
  const extra = [
    { id: "missions", icon: Trophy, label: "Missions" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];
  const initial = (user?.name || user?.email || "?").trim()[0]?.toUpperCase();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-white/60 bg-white/50 px-5 py-6 backdrop-blur-2xl lg:flex">
      <div className="flex items-center gap-3 px-2">
        <Logo size={40} />
        <span className="font-display text-xl font-semibold text-slate-900">Recovery</span>
      </div>

      <nav className="mt-8 space-y-1" aria-label="Main">
        {tabs.map((t) => (
          <NavItem key={t.id} item={t} active={currentView === t.id} onClick={() => onViewChange(t.id)} />
        ))}
        <div className="my-3 h-px bg-slate-900/5" />
        {extra.map((t) => (
          <NavItem key={t.id} item={t} active={currentView === t.id} onClick={() => onViewChange(t.id)} />
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onSOS}
          className="relative w-full overflow-hidden rounded-3xl bg-linear-to-br from-rose-500 to-rose-700 p-4 text-left text-white shadow-lg shadow-rose-600/25"
        >
          <motion.span
            className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/15"
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <LifeBuoy className="relative h-6 w-6" />
          <p className="relative mt-2 font-semibold">Craving right now?</p>
          <p className="relative text-sm text-white/80">Open the SOS toolkit</p>
        </motion.button>

        <div className="flex items-center gap-3 rounded-2xl bg-white/60 p-3 ring-1 ring-slate-900/5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-emerald-600 font-semibold text-white">{initial}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{user?.name || "You"}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
          <button onClick={onSignOut} className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-slate-700" aria-label="Sign out" title="Sign out">
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
