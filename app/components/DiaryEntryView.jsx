// components/DiaryEntryView.jsx
import React, { useEffect, useState } from "react";
import { MessageCircleHeart, Trash2, Volume2, WifiOff } from "lucide-react";
import Sheet from "./ui/Sheet";

export default function DiaryEntryView({ entry, reflecting, onClose, onReflect, onDelete }) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (speaking) return setSpeaking(false);
    const u = new SpeechSynthesisUtterance(text);
    u.onend = u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  };

  return (
    <Sheet
      onClose={onClose}
      size="lg"
      title={new Date(entry.date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
      subtitle={new Date(entry.date).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
    >
      <div className="space-y-4">
        <p className="text-lg leading-relaxed whitespace-pre-line text-slate-800">{entry.content}</p>

        {entry.aiResponse ? (
          <div className="rounded-3xl bg-amber-50 p-5 ring-1 ring-amber-200">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2 font-semibold text-amber-900">
                <MessageCircleHeart className="h-4 w-4" /> Reflection
                {entry.aiOffline && <WifiOff className="h-3.5 w-3.5 text-amber-700/60" aria-label="Offline guidance" />}
              </span>
              <button onClick={() => speak(entry.aiResponse)} className="rounded-full p-1.5 text-amber-800 hover:bg-amber-100" aria-label={speaking ? "Stop reading" : "Read aloud"}>
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
            <p className="leading-relaxed whitespace-pre-line text-amber-950">{entry.aiResponse}</p>
          </div>
        ) : (
          <button onClick={onReflect} disabled={reflecting} className="btn w-full bg-amber-50 text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100">
            <MessageCircleHeart className="h-4 w-4" /> {reflecting ? "Reflecting…" : "Get a reflection on this entry"}
          </button>
        )}

        <div className="border-t border-slate-100 pt-3">
          <button onClick={onDelete} className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-rose-600">
            <Trash2 className="h-4 w-4" /> Delete entry
          </button>
        </div>
      </div>
    </Sheet>
  );
}
