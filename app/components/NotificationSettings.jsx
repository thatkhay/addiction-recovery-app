// components/NotificationSettings.jsx
// Turn notifications on per device, pick the reminder time and which kinds to get.
"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, BellOff, Download, Loader2, Send } from "lucide-react";
import { disablePush, enablePush, pushStatus } from "../lib/push";
import { refreshNotifications } from "../hooks/useNotifications";
import { toast } from "../lib/toast";

const TYPES = [
  { id: "checkin", label: "Daily check-in reminder" },
  { id: "milestone", label: "Milestone celebrations" },
  { id: "risky", label: "Heads-up at your tough times" },
  { id: "comeback", label: "A nudge if you’ve been away" },
];

function Toggle({ on, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-center justify-between gap-3 py-2 text-left">
      <span className="text-sm text-slate-700">{label}</span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-teal-600" : "bg-slate-300"}`}>
        <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 32 }} className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow ${on ? "right-1" : "left-1"}`} />
      </span>
    </button>
  );
}

export default function NotificationSettings({ onShowInstall }) {
  const [status, setStatus] = useState("loading");
  const [prefs, setPrefs] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    pushStatus().then((s) => alive && setStatus(s));
    fetch("/api/push/prefs", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => alive && p && setPrefs(p));
    return () => {
      alive = false;
    };
  }, []);

  const savePrefs = async (patch) => {
    const next = { ...prefs, ...patch, types: { ...prefs?.types, ...patch.types } };
    setPrefs(next);
    await fetch("/api/push/prefs", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) }).catch(() => {});
  };

  const turnOn = async () => {
    setBusy(true);
    try {
      await enablePush();
      setStatus("on");
      toast("Notifications are on");
    } catch (error) {
      toast(error.message, "error", 6000);
      setStatus(await pushStatus());
    }
    setBusy(false);
  };

  const turnOff = async () => {
    setBusy(true);
    await disablePush();
    setStatus("off");
    setBusy(false);
    toast("Notifications turned off on this device", "info");
  };

  const test = async () => {
    setBusy(true);
    const res = await fetch("/api/push/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    refreshNotifications();
    if (!res.ok) return toast(json.error || "Couldn’t send a test", "error");
    toast(json.delivered ? "Test sent. Check your notifications." : "Saved to your inbox. Turn on notifications on this device to get alerts.", "info", 5000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
        <div className="flex items-center gap-3">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${status === "on" ? "bg-teal-600 text-white" : "bg-white text-slate-400 ring-1 ring-slate-200"}`}>
            {status === "on" ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          </span>
          <div>
            <p className="font-semibold text-slate-900">{status === "on" ? "On for this device" : "Off on this device"}</p>
            <p className="text-xs text-slate-500">
              {status === "needs-install"
                ? "On iPhone, add the app to your Home Screen first."
                : status === "denied"
                  ? "Blocked in your browser settings for this site."
                  : status === "unsupported"
                    ? "This browser can’t receive notifications."
                    : "Works even when the app is closed."}
            </p>
          </div>
        </div>
        {status === "loading" ? (
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        ) : status === "on" ? (
          <button onClick={turnOff} disabled={busy} className="btn-secondary px-3 py-2 text-sm">Turn off</button>
        ) : status === "needs-install" ? (
          <button onClick={onShowInstall} className="btn-primary px-3 py-2 text-sm"><Download className="h-4 w-4" /> How</button>
        ) : status === "off" ? (
          <button onClick={turnOn} disabled={busy} className="btn-primary px-3 py-2 text-sm">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Turn on"}</button>
        ) : null}
      </div>

      <AnimatePresence initial={false}>
        {prefs && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-1 overflow-hidden">
            <label className="flex items-center justify-between gap-3 py-2">
              <span className="text-sm text-slate-700">Check-in reminder time</span>
              <input type="time" className="field w-auto py-2" value={prefs.checkinTime} onChange={(e) => savePrefs({ checkinTime: e.target.value })} />
            </label>
            {TYPES.map((t) => (
              <Toggle key={t.id} label={t.label} on={prefs.types?.[t.id] !== false} onChange={(on) => savePrefs({ types: { [t.id]: on } })} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={test} disabled={busy} className="btn-secondary w-full">
        <Send className="h-4 w-4" /> Send a test notification
      </button>
    </div>
  );
}
