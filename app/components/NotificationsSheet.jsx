// components/NotificationsSheet.jsx
"use client";
import React, { useEffect } from "react";
import { motion } from "motion/react";
import { Award, Bell, BellRing, CalendarCheck, HeartHandshake, ShieldAlert } from "lucide-react";
import Sheet from "./ui/Sheet";
import { markAllRead, useNotifications } from "../hooks/useNotifications";

const KIND = {
  milestone: { Icon: Award, tint: "bg-amber-50 text-amber-600" },
  checkin: { Icon: CalendarCheck, tint: "bg-teal-50 text-teal-700" },
  risky: { Icon: ShieldAlert, tint: "bg-rose-50 text-rose-600" },
  comeback: { Icon: HeartHandshake, tint: "bg-violet-50 text-violet-600" },
  test: { Icon: BellRing, tint: "bg-sky-50 text-sky-600" },
};

const ago = (ms) => {
  const m = Math.round((Date.now() - ms) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
};

export default function NotificationsSheet({ onClose, onOpenUrl, onOpenSettings }) {
  const { items } = useNotifications();

  // Seeing the inbox marks everything as read.
  useEffect(() => {
    const t = setTimeout(markAllRead, 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <Sheet onClose={onClose} title="Notifications">
      {items.length === 0 ? (
        <div className="py-10 text-center">
          <motion.div animate={{ rotate: [0, -12, 12, -6, 0] }} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2 }} className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Bell className="h-7 w-7 text-slate-400" />
          </motion.div>
          <p className="font-semibold text-slate-800">Nothing yet</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">Reminders, milestones and heads-ups will appear here.</p>
          <button onClick={onOpenSettings} className="mt-4 text-sm font-semibold text-teal-700">Notification settings</button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n, i) => {
            const { Icon, tint } = KIND[n.kind] || KIND.test;
            return (
              <motion.button
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 8) * 0.03 }}
                onClick={() => onOpenUrl(n.url)}
                className={`flex w-full items-start gap-3 rounded-2xl p-3 text-left transition hover:bg-slate-50 ${n.read ? "" : "bg-teal-50/60"}`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">{n.title}</span>
                    <span className="shrink-0 text-xs text-slate-400">{ago(n.created_at)}</span>
                  </span>
                  <span className="mt-0.5 block text-sm text-slate-600">{n.body}</span>
                </span>
                {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-teal-500" aria-label="Unread" />}
              </motion.button>
            );
          })}
        </div>
      )}
    </Sheet>
  );
}
