// hooks/useSpeechInput.js
// Tap to start dictating, tap again to stop. Cleans up on unmount.
import { useEffect, useRef, useState } from "react";
import { toast } from "../lib/toast";

export function useSpeechInput(onTranscript) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const baseRef = useRef("");

  useEffect(() => () => recognitionRef.current?.abort(), []);

  const stop = () => recognitionRef.current?.stop();

  const start = (existingText = "") => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast("Voice input isn't supported in this browser", "error");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    baseRef.current = existingText ? `${existingText.trimEnd()} ` : "";

    recognition.onstart = () => setListening(true);
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = (e) => {
      if (e.error === "not-allowed") toast("Microphone permission was denied", "error");
    };
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) transcript += event.results[i][0].transcript;
      onTranscript(baseRef.current + transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const toggle = (existingText) => (listening ? stop() : start(existingText));

  return { listening, toggle, stop };
}
