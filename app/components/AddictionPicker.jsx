// components/AddictionPicker.jsx
// Type anything; we find the closest match, narrow broad answers ("drugs"),
// and fall back to AI classification for things we don't know yet.
"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Loader2, Phone, Search, Sparkle, X } from "lucide-react";
import { ADDICTIONS, POPULAR, byId, searchAddictions } from "../lib/addictions";

const GROUPS = ["Substances", "Drugs", "Behaviours", "Food"];

async function classify(text) {
  const res = await fetch("/api/classify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("classify failed");
  return res.json();
}

/** value: { addiction, addictionId, addictionCategory } */
export default function AddictionPicker({ value, onChange, autoFocus = false }) {
  const [query, setQuery] = useState("");
  const [browsing, setBrowsing] = useState(false);
  const [classifying, setClassifying] = useState(false);

  const selected = value?.addiction ? value : null;
  const selectedEntry = byId(value?.addictionId);
  const { umbrella, results } = searchAddictions(query);

  const pick = (entry) => {
    onChange({ addiction: entry.label, addictionId: entry.id, addictionCategory: entry.category });
    setQuery("");
    setBrowsing(false);
  };

  const chooseCustom = async () => {
    const text = query.trim();
    if (!text) return;
    setClassifying(true);
    try {
      const out = await classify(text);
      onChange({ addiction: out.label || text, addictionId: out.id, addictionCategory: out.category || "general" });
    } catch {
      onChange({ addiction: text, addictionId: null, addictionCategory: "general" });
    }
    setClassifying(false);
    setQuery("");
  };

  if (selected) {
    return (
      <div className="space-y-3">
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-3 rounded-2xl bg-teal-50 p-3.5 ring-1 ring-teal-200"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white">
            <Check className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-teal-950">{selected.addiction}</p>
            <p className="text-xs text-teal-800/80">
              {selectedEntry && selectedEntry.label !== selected.addiction
                ? `We’ll tailor things like ${selectedEntry.label.toLowerCase()}`
                : "Everything will be tailored to this"}
            </p>
          </div>
          <button type="button" onClick={() => onChange({ addiction: "", addictionId: null, addictionCategory: null })} className="rounded-lg px-2 py-1 text-sm font-semibold text-teal-700 hover:bg-teal-100">
            Change
          </button>
        </motion.div>
        {selectedEntry?.crisis && (
          <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-900 ring-1 ring-rose-200">
            <p className="font-semibold">You deserve real support with this.</p>
            <p className="mt-1">If you’re in danger or might hurt yourself, please reach out now.</p>
            <a href="tel:988" className="btn-danger mt-3 w-full">
              <Phone className="h-4 w-4" /> Call or text 988
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
        <input
          className="field pr-10 pl-11"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            if (results[0] && !umbrella) pick(results[0]);
            else if (query.trim() && !umbrella) chooseCustom();
          }}
          placeholder="Type anything: alcohol, weed, TikTok, sugar…"
          aria-label="What are you recovering from?"
          autoComplete="off"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600" aria-label="Clear">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {query.trim() ? (
          <motion.div key="results" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
            {umbrella && (
              <div className="rounded-2xl bg-violet-50 p-3 ring-1 ring-violet-200">
                <p className="mb-2 text-sm font-semibold text-violet-900">{umbrella.prompt}</p>
                <div className="flex flex-wrap gap-2">
                  {umbrella.options.map((o) => (
                    <motion.button whileTap={{ scale: 0.94 }} type="button" key={o.id} onClick={() => pick(o)} className="chip-off bg-white">
                      {o.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
            {results.length > 0 && (
              <ul className="overflow-hidden rounded-2xl ring-1 ring-slate-200" role="listbox">
                {results.map((r, i) => (
                  <motion.li key={r.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                    <button type="button" onClick={() => pick(r)} className="flex w-full items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3 text-left last:border-0 hover:bg-slate-50" role="option" aria-selected="false">
                      <span className="font-medium text-slate-900">{r.label}</span>
                      <span className="text-xs text-slate-400">{r.group}</span>
                    </button>
                  </motion.li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={chooseCustom}
              disabled={classifying}
              className="flex w-full items-center gap-2 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-left text-sm text-slate-600 hover:border-teal-400 hover:bg-teal-50/50"
            >
              {classifying ? <Loader2 className="h-4 w-4 animate-spin text-teal-600" /> : <Sparkle className="h-4 w-4 text-teal-600" />}
              {classifying ? "Finding the best match…" : (
                <>
                  Use exactly “<span className="font-semibold text-slate-900">{query.trim()}</span>”
                </>
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {POPULAR.map((id) => {
                const a = byId(id);
                return (
                  <motion.button whileTap={{ scale: 0.94 }} type="button" key={id} onClick={() => pick(a)} className="chip-off">
                    {a.label}
                  </motion.button>
                );
              })}
            </div>
            <button type="button" onClick={() => setBrowsing((b) => !b)} className="flex items-center gap-1 text-sm font-semibold text-teal-700">
              Browse all {ADDICTIONS.length} <ChevronDown className={`h-4 w-4 transition-transform ${browsing ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {browsing && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-3 overflow-hidden">
                  {GROUPS.map((g) => (
                    <div key={g}>
                      <p className="eyebrow mb-1.5">{g}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {ADDICTIONS.filter((a) => a.group === g).map((a) => (
                          <button type="button" key={a.id} onClick={() => pick(a)} className="chip-off text-xs">
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
