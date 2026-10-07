// hooks/useCoach.js
import { usePersistentState } from "../lib/store";

const EMPTY = [];
const MAX_STORED = 60;

export function useCoach() {
  const [messages, setMessages] = usePersistentState("recovery-coach-chat", EMPTY);
  const [aiUsageCount, setAiUsageCount] = usePersistentState("recovery-ai-usage", 0);

  const appendMessage = (message) =>
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), ...message }].slice(-MAX_STORED));

  const updateLastMessage = (patch) =>
    setMessages((prev) =>
      prev.length === 0 ? prev : [...prev.slice(0, -1), { ...prev[prev.length - 1], ...patch }]
    );

  const clearChat = () => setMessages(EMPTY);
  const recordUsage = () => setAiUsageCount((n) => n + 1);

  return { messages, appendMessage, updateLastMessage, clearChat, aiUsageCount, recordUsage };
}
