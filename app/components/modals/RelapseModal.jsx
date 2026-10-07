// components/modals/RelapseModal.jsx
import React, { useState } from "react";
import { Sprout } from "lucide-react";
import Sheet from "../ui/Sheet";
import { formatDuration, getElapsed } from "../../utils/dateUtils";

export default function RelapseModal({ userData, onClose, onConfirm }) {
  const [trigger, setTrigger] = useState("");
  const [reflection, setReflection] = useState("");
  const elapsed = getElapsed(userData.quitDate);

  return (
    <Sheet onClose={onClose}>
      <div className="space-y-5">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <Sprout className="h-7 w-7 text-emerald-700" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-slate-900">A slip isn’t the end of your story</h2>
          <p className="mt-2 text-slate-600">
            Most people in long-term recovery slipped along the way. The {formatDuration(elapsed.ms)} you just put together still happened, and it’s saved in your history.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">What stays with you</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            <li>Your XP, level and completed missions</li>
            <li>Your journal, cravings and mood history</li>
            <li>Your longest streak record</li>
          </ul>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">What led up to it? <span className="font-normal text-slate-400">(optional)</span></span>
            <textarea rows={2} className="field resize-none" value={trigger} onChange={(e) => setTrigger(e.target.value)} placeholder="Where were you, how were you feeling…" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">What will you try next time? <span className="font-normal text-slate-400">(optional)</span></span>
            <textarea rows={2} className="field resize-none" value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="Call someone, leave earlier, use the SOS button…" />
          </label>
        </div>

        <div className="space-y-2">
          <button onClick={() => onConfirm({ trigger: trigger.trim(), reflection: reflection.trim() })} className="btn-primary w-full py-4">
            Start again from now
          </button>
          <button onClick={onClose} className="w-full py-2 text-sm font-medium text-slate-500 hover:text-slate-800">
            Cancel, I didn’t slip
          </button>
        </div>
      </div>
    </Sheet>
  );
}
