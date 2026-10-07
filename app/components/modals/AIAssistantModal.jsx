// components/modals/AIAssistantModal.jsx
// Chat with the recovery coach.
"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { X, MessageCircleHeart, Mic, Volume2, Send, Trash2, Phone, WifiOff } from "lucide-react";
import Sheet from "../ui/Sheet";
import { askCoach, detectCrisis } from "../../lib/coach";
import { useSpeechInput } from "../../hooks/useSpeechInput";

const SUGGESTIONS = [
  "I’m having a strong craving right now",
  "I’m feeling stressed and overwhelmed",
  "How do I handle social situations?",
  "I slipped and I feel terrible",
  "Help me plan for a tough evening",
];

export default function AIAssistantModal({ onClose, userData, daysClean, coach }) {
  const { messages, appendMessage, updateLastMessage, clearChat, recordUsage } = coach;
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [crisis, setCrisis] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const scrollRef = useRef(null);
  const speech = useSpeechInput(setInput);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const speak = (msg) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (speakingId === msg.id) return setSpeakingId(null);
    const u = new SpeechSynthesisUtterance(msg.content);
    u.onend = u.onerror = () => setSpeakingId(null);
    setSpeakingId(msg.id);
    window.speechSynthesis.speak(u);
  };

  const send = async (text) => {
    const content = text.trim();
    if (!content || busy) return;
    speech.stop();
    if (detectCrisis(content)) setCrisis(true);

    const history = [...messages.filter((m) => m.content), { role: "user", content }].map(({ role, content: c }) => ({ role, content: c }));
    appendMessage({ role: "user", content });
    appendMessage({ role: "assistant", content: "" });
    setInput("");
    setBusy(true);
    recordUsage();

    const { text: reply, offline } = await askCoach({
      messages: history,
      profile: { addiction: userData.addiction, daysClean, motivation: userData.motivation },
      onText: (partial) => updateLastMessage({ content: partial }),
    });
    updateLastMessage({ content: reply, offline });
    setBusy(false);
  };

  const header = (
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100">
          <MessageCircleHeart className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-900">Recovery coach</h2>
          <p className="text-xs text-slate-500">Here for you, any hour</p>
        </div>
      </div>
      <div className="flex items-center">
        {messages.length > 0 && (
          <button onClick={clearChat} disabled={busy} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" aria-label="Clear conversation">
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        )}
        <button onClick={onClose} className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  return (
    <Sheet onClose={onClose} header={header} size="full">
      <div className="flex min-h-[50dvh] flex-col">

        {messages.length === 0 ? (
          <div className="flex-1 py-4">
            <p className="text-slate-600">
              Talk through a craving, a hard day, or a plan. I know what you’re working on{daysClean > 0 ? ` and that you’re ${daysClean} day${daysClean === 1 ? "" : "s"} in` : ""}.
            </p>
            <div className="mt-4 flex flex-col items-start gap-2">
              {SUGGESTIONS.map((s, i) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, type: "spring", stiffness: 300, damping: 24 }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => send(s)}
                  className="rounded-2xl bg-slate-50 px-4 py-2.5 text-left text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-3 py-2">
            {messages.map((m) =>
              m.role === "user" ? (
                <motion.div key={m.id} initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 380, damping: 28 }} style={{ originX: 1 }} className="flex justify-end">
                  <div className="max-w-[85%] rounded-3xl rounded-br-lg bg-teal-600 px-4 py-2.5 whitespace-pre-line text-white">{m.content}</div>
                </motion.div>
              ) : (
                <motion.div key={m.id} initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 380, damping: 28 }} style={{ originX: 0 }} className="flex flex-col items-start">
                  <div className="max-w-[90%] rounded-3xl rounded-bl-lg bg-slate-100 px-4 py-2.5 leading-relaxed whitespace-pre-line text-slate-800">
                    {m.content || (
                      <span className="inline-flex gap-1 py-1" aria-label="Coach is typing">
                        {[0, 150, 300].map((d) => (
                          <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </span>
                    )}
                  </div>
                  {m.content && (
                    <div className="mt-1 flex items-center gap-2 pl-2 text-xs text-slate-400">
                      <button onClick={() => speak(m)} className="flex items-center gap-1 hover:text-slate-600" aria-label="Read aloud">
                        <Volume2 className={`h-3.5 w-3.5 ${speakingId === m.id ? "text-teal-600" : ""}`} /> {speakingId === m.id ? "Stop" : "Listen"}
                      </button>
                      {m.offline && (
                        <span className="flex items-center gap-1" title="The AI service isn’t available, so this is built-in guidance">
                          <WifiOff className="h-3.5 w-3.5" /> Offline guidance
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              )
            )}
            <div ref={scrollRef} />
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="sticky bottom-0 mt-4 bg-white pt-2"
        >
        {crisis && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="mb-3 rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-200">
            <p className="font-semibold text-rose-900">You don’t have to go through this alone.</p>
            <p className="mt-1 text-sm text-rose-800">If you’re thinking about harming yourself, please reach out to a person right now.</p>
            <a href="tel:988" className="btn-danger mt-3 w-full">
              <Phone className="h-4 w-4" /> Call or text 988
            </a>
          </motion.div>
        )}
          <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder={speech.listening ? "Listening…" : "Type how you’re feeling…"}
              className="field max-h-32 resize-none pr-12"
              aria-label="Message"
            />
            <button
              type="button"
              onClick={() => speech.toggle(input)}
              className={`absolute right-2 bottom-2 rounded-full p-2 transition ${speech.listening ? "animate-pulse bg-rose-500 text-white" : "text-slate-400 hover:bg-slate-200"}`}
              aria-label={speech.listening ? "Stop voice input" : "Voice input"}
              aria-pressed={speech.listening}
            >
              <Mic className="h-4.5 w-4.5" />
            </button>
          </div>
          <button type="submit" disabled={!input.trim() || busy} className="btn-primary h-12 w-12 shrink-0 p-0" aria-label="Send">
            <Send className="h-5 w-5" />
          </button>
          </div>
        </form>
        <p className="mt-2 text-center text-[11px] text-slate-400">AI support isn’t a substitute for professional care. In an emergency, call your local emergency number.</p>
      </div>
    </Sheet>
  );
}
