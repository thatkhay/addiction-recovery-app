// components/InstallPrompt.jsx
// "Add to Home Screen" prompt. Native install on Chrome/Edge/Android;
// step-by-step instructions on iPhone (Safari has no install API).
"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Download, PlusSquare, Share, X } from "lucide-react";
import Image from "next/image";
import { promptInstall, useInstallMode } from "../lib/push";

const KEY = "rs-install-dismissed";
const SNOOZE_DAYS = 3;

const snoozed = () => {
  try {
    return Date.now() - Number(localStorage.getItem(KEY) || 0) < SNOOZE_DAYS * 86400000;
  } catch {
    return false;
  }
};

export default function InstallPrompt({ force = false, onClose }) {
  const mode = useInstallMode();
  const [ready, setReady] = useState(force);

  useEffect(() => {
    if (force) return;
    // Give people a moment to land before asking.
    const t = setTimeout(() => setReady(!snoozed()), 4000);
    return () => clearTimeout(t);
  }, [force]);

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setReady(false);
    onClose?.();
  };

  const show = ready && (mode || force);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="fixed inset-x-3 bottom-24 z-40 mx-auto max-w-md lg:right-6 lg:bottom-6 lg:left-auto lg:mx-0 lg:w-96"
          role="dialog"
          aria-label="Install the app"
        >
          <div className="rounded-3xl bg-white p-4 shadow-2xl ring-1 ring-slate-900/10">
            <div className="flex items-start gap-3">
              <Image src="/icon-192.png" alt="" width={52} height={52} className="rounded-2xl shadow-md" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">Get the Recovery app</p>
                <p className="mt-0.5 text-sm text-slate-600">One tap from your home screen, full screen, and with reminders when you need them.</p>
              </div>
              <button onClick={dismiss} className="-mt-1 -mr-1 rounded-full p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Not now">
                <X className="h-4 w-4" />
              </button>
            </div>

            {mode === "native" ? (
              <div className="mt-4 flex gap-2">
                <button onClick={dismiss} className="btn-secondary flex-1 py-2.5 text-sm">Not now</button>
                <button
                  onClick={async () => {
                    await promptInstall();
                    onClose?.();
                  }}
                  className="btn-primary flex-1 py-2.5 text-sm"
                >
                  <Download className="h-4 w-4" /> Install
                </button>
              </div>
            ) : mode === "ios" ? (
              <ol className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold ring-1 ring-slate-200">1</span>
                  Tap <Share className="mx-0.5 inline h-4 w-4 text-sky-600" /> <b>Share</b> in Safari’s toolbar
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold ring-1 ring-slate-200">2</span>
                  Choose <PlusSquare className="mx-0.5 inline h-4 w-4" /> <b>Add to Home Screen</b>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold ring-1 ring-slate-200">3</span>
                  Open it from your Home Screen to turn on notifications
                </li>
              </ol>
            ) : (
              <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                Open this site in Chrome, Edge or Safari, then use the browser menu’s <b>Install app</b> or <b>Add to Home Screen</b> option.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
