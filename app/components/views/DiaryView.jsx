// components/views/DiaryView.jsx
"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BookOpen, MessageCircleHeart, Mic, Search } from "lucide-react";
import { Rise, Stagger } from "../ui/motion";
import { useSpeechInput } from "../../hooks/useSpeechInput";

const PROMPTS = [
  "Today I’m grateful for…",
  "Something that challenged me today was…",
  "A moment I felt proud of…",
  "When I felt the urge, what I needed was…",
  "I am…",
  "Tomorrow I want to…",
];

export default function DiaryView({ diaryEntries, onSave, onSelectEntry }) {
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const speech = useSpeechInput(setDraft);

  const save = (withReflection) => {
    if (!draft.trim()) return;
    speech.stop();
    onSave(draft, withReflection);
    setDraft("");
  };

  const filtered = query.trim()
    ? diaryEntries.filter((e) => e.content.toLowerCase().includes(query.toLowerCase()))
    : diaryEntries;

  return (
    <Stagger className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-6">
      <Rise as="section" className="card lg:sticky lg:top-6">
        <h2 className="font-display mb-3 hidden text-2xl font-semibold text-slate-900 lg:block">Write it out</h2>
        <div className="scrollbar-hide -mx-5 mb-3 flex gap-2 overflow-x-auto px-5">
          {PROMPTS.map((p) => (
            <button key={p} onClick={() => setDraft((d) => (d.trim() ? `${d.trimEnd()}\n\n${p} ` : `${p} `))} className="chip-off shrink-0 text-xs">
              {p}
            </button>
          ))}
        </div>
        <div className="relative">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="How are you, really? Write freely. No one else will read this."
            rows={5}
            className="field resize-none pr-14"
            aria-label="Journal entry"
          />
          <button
            onClick={() => speech.toggle(draft)}
            className={`absolute right-3 bottom-3 rounded-full p-2.5 transition ${speech.listening ? "animate-pulse bg-rose-500 text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}
            aria-label={speech.listening ? "Stop dictation" : "Dictate"}
            aria-pressed={speech.listening}
          >
            <Mic className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={() => save(false)} disabled={!draft.trim()} className="btn-secondary">Save</button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => save(true)} disabled={!draft.trim()} className="btn bg-amber-500 text-white hover:bg-amber-600">
            <MessageCircleHeart className="h-4 w-4" /> Save + reflect
          </motion.button>
        </div>
      </Rise>

      {diaryEntries.length === 0 ? (
        <Rise className="card py-12 text-center">
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="inline-block">
          <BookOpen className="mx-auto mb-3 h-12 w-12 text-slate-300" />
          </motion.div>
          <p className="font-semibold text-slate-700">Start your recovery journal</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">Writing helps untangle cravings and feelings. Try a prompt if you’re stuck.</p>
        </Rise>
      ) : (
        <Rise className="space-y-3">
          {diaryEntries.length > 3 && (
            <div className="relative">
              <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your entries" className="field pl-10" aria-label="Search entries" />
            </div>
          )}
          <div className="space-y-2">
            <AnimatePresence initial={false}>
            {filtered.map((entry) => (
              <motion.button
                layout
                key={entry.id}
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectEntry(entry.id)}
                className="card w-full p-4 text-left"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    {new Date(entry.date).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </span>
                  {entry.aiResponse && <MessageCircleHeart className="h-4 w-4 text-amber-500" aria-label="Has a reflection" />}
                </div>
                <p className="line-clamp-2 text-slate-700">{entry.content}</p>
              </motion.button>
            ))}
            </AnimatePresence>
            {filtered.length === 0 && <p className="py-6 text-center text-sm text-slate-500">No entries match “{query}”.</p>}
          </div>
        </Rise>
      )}
    </Stagger>
  );
}
