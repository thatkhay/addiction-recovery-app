// components/ReminderPrompt.jsx
// A one-time card on Home suggesting reminders.
"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BellRing, Loader2, X } from "lucide-react";
import { enablePush, pushStatus } from "../lib/push";
import { toast } from "../lib/toast";

const KEY = "rs-reminder-prompt-dismissed";

export default function ReminderPrompt({ onNeedsInstall }) {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    let dismissed = false;
    try {
      dismissed = Boolean(localStorage.getItem(KEY));
    } catch {
      // ignore
    }
    // On iPhone the install card already explains notifications, so only offer this once it’s possible.
    if (!dismissed) pushStatus().then((s) => alive && setShow(s === "off"));
    return () => {
      alive = false;
    };
  }, []);

  const hide = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // ignore
    }
    setShow(false);
  };

  const enable = async () => {
    if ((await pushStatus()) === "needs-install") return onNeedsInstall();
    setBusy(true);
    try {
      await enablePush();
      toast("Reminders are on. We’ll check in gently.");
      hide();
    } catch (error) {
      toast(error.message, "error", 6000);
    }
    setBusy(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
          <div className="card flex items-center gap-3">
            <motion.span
              animate={{ rotate: [0, -14, 14, -8, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"
            >
              <BellRing className="h-5 w-5" />
            </motion.span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">Want gentle reminders?</p>
              <p className="text-sm text-slate-500">Daily check-ins and milestone moments, even when the app is closed.</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <button onClick={enable} disabled={busy} className="btn-primary px-3 py-2 text-sm">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Turn on"}
              </button>
              <button onClick={hide} className="text-xs text-slate-400 hover:text-slate-600" aria-label="Dismiss">
                <X className="inline h-3 w-3" /> Not now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
