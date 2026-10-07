// components/ui/motion.jsx
// Shared motion primitives so the whole app moves with one personality:
// soft springs, blur-in reveals, gentle lifts.
"use client";
import React, { useEffect } from "react";
import { motion, useSpring, useTransform } from "motion/react";

export const spring = { type: "spring", stiffness: 380, damping: 30 };
export const softSpring = { type: "spring", stiffness: 220, damping: 26 };

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: softSpring, transitionEnd: { filter: "none" } },
};

/** Children wrapped in <Rise> animate in one after another. */
export function Stagger({ className, children, ...rest }) {
  return (
    <motion.div className={className} variants={container} initial="hidden" animate="show" {...rest}>
      {children}
    </motion.div>
  );
}

export function Rise({ className, children, as = "div", ...rest }) {
  const Comp = motion[as];
  return (
    <Comp className={className} variants={item} {...rest}>
      {children}
    </Comp>
  );
}

/** Reveals as it scrolls into view. */
export function Reveal({ className, children, delay = 0, as = "div", ...rest }) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ ...softSpring, delay }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** A button that lifts on hover and squishes on press. */
export function Pressable({ className, children, lift = true, ...rest }) {
  return (
    <motion.button
      className={className}
      whileHover={lift ? { y: -3 } : undefined}
      whileTap={{ scale: 0.96 }}
      transition={spring}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

/** A number that springs to its new value. */
export function AnimatedNumber({ value, format = (n) => Math.round(n).toLocaleString(), className }) {
  const mv = useSpring(0, { stiffness: 70, damping: 18 });
  const display = useTransform(mv, (v) => format(v));
  useEffect(() => {
    mv.set(value);
  }, [mv, value]);
  return <motion.span className={className}>{display}</motion.span>;
}

/** Animated progress bar fill. */
export function Bar({ value, className = "bg-teal-600", track = "bg-slate-100", height = "h-2" }) {
  return (
    <div className={`${height} overflow-hidden rounded-full ${track}`}>
      <motion.div
        className={`h-full rounded-full ${className}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
        transition={{ type: "spring", stiffness: 60, damping: 18 }}
      />
    </div>
  );
}
