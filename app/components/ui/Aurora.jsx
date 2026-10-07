// components/ui/Aurora.jsx
// Slow-drifting light behind everything. Pure CSS so it costs nothing.
import React from "react";

export default function Aurora({ intense = false }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className={`aurora-blob aurora-a ${intense ? "opacity-70" : "opacity-40"}`} />
      <div className={`aurora-blob aurora-b ${intense ? "opacity-60" : "opacity-30"}`} />
      <div className={`aurora-blob aurora-c ${intense ? "opacity-50" : "opacity-25"}`} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,var(--background)_75%)]" />
    </div>
  );
}
