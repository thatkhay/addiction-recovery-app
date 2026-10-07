// components/views/MoreView.jsx
// Phone-only hub for everything that doesn't fit in the tab bar.
"use client";
import React from "react";
import { ChevronRight, HeartPulse, LogOut, Settings, Trophy, Users } from "lucide-react";
import { Pressable, Rise, Stagger } from "../ui/motion";

const ITEMS = [
  { id: "health", Icon: HeartPulse, title: "Health", text: "How your body is healing", tint: "bg-rose-50 text-rose-600" },
  { id: "support", Icon: Users, title: "Support", text: "Helplines, your people, coping tools", tint: "bg-teal-50 text-teal-700" },
  { id: "missions", Icon: Trophy, title: "Missions", text: "XP, levels and achievements", tint: "bg-amber-50 text-amber-600" },
  { id: "settings", Icon: Settings, title: "Settings", text: "Profile, contacts, your data", tint: "bg-slate-100 text-slate-600" },
];

export default function MoreView({ user, level, onOpen, onSignOut }) {
  return (
    <Stagger className="space-y-4">
      <Rise className="card flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-emerald-600 text-lg font-semibold text-white">
          {(user?.name || user?.email || "?")[0].toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900">{user?.name || "You"}</p>
          <p className="truncate text-sm text-slate-500">{user?.email} · Level {level}</p>
        </div>
      </Rise>
      <div className="space-y-2">
        {ITEMS.map((item) => (
          <Rise key={item.id}>
            <Pressable onClick={() => onOpen(item.id)} className="card flex w-full items-center gap-4 p-4 text-left">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.tint}`}>
                <item.Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-slate-900">{item.title}</span>
                <span className="block text-sm text-slate-500">{item.text}</span>
              </span>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </Pressable>
          </Rise>
        ))}
      </div>
      <Rise>
        <button onClick={onSignOut} className="btn-secondary w-full">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </Rise>
    </Stagger>
  );
}
