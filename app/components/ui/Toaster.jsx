// components/ui/Toaster.jsx
"use client";
import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, CheckCircle2, Info, Trophy, X, XCircle } from "lucide-react";
import { dismissToast, useToasts } from "../../lib/toast";

const STYLES = {
  success: { Icon: CheckCircle2, cls: "text-teal-600 bg-teal-50" },
  info: { Icon: Info, cls: "text-sky-600 bg-sky-50" },
  warning: { Icon: AlertTriangle, cls: "text-amber-600 bg-amber-50" },
  error: { Icon: XCircle, cls: "text-rose-600 bg-rose-50" },
  achievement: { Icon: Trophy, cls: "text-amber-600 bg-amber-100" },
};

export default function Toaster() {
  const toasts = useToasts();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4 lg:top-5" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const { Icon, cls } = STYLES[t.severity] || STYLES.success;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -24, scale: 0.9, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)", transition: { duration: 0.18 } }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className="glass pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl py-2 pr-2.5 pl-2"
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${cls}`}>
                <Icon className="h-4.5 w-4.5" />
              </span>
              <p className="flex-1 text-sm font-medium text-slate-800">{t.message}</p>
              {t.action && (
                <button
                  onClick={() => {
                    t.action.onClick();
                    dismissToast(t.id);
                  }}
                  className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-white hover:bg-slate-700"
                >
                  {t.action.label}
                </button>
              )}
              <button onClick={() => dismissToast(t.id)} className="rounded-full p-1 text-slate-400 hover:text-slate-600" aria-label="Dismiss">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
