// components/ui/Sheet.jsx
// Bottom sheet on phones (drag the handle down to dismiss), centered dialog on desktop.
// Render inside <AnimatePresence> for exit animations.
"use client";
import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, useDragControls } from "motion/react";
import { X } from "lucide-react";
import { useIsDesktop } from "../../lib/useMedia";

export default function Sheet({ onClose, title, subtitle, children, size = "md", header }) {
  const titleId = useId();
  const desktop = useIsDesktop();
  const drag = useDragControls();
  const panelRef = useRef(null);

  // Move focus into the dialog, and back to whatever opened it on close.
  useEffect(() => {
    const opener = document.activeElement;
    panelRef.current?.focus({ preventScroll: true });
    return () => opener?.focus?.({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const width = { md: "lg:max-w-md", lg: "lg:max-w-xl", full: "lg:max-w-2xl" }[size];

  // Portal to <body>: a CSS filter/transform on any ancestor (e.g. page transitions)
  // would otherwise turn `position: fixed` into positioning inside that ancestor.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center lg:p-6">
      <motion.div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      />
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={`relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-4xl bg-white shadow-2xl outline-none lg:rounded-4xl ${width}`}
        initial={desktop ? { opacity: 0, scale: 0.94, y: 16, filter: "blur(6px)" } : { y: "100%" }}
        animate={desktop ? { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } } : { y: 0 }}
        exit={desktop ? { opacity: 0, scale: 0.96, y: 8, filter: "blur(4px)" } : { y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
        drag={desktop ? false : "y"}
        dragControls={drag}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => (info.offset.y > 110 || info.velocity.y > 600) && onClose()}
      >
        {!desktop && (
          <div
            className="absolute inset-x-0 top-0 z-10 flex h-6 cursor-grab touch-none justify-center pt-2 active:cursor-grabbing"
            onPointerDown={(e) => drag.start(e)}
            aria-hidden="true"
          >
            <span className="h-1.5 w-10 rounded-full bg-slate-300/80" />
          </div>
        )}
        {header ?? (
          <div className="flex items-start justify-between gap-4 px-6 pt-7 pb-2" onPointerDown={(e) => !desktop && drag.start(e)}>
            <div>
              {title && (
                <h2 id={titleId} className="font-display text-2xl font-semibold text-slate-900">
                  {title}
                </h2>
              )}
              {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="-mt-1 -mr-2 rounded-full p-2 text-slate-500 transition hover:bg-slate-100" aria-label="Close">
              <X className="h-5 w-5" />
            </motion.button>
          </div>
        )}
        <div className="pb-safe overflow-y-auto px-6 pt-2 pb-6">{children}</div>
      </motion.div>
    </div>
  , document.body);
}
