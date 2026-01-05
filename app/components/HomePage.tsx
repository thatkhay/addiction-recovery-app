"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Heart,
  BookOpen,
  TrendingUp,
  Mic,
  Volume2,
  ArrowLeft,
  Sparkles,
  RotateCcw,
  X,
  AlertCircle,
  Zap,
  BarChart3,
  MapPin,
  Users,
  Activity,
  DollarSign,
  Award,
  Target,
  MessageCircle,
  Phone,
  Book,
  Lightbulb,
  CheckCircle,
  Lock,
  Star,
  Flame,
} from "lucide-react";

// Define interfaces for our data structures
interface UserData {
  addiction: string;
  quitDate: string;
  motivation: string;
  costPerDay: number;
  createdAt: string;
  relapseHistory?: Array<{ date: string; daysClean: number }>;
}

interface DiaryEntry {
  id: number;
  content: string;
  date: string;
  aiResponse?: string;
}

interface CravingEntry {
  id: number;
  intensity?: number;
  location?: string;
  activity?: string;
  withPeople?: string;
  trigger?: string;
  gaveIn: boolean;
  timestamp: string;
  completed: string;
}

interface MoodEntry {
  id: number;
  mood: string;
  note: string;
  timestamp: string;
}

interface Mission {
  id: number;
  title: string;
  description: string;
  type: string;
  completed: boolean;
  icon: string;
  xp: number;
  target?: number;
  progress?: number;
}

interface HealthBenefit {
  time: number;
  hours: number;
  title: string;
  benefit: string;
  icon: string;
  unlocked: boolean;
}

interface Resource {
  name: string;
  url: string;
  description: string;
}

interface Helpline {
  name: string;
  phone: string;
  description: string;
}

interface AddictionResources {
  supportGroups: Resource[];
  helplines: Helpline[];
  educational: Resource[];
}

interface Milestone {
  day: number;
  icon: string;
  title: string;
  benefit: string;
}

// Extend Window interface for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function RecoveryApp() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [cravings, setCravings] = useState<CravingEntry[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [showCravingModal, setShowCravingModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [cravingStep, setCravingStep] = useState(1);
  const [currentCraving, setCurrentCraving] = useState<Partial<CravingEntry>>(
    {}
  );
  const [newEntry, setNewEntry] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [processingAI, setProcessingAI] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ref for speech recognition
  const recognitionRef = useRef<any>(null);

  // Add global styles
  useEffect(() => {
    setIsClient(true);

    const style = document.createElement("style");
    style.textContent = `
      * {
        -webkit-tap-highlight-color: transparent;
      }
      
      html {
        scroll-behavior: smooth;
      }
      
      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.05);
        border-radius: 10px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #10b981, #14b8a6);
        border-radius: 10px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #059669, #0d9488);
      }
      
      /* Hide scrollbar for elements with scrollbar-hide class */
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.4s ease-out;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Default missions
  const defaultMissions: Mission[] = [
    {
      id: 1,
      title: "Log your first craving",
      description: "Track a craving to understand your triggers",
      type: "craving",
      completed: false,
      icon: "🎯",
      xp: 50,
    },
    {
      id: 2,
      title: "Write in your journal",
      description: "Share your thoughts and feelings",
      type: "journal",
      completed: false,
      icon: "📝",
      xp: 30,
    },
    {
      id: 3,
      title: "Overcome 3 cravings",
      description: "Resist temptation three times",
      type: "craving",
      target: 3,
      progress: 0,
      completed: false,
      icon: "💪",
      xp: 100,
    },
    {
      id: 4,
      title: "Track your mood",
      description: "Log how you're feeling today",
      type: "mood",
      completed: false,
      icon: "😊",
      xp: 25,
    },
    {
      id: 5,
      title: "7 day streak",
      description: "Stay clean for one week",
      type: "streak",
      target: 7,
      completed: false,
      icon: "🔥",
      xp: 200,
    },
    {
      id: 6,
      title: "Chat with AI support",
      description: "Get personalized guidance",
      type: "ai",
      completed: false,
      icon: "✨",
      xp: 40,
    },
  ];

  // Storage helper functions (using localStorage)
  const storage = {
    get: (key: string): { value: string } | null => {
      if (typeof window !== "undefined") {
        const item = localStorage.getItem(key);
        return item ? { value: item } : null;
      }
      return null;
    },
    set: (key: string, value: string): void => {
      if (typeof window !== "undefined") {
        localStorage.setItem(key, value);
      }
    },
  };

  useEffect(() => {
    if (isClient) {
      loadUserData();
    }
  }, [isClient]);

  const loadUserData = async () => {
    try {
      const result = storage.get("recovery-user-data");
      if (result) setUserData(JSON.parse(result.value));

      const entriesResult = storage.get("recovery-diary-entries");
      if (entriesResult) setDiaryEntries(JSON.parse(entriesResult.value));

      const cravingsResult = storage.get("recovery-cravings");
      if (cravingsResult) setCravings(JSON.parse(cravingsResult.value));

      const moodResult = storage.get("recovery-mood-entries");
      if (moodResult) setMoodEntries(JSON.parse(moodResult.value));

      const missionsResult = storage.get("recovery-missions");
      if (missionsResult) {
        setMissions(JSON.parse(missionsResult.value));
      } else {
        setMissions(defaultMissions);
      }
    } catch (error) {
      console.log("Starting fresh");
      setMissions(defaultMissions);
    }
    setLoading(false);
  };

  const saveUserData = async (data: UserData) => {
    storage.set("recovery-user-data", JSON.stringify(data));
    setUserData(data);
  };

  const saveDiaryEntries = async (entries: DiaryEntry[]) => {
    storage.set("recovery-diary-entries", JSON.stringify(entries));
    setDiaryEntries(entries);
    checkMissionCompletion("journal");
  };

  const saveCravings = async (cravingsData: CravingEntry[]) => {
    storage.set("recovery-cravings", JSON.stringify(cravingsData));
    setCravings(cravingsData);
    checkMissionCompletion("craving");
  };

  const saveMoodEntries = async (entries: MoodEntry[]) => {
    storage.set("recovery-mood-entries", JSON.stringify(entries));
    setMoodEntries(entries);
    checkMissionCompletion("mood");
  };

  const saveMissions = async (missionsData: Mission[]) => {
    storage.set("recovery-missions", JSON.stringify(missionsData));
    setMissions(missionsData);
  };

  const checkMissionCompletion = async (type: string) => {
    const updated = missions.map((mission) => {
      if (mission.type === type && !mission.completed) {
        if (type === "journal" && diaryEntries.length > 0) {
          return { ...mission, completed: true };
        }
        if (type === "mood" && moodEntries.length > 0) {
          return { ...mission, completed: true };
        }
        if (type === "craving") {
          const overcame = cravings.filter((c) => !c.gaveIn).length;
          if (mission.id === 1 && cravings.length > 0) {
            return { ...mission, completed: true };
          }
          if (mission.target && overcame >= mission.target) {
            return { ...mission, completed: true, progress: overcame };
          }
          if (mission.target) {
            return { ...mission, progress: overcame };
          }
        }
        if (type === "streak" && mission.target) {
          const days = calculateDaysClean();
          if (days >= mission.target) {
            return { ...mission, completed: true };
          }
        }
        if (type === "ai" && !mission.completed) {
          return { ...mission, completed: true };
        }
      }
      return mission;
    });
    await saveMissions(updated);
  };

  const getTotalXP = () => {
    return missions
      .filter((m) => m.completed)
      .reduce((sum, m) => sum + m.xp, 0);
  };

  const getLevel = () => {
    const xp = getTotalXP();
    return Math.floor(xp / 100) + 1;
  };

  const getXPForNextLevel = () => {
    const level = getLevel();
    return level * 100;
  };

  const handleOnboarding = async () => {
    const addictionInput = document.getElementById(
      "addiction"
    ) as HTMLInputElement;
    const quitDateInput = document.getElementById(
      "quitDate"
    ) as HTMLInputElement;
    const motivationInput = document.getElementById(
      "motivation"
    ) as HTMLTextAreaElement;
    const costPerDayInput = document.getElementById(
      "costPerDay"
    ) as HTMLInputElement;

    const addiction = addictionInput?.value;
    const quitDate = quitDateInput?.value;
    const motivation = motivationInput?.value;
    const costPerDay = parseFloat(costPerDayInput?.value || "0") || 0;

    if (!addiction || !quitDate || !motivation) {
      alert("Please fill in all fields");
      return;
    }

    await saveUserData({
      addiction,
      quitDate,
      motivation,
      costPerDay,
      createdAt: new Date().toISOString(),
    });
  };

  const calculateDaysClean = () => {
    if (!userData?.quitDate) return 0;
    const diff = new Date().getTime() - new Date(userData.quitDate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const calculateMoneySaved = () => {
    if (!userData?.costPerDay) return 0;
    const days = calculateDaysClean();
    return days * userData.costPerDay;
  };

  const handleRelapse = async () => {
    if (
      confirm(
        "Reset your counter? This will mark a relapse but keep all your data."
      )
    ) {
      if (userData) {
        await saveUserData({
          ...userData,
          quitDate: new Date().toISOString().split("T")[0],
          relapseHistory: [
            ...(userData.relapseHistory || []),
            {
              date: new Date().toISOString(),
              daysClean: calculateDaysClean(),
            },
          ],
        });
      }
    }
  };

  const startCravingLog = () => {
    setCurrentCraving({ timestamp: new Date().toISOString() });
    setCravingStep(1);
    setShowCravingModal(true);
  };

  const saveCraving = async (gaveIn = false) => {
    const craving: CravingEntry = {
      ...(currentCraving as CravingEntry),
      id: Date.now(),
      gaveIn,
      completed: new Date().toISOString(),
    };

    const updated = [craving, ...cravings];
    await saveCravings(updated);
    setShowCravingModal(false);
    setCurrentCraving({});
    setCravingStep(1);

    if (gaveIn) {
      await handleRelapse();
    }
  };

  const startRecording = () => {
    if (typeof window === "undefined") return;

    if (!window.webkitSpeechRecognition && !window.SpeechRecognition) {
      alert("Voice input not supported in your browser");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (showAIAssistant) {
        setAiMessage(transcript);
      } else {
        setNewEntry(transcript);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setTimeout(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }, 60000);
  };

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const addDiaryEntry = async (aiResponseText: string | null = null) => {
    if (!newEntry.trim()) return;

    const entry: DiaryEntry = {
      id: Date.now(),
      content: newEntry,
      date: new Date().toISOString(),
      aiResponse: aiResponseText || undefined,
    };

    await saveDiaryEntries([entry, ...diaryEntries]);
    setNewEntry("");
    return entry;
  };

  const getAISupport = async () => {
    const message = aiMessage || newEntry;
    if (!message.trim()) return;

    setProcessingAI(true);

    try {
      const daysClean = calculateDaysClean();
      const addiction = userData?.addiction || "an addiction";
      const context =
        daysClean > 0
          ? `They've been ${daysClean} day${daysClean === 1 ? "" : "s"} clean.`
          : "They just started their recovery journey.";

      // Fallback response - in production, you'd call your API here
      const fallbackResponse = `I'm here to support you in your journey to overcome ${addiction}. 

I understand you shared: "${message}"

${context}

Here are some strategies that might help:
1. Take 5 deep breaths - inhale for 4 seconds, hold for 4, exhale for 6
2. Drink a glass of cold water to reset your system
3. Call or text a supportive friend or family member
4. Go for a 10-minute walk to change your environment
5. Remember why you started this journey - you're stronger than any craving!

Every moment you stay committed is a victory. I believe in you!`;

      if (showAIAssistant) {
        setAiResponse(fallbackResponse);
        speakText(fallbackResponse);
        checkMissionCompletion("ai");
      } else {
        await addDiaryEntry(fallbackResponse);
        speakText(fallbackResponse);
      }
    } catch (error) {
      console.error("AI support error:", error);
      const errorResponse = `I'm here to support you in your journey to overcome ${
        userData?.addiction || "this challenge"
      }. It takes courage to reach out, and I admire your strength. Try taking a few deep breaths, going for a short walk, or calling a supportive friend. You're doing amazing work, and every moment you stay committed is a victory.`;

      if (showAIAssistant) {
        setAiResponse(errorResponse);
      } else {
        await addDiaryEntry(errorResponse);
      }
    }

    setProcessingAI(false);
  };

  const saveMoodEntry = async (mood: string, note = "") => {
    const entry: MoodEntry = {
      id: Date.now(),
      mood,
      note,
      timestamp: new Date().toISOString(),
    };
    await saveMoodEntries([entry, ...moodEntries]);
    setShowMoodTracker(false);
  };

  const getCravingStats = () => {
    const total = cravings.length;
    const overcame = cravings.filter((c) => !c.gaveIn).length;
    const gaveIn = cravings.filter((c) => c.gaveIn).length;
    const last24h = cravings.filter((c) => {
      const diff = new Date().getTime() - new Date(c.timestamp).getTime();
      return diff < 24 * 60 * 60 * 1000;
    }).length;

    const avgIntensity =
      total > 0
        ? Math.round(
            cravings.reduce((sum, c) => sum + (c.intensity || 0), 0) / total
          )
        : 0;

    const successRate = total > 0 ? Math.round((overcame / total) * 100) : 0;

    return { total, overcame, gaveIn, last24h, avgIntensity, successRate };
  };

  const getHealthBenefits = (): HealthBenefit[] => {
    const days = calculateDaysClean();
    const addiction = userData?.addiction?.toLowerCase() || "";

    // Determine addiction category
    let category:
      | "smoking"
      | "alcohol"
      | "drugs"
      | "porn"
      | "gambling"
      | "food"
      | "technology"
      | "general" = "general";
    if (
      addiction.includes("smok") ||
      addiction.includes("cigarette") ||
      addiction.includes("vap") ||
      addiction.includes("nicotine")
    ) {
      category = "smoking";
    } else if (addiction.includes("alcohol") || addiction.includes("drink")) {
      category = "alcohol";
    } else if (
      addiction.includes("drug") ||
      addiction.includes("cocaine") ||
      addiction.includes("heroin") ||
      addiction.includes("meth") ||
      addiction.includes("opioid") ||
      addiction.includes("pill")
    ) {
      category = "drugs";
    } else if (addiction.includes("porn") || addiction.includes("sex")) {
      category = "porn";
    } else if (addiction.includes("gambl") || addiction.includes("betting")) {
      category = "gambling";
    } else if (
      addiction.includes("food") ||
      addiction.includes("eating") ||
      addiction.includes("binge")
    ) {
      category = "food";
    } else if (
      addiction.includes("social media") ||
      addiction.includes("phone") ||
      addiction.includes("internet") ||
      addiction.includes("screen")
    ) {
      category = "technology";
    }

    const benefitsByType = {
      smoking: [
        {
          time: 0,
          hours: 0.33,
          title: "20 Minutes",
          benefit: "Heart rate and blood pressure drop to normal levels",
          icon: "❤️",
          unlocked: days >= 1,
        },
        {
          time: 0,
          hours: 8,
          title: "8 Hours",
          benefit:
            "Carbon monoxide levels normalize, oxygen levels return to normal",
          icon: "🫁",
          unlocked: days >= 1,
        },
        {
          time: 1,
          hours: 24,
          title: "1 Day",
          benefit: "Risk of heart attack begins to decrease",
          icon: "🌱",
          unlocked: days >= 1,
        },
        {
          time: 2,
          hours: 48,
          title: "2 Days",
          benefit: "Nerve endings start to regrow, taste and smell improve",
          icon: "🧠",
          unlocked: days >= 2,
        },
        {
          time: 3,
          hours: 72,
          title: "3 Days",
          benefit: "Breathing becomes easier, bronchial tubes relax",
          icon: "💨",
          unlocked: days >= 3,
        },
        {
          time: 7,
          hours: 168,
          title: "1 Week",
          benefit: "Energy levels improve, lung function increases",
          icon: "⚡",
          unlocked: days >= 7,
        },
        {
          time: 14,
          hours: 336,
          title: "2 Weeks",
          benefit: "Circulation improves dramatically, skin looks healthier",
          icon: "✨",
          unlocked: days >= 14,
        },
        {
          time: 30,
          hours: 720,
          title: "1 Month",
          benefit: "Lung function increases up to 30%, cilia regrow",
          icon: "🎯",
          unlocked: days >= 30,
        },
        {
          time: 90,
          hours: 2160,
          title: "3 Months",
          benefit: "Coughing and breathing problems improve significantly",
          icon: "💪",
          unlocked: days >= 90,
        },
        {
          time: 180,
          hours: 4320,
          title: "6 Months",
          benefit: "Stress levels normalize, lung function greatly improved",
          icon: "🌟",
          unlocked: days >= 180,
        },
        {
          time: 365,
          hours: 8760,
          title: "1 Year",
          benefit: "Heart disease risk cut in half compared to smokers",
          icon: "🏆",
          unlocked: days >= 365,
        },
        {
          time: 1825,
          hours: 43800,
          title: "5 Years",
          benefit: "Stroke risk same as non-smokers",
          icon: "👑",
          unlocked: days >= 1825,
        },
      ],
      alcohol: [
        {
          time: 0,
          hours: 6,
          title: "6 Hours",
          benefit: "Blood alcohol level returns to normal, body starts detox",
          icon: "🧪",
          unlocked: days >= 1,
        },
        {
          time: 1,
          hours: 24,
          title: "1 Day",
          benefit: "Better sleep, improved mood, anxiety may decrease",
          icon: "😴",
          unlocked: days >= 1,
        },
        {
          time: 3,
          hours: 72,
          title: "3 Days",
          benefit: "Blood pressure normalizes, mental clarity improves",
          icon: "🧠",
          unlocked: days >= 3,
        },
        {
          time: 7,
          hours: 168,
          title: "1 Week",
          benefit: "Better hydration, skin improves, deeper sleep",
          icon: "💧",
          unlocked: days >= 7,
        },
        {
          time: 14,
          hours: 336,
          title: "2 Weeks",
          benefit: "Liver starts healing, digestion improves",
          icon: "💚",
          unlocked: days >= 14,
        },
        {
          time: 30,
          hours: 720,
          title: "1 Month",
          benefit:
            "Significant weight loss, better immune function, mental clarity",
          icon: "⚡",
          unlocked: days >= 30,
        },
        {
          time: 90,
          hours: 2160,
          title: "3 Months",
          benefit: "Liver function greatly improved, better relationships",
          icon: "❤️",
          unlocked: days >= 90,
        },
        {
          time: 180,
          hours: 4320,
          title: "6 Months",
          benefit: "Memory and cognitive function improve, emotional stability",
          icon: "🌟",
          unlocked: days >= 180,
        },
        {
          time: 365,
          hours: 8760,
          title: "1 Year",
          benefit: "Liver nearly fully regenerated, heart health restored",
          icon: "🏆",
          unlocked: days >= 365,
        },
      ],
      drugs: [
        {
          time: 1,
          hours: 24,
          title: "1 Day",
          benefit: "Body begins detox process, mental clarity starts returning",
          icon: "🌱",
          unlocked: days >= 1,
        },
        {
          time: 3,
          hours: 72,
          title: "3 Days",
          benefit: "Physical withdrawal peaks then improves, sleep normalizes",
          icon: "😴",
          unlocked: days >= 3,
        },
        {
          time: 7,
          hours: 168,
          title: "1 Week",
          benefit: "Energy returns, appetite normalizes, mood stabilizes",
          icon: "⚡",
          unlocked: days >= 7,
        },
        {
          time: 14,
          hours: 336,
          title: "2 Weeks",
          benefit: "Brain fog clears, emotional regulation improves",
          icon: "🧠",
          unlocked: days >= 14,
        },
        {
          time: 30,
          hours: 720,
          title: "1 Month",
          benefit: "Significant cognitive improvement, better focus and memory",
          icon: "💪",
          unlocked: days >= 30,
        },
        {
          time: 90,
          hours: 2160,
          title: "3 Months",
          benefit: "Brain chemistry rebalancing, dopamine receptors healing",
          icon: "🎯",
          unlocked: days >= 90,
        },
        {
          time: 180,
          hours: 4320,
          title: "6 Months",
          benefit:
            "Improved decision making, emotional stability, relationships heal",
          icon: "❤️",
          unlocked: days >= 180,
        },
        {
          time: 365,
          hours: 8760,
          title: "1 Year",
          benefit:
            "Brain structure repairs, immune system strong, life transformed",
          icon: "🏆",
          unlocked: days >= 365,
        },
      ],
      porn: [
        {
          time: 1,
          hours: 24,
          title: "1 Day",
          benefit: "Dopamine receptors begin recovery, urges are strongest now",
          icon: "🧠",
          unlocked: days >= 1,
        },
        {
          time: 3,
          hours: 72,
          title: "3 Days",
          benefit: "Increased energy, better focus, reduced brain fog",
          icon: "⚡",
          unlocked: days >= 3,
        },
        {
          time: 7,
          hours: 168,
          title: "1 Week",
          benefit: "Improved mood, better sleep quality, increased motivation",
          icon: "😊",
          unlocked: days >= 7,
        },
        {
          time: 14,
          hours: 336,
          title: "2 Weeks",
          benefit: "Enhanced confidence, real relationships improve",
          icon: "💪",
          unlocked: days >= 14,
        },
        {
          time: 30,
          hours: 720,
          title: "1 Month",
          benefit: "Dopamine sensitivity improves, natural pleasure returns",
          icon: "🌟",
          unlocked: days >= 30,
        },
        {
          time: 90,
          hours: 2160,
          title: "3 Months",
          benefit: "Brain rewiring accelerates, healthy sexuality restored",
          icon: "🧠",
          unlocked: days >= 90,
        },
        {
          time: 180,
          hours: 4320,
          title: "6 Months",
          benefit:
            "Strong emotional connections, improved intimacy, self-esteem",
          icon: "❤️",
          unlocked: days >= 180,
        },
        {
          time: 365,
          hours: 8760,
          title: "1 Year",
          benefit:
            "Complete brain reboot, healthy relationships, life purpose clear",
          icon: "🏆",
          unlocked: days >= 365,
        },
      ],
      gambling: [
        {
          time: 1,
          hours: 24,
          title: "1 Day",
          benefit: "Reduced anxiety, first step toward financial control",
          icon: "💰",
          unlocked: days >= 1,
        },
        {
          time: 3,
          hours: 72,
          title: "3 Days",
          benefit: "Better sleep, mind clears from gambling thoughts",
          icon: "😴",
          unlocked: days >= 3,
        },
        {
          time: 7,
          hours: 168,
          title: "1 Week",
          benefit: "Increased self-control, reduced urges, clearer thinking",
          icon: "🧠",
          unlocked: days >= 7,
        },
        {
          time: 14,
          hours: 336,
          title: "2 Weeks",
          benefit: "Financial situation stabilizes, stress decreases",
          icon: "💚",
          unlocked: days >= 14,
        },
        {
          time: 30,
          hours: 720,
          title: "1 Month",
          benefit: "Relationships improve, trust rebuilds, saving money",
          icon: "❤️",
          unlocked: days >= 30,
        },
        {
          time: 90,
          hours: 2160,
          title: "3 Months",
          benefit:
            "Brain reward system rebalances, find joy in healthy activities",
          icon: "🌟",
          unlocked: days >= 90,
        },
        {
          time: 180,
          hours: 4320,
          title: "6 Months",
          benefit:
            "Significant debt reduction, emotional stability, self-worth restored",
          icon: "💪",
          unlocked: days >= 180,
        },
        {
          time: 365,
          hours: 8760,
          title: "1 Year",
          benefit: "Financial freedom, healthy risk assessment, life rebuilt",
          icon: "🏆",
          unlocked: days >= 365,
        },
      ],
      food: [
        {
          time: 1,
          hours: 24,
          title: "1 Day",
          benefit: "Digestive system starts to reset, reduced bloating",
          icon: "🌱",
          unlocked: days >= 1,
        },
        {
          time: 3,
          hours: 72,
          title: "3 Days",
          benefit: "Blood sugar stabilizes, energy levels improve",
          icon: "⚡",
          unlocked: days >= 3,
        },
        {
          time: 7,
          hours: 168,
          title: "1 Week",
          benefit: "Better sleep, improved mood, reduced cravings",
          icon: "😊",
          unlocked: days >= 7,
        },
        {
          time: 14,
          hours: 336,
          title: "2 Weeks",
          benefit:
            "Healthier relationship with hunger, emotional eating decreases",
          icon: "🧠",
          unlocked: days >= 14,
        },
        {
          time: 30,
          hours: 720,
          title: "1 Month",
          benefit:
            "Weight normalizes, confidence improves, health markers better",
          icon: "💪",
          unlocked: days >= 30,
        },
        {
          time: 90,
          hours: 2160,
          title: "3 Months",
          benefit:
            "Sustainable healthy eating habits, body composition improves",
          icon: "🎯",
          unlocked: days >= 90,
        },
        {
          time: 180,
          hours: 4320,
          title: "6 Months",
          benefit:
            "Strong self-control, intuitive eating mastered, vitality returns",
          icon: "✨",
          unlocked: days >= 180,
        },
        {
          time: 365,
          hours: 8760,
          title: "1 Year",
          benefit: "Complete lifestyle transformation, food freedom achieved",
          icon: "🏆",
          unlocked: days >= 365,
        },
      ],
      technology: [
        {
          time: 1,
          hours: 24,
          title: "1 Day",
          benefit: "Reduced eye strain, better posture, more present",
          icon: "👁️",
          unlocked: days >= 1,
        },
        {
          time: 3,
          hours: 72,
          title: "3 Days",
          benefit: "Improved sleep quality, reduced anxiety, clearer mind",
          icon: "😴",
          unlocked: days >= 3,
        },
        {
          time: 7,
          hours: 168,
          title: "1 Week",
          benefit: "Better focus, increased productivity, real conversations",
          icon: "🧠",
          unlocked: days >= 7,
        },
        {
          time: 14,
          hours: 336,
          title: "2 Weeks",
          benefit: "Dopamine sensitivity improves, enjoy simple pleasures",
          icon: "🌟",
          unlocked: days >= 14,
        },
        {
          time: 30,
          hours: 720,
          title: "1 Month",
          benefit: "Stronger relationships, creativity returns, time abundance",
          icon: "❤️",
          unlocked: days >= 30,
        },
        {
          time: 90,
          hours: 2160,
          title: "3 Months",
          benefit: "Attention span restored, deep work capability, mindfulness",
          icon: "⚡",
          unlocked: days >= 90,
        },
        {
          time: 180,
          hours: 4320,
          title: "6 Months",
          benefit:
            "Complete digital balance, healthy boundaries, life fulfillment",
          icon: "💪",
          unlocked: days >= 180,
        },
        {
          time: 365,
          hours: 8760,
          title: "1 Year",
          benefit: "Technology serves you, not controls you, freedom achieved",
          icon: "🏆",
          unlocked: days >= 365,
        },
      ],
      general: [
        {
          time: 1,
          hours: 24,
          title: "1 Day",
          benefit: "Body begins healing, clarity starts returning",
          icon: "🌱",
          unlocked: days >= 1,
        },
        {
          time: 3,
          hours: 72,
          title: "3 Days",
          benefit: "Physical symptoms improve, mind clears",
          icon: "🧠",
          unlocked: days >= 3,
        },
        {
          time: 7,
          hours: 168,
          title: "1 Week",
          benefit: "Energy and mood improve significantly",
          icon: "⚡",
          unlocked: days >= 7,
        },
        {
          time: 14,
          hours: 336,
          title: "2 Weeks",
          benefit: "Stronger self-control, healthier habits forming",
          icon: "💪",
          unlocked: days >= 14,
        },
        {
          time: 30,
          hours: 720,
          title: "1 Month",
          benefit: "Major mental and physical improvements visible",
          icon: "🎯",
          unlocked: days >= 30,
        },
        {
          time: 90,
          hours: 2160,
          title: "3 Months",
          benefit: "Life transformation accelerates, new identity forming",
          icon: "🌟",
          unlocked: days >= 90,
        },
        {
          time: 180,
          hours: 4320,
          title: "6 Months",
          benefit: "Relationships heal, purpose clarifies, confidence restored",
          icon: "❤️",
          unlocked: days >= 180,
        },
        {
          time: 365,
          hours: 8760,
          title: "1 Year",
          benefit: "Complete transformation, healthy lifestyle established",
          icon: "🏆",
          unlocked: days >= 365,
        },
      ],
    };

    return benefitsByType[category] || benefitsByType.general;
  };

  const getMilestones = (): Milestone[] => {
    const days = calculateDaysClean();
    const addiction = userData?.addiction?.toLowerCase() || "";

    // Base milestones that work for all addictions
    const baseMilestones: Milestone[] = [
      {
        day: 1,
        icon: "🌱",
        title: "Day 1",
        benefit: "Your journey begins - first step taken!",
      },
      {
        day: 3,
        icon: "💪",
        title: "3 Days",
        benefit: "Staying strong through the hardest days",
      },
      {
        day: 7,
        icon: "⭐",
        title: "1 Week",
        benefit: "One week of freedom - major milestone!",
      },
      {
        day: 30,
        icon: "🎯",
        title: "1 Month",
        benefit: "A full month - new habits forming",
      },
      {
        day: 90,
        icon: "🚀",
        title: "90 Days",
        benefit: "Three months - transformation visible",
      },
      {
        day: 180,
        icon: "💎",
        title: "6 Months",
        benefit: "Half a year - life is different now",
      },
      {
        day: 365,
        icon: "👑",
        title: "1 Year",
        benefit: "One year free - champion status!",
      },
      {
        day: 730,
        icon: "🏆",
        title: "2 Years",
        benefit: "Two years strong - unstoppable!",
      },
    ];

    // Add addiction-specific context to benefits
    if (
      addiction.includes("smok") ||
      addiction.includes("cigarette") ||
      addiction.includes("vap")
    ) {
      baseMilestones[2].benefit = "One week smoke-free - lungs clearing";
      baseMilestones[3].benefit = "One month - breathing is so much better";
      baseMilestones[4].benefit = "90 days - major health improvements";
    } else if (addiction.includes("alcohol") || addiction.includes("drink")) {
      baseMilestones[2].benefit = "One week sober - mind clearing";
      baseMilestones[3].benefit = "One month - liver healing well";
      baseMilestones[4].benefit = "90 days - brain chemistry rebalancing";
    } else if (addiction.includes("porn") || addiction.includes("sex")) {
      baseMilestones[2].benefit = "One week - dopamine receptors healing";
      baseMilestones[3].benefit = "One month - brain rewiring accelerates";
      baseMilestones[4].benefit = "90 days - major reboot progress";
    } else if (addiction.includes("gambl")) {
      baseMilestones[2].benefit = "One week - financial control returning";
      baseMilestones[3].benefit = "One month - money saved, trust rebuilding";
      baseMilestones[4].benefit = "90 days - healthy decision-making restored";
    } else if (addiction.includes("food") || addiction.includes("eating")) {
      baseMilestones[2].benefit = "One week - healthy patterns forming";
      baseMilestones[3].benefit =
        "One month - relationship with food improving";
      baseMilestones[4].benefit = "90 days - sustainable habits established";
    }

    return baseMilestones.filter((m) => m.day <= days);
  };

  const getNextMilestone = () => {
    const days = calculateDaysClean();
    return [1, 3, 7, 30, 90, 180, 365, 730].find((m) => m > days);
  };

  const getMoodTrend = () => {
    if (moodEntries.length < 2) return null;
    const recent = moodEntries.slice(0, 7);
    const moodValues: Record<string, number> = {
      great: 5,
      good: 4,
      okay: 3,
      bad: 2,
      terrible: 1,
    };
    const avg =
      recent.reduce((sum, e) => sum + (moodValues[e.mood] || 3), 0) /
      recent.length;
    return avg >= 4 ? "improving" : avg >= 3 ? "stable" : "struggling";
  };

  const getCounterLabel = () => {
    const addiction = userData?.addiction?.toLowerCase() || "";

    if (
      addiction.includes("smok") ||
      addiction.includes("cigarette") ||
      addiction.includes("vap") ||
      addiction.includes("nicotine")
    ) {
      return "Smoke-Free";
    } else if (addiction.includes("alcohol") || addiction.includes("drink")) {
      return "Sober";
    } else if (addiction.includes("drug")) {
      return "Clean";
    } else if (addiction.includes("porn") || addiction.includes("sex")) {
      return "PMO-Free";
    } else if (addiction.includes("gambl") || addiction.includes("betting")) {
      return "Bet-Free";
    } else if (
      addiction.includes("food") ||
      addiction.includes("eating") ||
      addiction.includes("binge")
    ) {
      return "Binge-Free";
    } else if (
      addiction.includes("social media") ||
      addiction.includes("phone") ||
      addiction.includes("internet") ||
      addiction.includes("screen")
    ) {
      return "Screen-Free";
    }

    return "Clean";
  };

  const getAddictionResources = (): AddictionResources => {
    const addiction = userData?.addiction?.toLowerCase() || "";

    const resources: AddictionResources = {
      supportGroups: [],
      helplines: [],
      educational: [],
    };

    // Default/General resources
    resources.helplines.push(
      {
        name: "988 Suicide & Crisis Lifeline",
        phone: "988",
        description: "24/7 emotional support",
      },
      {
        name: "SAMHSA Helpline",
        phone: "1-800-662-4357",
        description: "Substance abuse support",
      }
    );

    // Addiction-specific resources
    if (
      addiction.includes("smok") ||
      addiction.includes("cigarette") ||
      addiction.includes("vap") ||
      addiction.includes("nicotine")
    ) {
      resources.supportGroups.push(
        {
          name: "Nicotine Anonymous",
          url: "https://nicotine-anonymous.org/",
          description: "Find local meetings for nicotine addiction",
        },
        {
          name: "Smokefree.gov",
          url: "https://smokefree.gov/",
          description: "Free tools and support to quit smoking",
        }
      );
      resources.helplines.push({
        name: "Quitline",
        phone: "1-800-QUIT-NOW",
        description: "Free coaching to quit smoking",
      });
    } else if (addiction.includes("alcohol") || addiction.includes("drink")) {
      resources.supportGroups.push(
        {
          name: "Alcoholics Anonymous",
          url: "https://www.aa.org/find-aa",
          description: "Find local AA meetings",
        },
        {
          name: "SMART Recovery",
          url: "https://www.smartrecovery.org/community/",
          description: "Science-based recovery support",
        },
        {
          name: "Al-Anon",
          url: "https://al-anon.org/",
          description: "Support for families of alcoholics",
        }
      );
    } else if (addiction.includes("drug") || addiction.includes("substance")) {
      resources.supportGroups.push(
        {
          name: "Narcotics Anonymous",
          url: "https://www.na.org/meetingsearch/",
          description: "Find local NA meetings",
        },
        {
          name: "SMART Recovery",
          url: "https://www.smartrecovery.org/community/",
          description: "Science-based recovery support",
        }
      );
    } else if (addiction.includes("porn") || addiction.includes("sex")) {
      resources.supportGroups.push(
        {
          name: "NoFap Community",
          url: "https://nofap.com/",
          description: "Community support for porn addiction recovery",
        },
        {
          name: "Sex Addicts Anonymous",
          url: "https://saa-recovery.org/",
          description: "Find local SAA meetings",
        },
        {
          name: "Fight The New Drug",
          url: "https://fightthenewdrug.org/",
          description: "Education and awareness resources",
        }
      );
      resources.helplines.push({
        name: "SAA Helpline",
        phone: "1-800-477-8191",
        description: "Sex addiction support",
      });
    } else if (addiction.includes("gambl") || addiction.includes("betting")) {
      resources.supportGroups.push(
        {
          name: "Gamblers Anonymous",
          url: "https://www.gamblersanonymous.org/",
          description: "Find local GA meetings",
        },
        {
          name: "National Council on Problem Gambling",
          url: "https://www.ncpgambling.org/",
          description: "Resources and treatment finder",
        }
      );
      resources.helplines.push({
        name: "Gambling Helpline",
        phone: "1-800-522-4700",
        description: "24/7 gambling addiction support",
      });
    } else if (addiction.includes("food") || addiction.includes("eating")) {
      resources.supportGroups.push(
        {
          name: "Overeaters Anonymous",
          url: "https://oa.org/",
          description: "Find local OA meetings",
        },
        {
          name: "Food Addicts Anonymous",
          url: "https://www.foodaddictsanonymous.org/",
          description: "Support for food addiction",
        },
        {
          name: "NEDA",
          url: "https://www.nationaleatingdisorders.org/",
          description: "Eating disorder resources",
        }
      );
      resources.helplines.push({
        name: "NEDA Helpline",
        phone: "1-800-931-2237",
        description: "Eating disorder support",
      });
    } else {
      // General addiction resources
      resources.supportGroups.push(
        {
          name: "SMART Recovery",
          url: "https://www.smartrecovery.org/community/",
          description: "Science-based recovery support for all addictions",
        },
        {
          name: "Celebrate Recovery",
          url: "https://www.celebraterecovery.com/",
          description: "Faith-based recovery program",
        }
      );
    }

    // Educational resources for all
    resources.educational.push(
      {
        name: "SAMHSA",
        url: "https://www.samhsa.gov/",
        description: "Substance abuse resources",
      },
      {
        name: "Psychology Today",
        url: "https://www.psychologytoday.com/us/therapists",
        description: "Find a therapist near you",
      }
    );

    return resources;
  };

  if (loading || !isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="animate-pulse text-emerald-800 text-xl font-semibold">
          Loading your journey...
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border-2 border-emerald-100">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1
              className="text-4xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Recovery Journey
            </h1>
            <p className="text-gray-600">Your transformation begins today</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What are you recovering from?
              </label>
              <input
                id="addiction"
                type="text"
                placeholder="e.g., Smoking, Alcohol, Gambling..."
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                When did you quit?
              </label>
              <input
                id="quitDate"
                type="date"
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-emerald-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                How much did you spend per day? (optional)
              </label>
              <input
                id="costPerDay"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What's your motivation?
              </label>
              <textarea
                id="motivation"
                rows={3}
                placeholder="Why are you doing this? What keeps you going?"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none transition resize-none"
              />
            </div>

            <button
              onClick={handleOnboarding}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-bold hover:shadow-2xl transition transform hover:scale-105"
            >
              Start My Recovery
            </button>
          </div>
        </div>
      </div>
    );
  }

  const daysClean = calculateDaysClean();
  const moneySaved = calculateMoneySaved();
  const achievedMilestones = getMilestones();
  const nextMilestone = getNextMilestone();
  const stats = getCravingStats();
  const healthBenefits = getHealthBenefits();
  const moodTrend = getMoodTrend();
  const totalXP = getTotalXP();
  const level = getLevel();
  const xpForNext = getXPForNextLevel();
  const xpProgress = ((totalXP % 100) / 100) * 100;

  if (selectedEntry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setSelectedEntry(null)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back</span>
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-emerald-100">
            <div className="text-sm text-gray-500 mb-4">
              {new Date(selectedEntry.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
              {selectedEntry.content}
            </p>
          </div>

          {selectedEntry.aiResponse && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl shadow-lg p-6 border-2 border-amber-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-gray-900">AI Support</h3>
                </div>
                <button
                  onClick={() => speakText(selectedEntry.aiResponse || "")}
                  className="p-2 hover:bg-white/50 rounded-xl transition"
                  aria-label="Read response aloud"
                >
                  <Volume2
                    className={`w-5 h-5 ${
                      isSpeaking ? "text-amber-600" : "text-gray-600"
                    }`}
                  />
                </button>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {selectedEntry.aiResponse}
              </p>
            </div>
          )}
        </div>

        {/* Floating AI Button */}
        <div className="fixed bottom-24 right-6 z-40 group flex items-center justify-end">
          <button
            onClick={() => setShowAIAssistant(true)}
            className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl shadow-2xl hover:shadow-orange-500/50 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center ring-4 ring-amber-400/20 hover:ring-amber-400/40"
            aria-label="AI Support Assistant"
          >
            <Sparkles className="w-8 h-8" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </button>
          {/* Simple Tooltip Label */}
          <div className="absolute right-20 top-1/2 -translate-y-1/2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            AI Help
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pb-24">
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1
                  className="font-bold text-gray-900 text-lg"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Recovery
                </h1>
                <p className="text-xs text-gray-500">{userData.addiction}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1.5 rounded-full border border-amber-200">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-bold text-amber-900">
                    Level {level}
                  </span>
                </div>
              </div>
              <button
                onClick={handleRelapse}
                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"
                aria-label="Reset counter"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-3">
            <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{totalXP % 100} XP</span>
              <span>
                {xpForNext} XP to Level {level + 1}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="flex space-x-2 py-4 overflow-x-auto scrollbar-hide">
          {[
            { id: "dashboard", icon: TrendingUp, label: "Progress" },
            { id: "health", icon: Heart, label: "Health" },
            { id: "missions", icon: Target, label: "Missions" },
            { id: "cravings", icon: Zap, label: "Cravings" },
            { id: "diary", icon: BookOpen, label: "Journal" },
            { id: "resources", icon: Lightbulb, label: "Resources" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl font-semibold transition whitespace-nowrap ${
                currentView === tab.id
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl"
                  : "text-gray-600 bg-white hover:bg-gray-50 shadow-sm"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="pb-8">
          <div className="animate-fadeIn">
            {currentView === "dashboard" && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl shadow-2xl p-8 text-white text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-center space-x-3 mb-2">
                      <Flame className="w-8 h-8" />
                      <div className="text-8xl font-bold">{daysClean}</div>
                      <Flame className="w-8 h-8" />
                    </div>
                    <div className="text-2xl font-semibold mb-4">
                      {daysClean === 1 ? "Day" : "Days"} {getCounterLabel()}
                    </div>
                    <div className="flex items-center justify-center space-x-6 text-sm opacity-90">
                      {stats.overcame > 0 && (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>{stats.overcame} cravings overcome</span>
                        </div>
                      )}
                      {moneySaved > 0 && (
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>${moneySaved.toFixed(2)} saved</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {moneySaved > 0 && (
                    <div className="bg-white rounded-3xl shadow-lg p-5 border-2 border-emerald-100">
                      <DollarSign className="w-8 h-8 text-green-600 mb-2" />
                      <div className="text-3xl font-bold text-gray-900">
                        ${moneySaved.toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Money Saved
                      </div>
                    </div>
                  )}
                  <div className="bg-white rounded-3xl shadow-lg p-5 border-2 border-emerald-100">
                    <Award className="w-8 h-8 text-amber-600 mb-2" />
                    <div className="text-3xl font-bold text-gray-900">
                      {achievedMilestones.length}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Milestones</div>
                  </div>
                  <div className="bg-white rounded-3xl shadow-lg p-5 border-2 border-emerald-100">
                    <CheckCircle className="w-8 h-8 text-emerald-600 mb-2" />
                    <div className="text-3xl font-bold text-gray-900">
                      {stats.successRate}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Success Rate
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl shadow-lg p-5 border-2 border-emerald-100">
                    <Flame className="w-8 h-8 text-orange-600 mb-2" />
                    <div className="text-3xl font-bold text-gray-900">
                      {totalXP}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Total XP</div>
                  </div>
                </div>

                {nextMilestone && (
                  <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-emerald-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-gray-900">
                        Next Milestone
                      </span>
                      <span className="text-sm font-bold text-emerald-600">
                        {nextMilestone - daysClean} days to go
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(daysClean / nextMilestone) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {moodTrend && (
                  <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-emerald-100">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <span>Your Mood Trend</span>
                    </h3>
                    <div
                      className={`text-lg font-semibold ${
                        moodTrend === "improving"
                          ? "text-green-600"
                          : moodTrend === "stable"
                          ? "text-blue-600"
                          : "text-orange-600"
                      }`}
                    >
                      {moodTrend === "improving" &&
                        "📈 Improving - You're doing great!"}
                      {moodTrend === "stable" && "➡️ Stable - Keep going!"}
                      {moodTrend === "struggling" &&
                        "💪 Stay strong - Reach out for support"}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-emerald-100">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span>Your Why</span>
                  </h3>
                  <p className="text-gray-700 leading-relaxed italic">
                    &quot;{userData.motivation}&quot;
                  </p>
                </div>

                {achievedMilestones.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-emerald-100">
                    <h3 className="font-bold text-gray-900 mb-4">
                      Achievements Unlocked
                    </h3>
                    <div className="space-y-3">
                      {achievedMilestones
                        .slice()
                        .reverse()
                        .map((m, i) => (
                          <div
                            key={i}
                            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 transform hover:scale-105 transition"
                          >
                            <span className="text-3xl">{m.icon}</span>
                            <div className="flex-1">
                              <div className="font-bold text-gray-900">
                                {m.title}
                              </div>
                              <div className="text-sm text-gray-600">
                                {m.benefit}
                              </div>
                            </div>
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentView === "health" && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-emerald-100">
                  <h2
                    className="text-2xl font-bold text-gray-900 mb-2"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Your Health Journey
                  </h2>
                  <p className="text-gray-600">
                    Track the amazing improvements happening in your body
                  </p>
                </div>

                <div className="space-y-3">
                  {healthBenefits.map((benefit, i) => (
                    <div
                      key={i}
                      className={`rounded-3xl shadow-lg p-6 border-2 transition-all ${
                        benefit.unlocked
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                          : "bg-gray-50 border-gray-200 opacity-60"
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className={`text-4xl ${
                            benefit.unlocked ? "" : "grayscale opacity-50"
                          }`}
                        >
                          {benefit.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900 text-lg">
                              {benefit.title}
                            </h3>
                            {benefit.unlocked && (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            )}
                            {!benefit.unlocked && (
                              <Lock className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <p
                            className={`text-sm leading-relaxed ${
                              benefit.unlocked
                                ? "text-gray-700"
                                : "text-gray-500"
                            }`}
                          >
                            {benefit.benefit}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentView === "missions" && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-emerald-100">
                  <h2
                    className="text-2xl font-bold text-gray-900 mb-2"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Daily Missions
                  </h2>
                  <p className="text-gray-600">
                    Complete missions to earn XP and level up
                  </p>
                </div>

                <div className="space-y-3">
                  {missions.map((mission) => (
                    <div
                      key={mission.id}
                      className={`rounded-3xl shadow-lg p-5 border-2 transition-all ${
                        mission.completed
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                          : "bg-white border-emerald-100"
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="text-4xl">{mission.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-gray-900">
                              {mission.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <div className="bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                                <span className="text-sm font-bold text-amber-900">
                                  +{mission.xp} XP
                                </span>
                              </div>
                              {mission.completed && (
                                <CheckCircle className="w-6 h-6 text-green-600" />
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {mission.description}
                          </p>
                          {mission.target && !mission.completed && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Progress</span>
                                <span>
                                  {mission.progress || 0}/{mission.target}
                                </span>
                              </div>
                              <div className="bg-gray-100 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all"
                                  style={{
                                    width: `${
                                      ((mission.progress || 0) /
                                        mission.target) *
                                      100
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentView === "cravings" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-3xl shadow-lg p-5 border-2 border-emerald-100">
                    <div className="text-4xl font-bold text-gray-900">
                      {stats.total}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Total Logged
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl shadow-lg p-5 border-2 border-emerald-100">
                    <div className="text-4xl font-bold text-green-600">
                      {stats.overcame}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Overcame</div>
                  </div>
                  <div className="bg-white rounded-3xl shadow-lg p-5 border-2 border-emerald-100">
                    <div className="text-4xl font-bold text-teal-600">
                      {stats.last24h}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Last 24 Hours
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl shadow-lg p-5 border-2 border-emerald-100">
                    <div className="text-4xl font-bold text-orange-600">
                      {stats.avgIntensity}/10
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Avg Intensity
                    </div>
                  </div>
                </div>

                {cravings.length === 0 ? (
                  <div className="bg-white rounded-3xl shadow-lg p-12 text-center border-2 border-emerald-100">
                    <Zap className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-semibold">
                      No cravings logged yet
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Track cravings to identify patterns and triggers
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-900 px-1">
                      Craving History
                    </h3>
                    {cravings.map((craving) => (
                      <div
                        key={craving.id}
                        className={`bg-white rounded-3xl shadow-lg p-5 border-2 ${
                          craving.gaveIn
                            ? "border-red-200 bg-red-50/50"
                            : "border-green-200 bg-green-50/50"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                craving.gaveIn ? "bg-red-500" : "bg-green-500"
                              }`}
                            ></div>
                            <span className="text-sm font-bold text-gray-900">
                              {craving.gaveIn ? "Gave In" : "Overcame"}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            {new Date(craving.timestamp).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="w-4 h-4 text-orange-500" />
                            <span className="text-gray-700 font-medium">
                              Intensity: {craving.intensity}/10
                            </span>
                          </div>
                          {craving.location && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-blue-500" />
                              <span className="text-gray-700">
                                {craving.location}
                              </span>
                            </div>
                          )}
                          {craving.activity && (
                            <div className="flex items-center space-x-2">
                              <Activity className="w-4 h-4 text-purple-500" />
                              <span className="text-gray-700">
                                {craving.activity}
                              </span>
                            </div>
                          )}
                          {craving.withPeople && (
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-green-500" />
                              <span className="text-gray-700">
                                {craving.withPeople}
                              </span>
                            </div>
                          )}
                          {craving.trigger && (
                            <div className="text-gray-600 italic mt-2 bg-white/50 p-2 rounded-lg">
                              <span className="font-semibold">Trigger:</span>{" "}
                              {craving.trigger}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentView === "diary" && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-emerald-100">
                  <div className="relative">
                    <textarea
                      value={newEntry}
                      onChange={(e) => setNewEntry(e.target.value)}
                      placeholder="How are you feeling today? Share your thoughts..."
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:outline-none resize-none text-gray-900"
                    />
                    <button
                      onClick={startRecording}
                      disabled={isRecording}
                      className={`absolute bottom-4 right-4 p-3 rounded-full transition ${
                        isRecording
                          ? "bg-red-500 text-white animate-pulse"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                      aria-label="Voice input"
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={() => addDiaryEntry()}
                      disabled={!newEntry.trim()}
                      className="flex-1 bg-gray-800 text-white py-3 rounded-2xl font-bold hover:bg-gray-900 transition disabled:opacity-50 shadow-lg"
                    >
                      Save Entry
                    </button>
                    <button
                      onClick={getAISupport}
                      disabled={!newEntry.trim() || processingAI}
                      className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white py-3 rounded-2xl font-bold hover:shadow-xl transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>
                        {processingAI ? "Getting Support..." : "AI Support"}
                      </span>
                    </button>
                  </div>
                </div>

                {diaryEntries.length === 0 ? (
                  <div className="bg-white rounded-3xl shadow-lg p-12 text-center border-2 border-emerald-100">
                    <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-semibold">
                      Start your recovery journal
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Document your journey and get AI support anytime
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {diaryEntries.map((entry) => (
                      <button
                        key={entry.id}
                        onClick={() => setSelectedEntry(entry)}
                        className="w-full bg-white rounded-3xl shadow-lg p-5 text-left hover:shadow-xl transition group border-2 border-emerald-100"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs text-gray-500 font-medium">
                            {new Date(entry.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {entry.aiResponse && (
                            <Sparkles className="w-5 h-5 text-amber-500" />
                          )}
                        </div>
                        <p className="text-gray-700 line-clamp-2 group-hover:text-gray-900">
                          {entry.content}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentView === "resources" && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-emerald-100">
                  <h2
                    className="text-2xl font-bold text-gray-900 mb-2"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Recovery Resources
                  </h2>
                  <p className="text-gray-600">
                    Tools and support for your {userData.addiction} recovery
                  </p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-3xl shadow-lg p-6 border-2 border-red-200">
                  <div className="flex items-start space-x-3 mb-4">
                    <Phone className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">
                        Crisis Support
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        24/7 help is available. You&apos;re not alone.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {getAddictionResources().helplines.map((helpline, i) => (
                      <a
                        key={i}
                        href={`tel:${helpline.phone.replace(/\D/g, "")}`}
                        className="flex items-center justify-between p-3 bg-white rounded-xl hover:bg-gray-50 transition"
                      >
                        <div>
                          <div className="font-semibold text-gray-900">
                            {helpline.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {helpline.description}
                          </div>
                        </div>
                        <Phone className="w-5 h-5 text-gray-400" />
                      </a>
                    ))}
                  </div>
                </div>

                {getAddictionResources().supportGroups.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-emerald-100">
                    <div className="flex items-center space-x-2 mb-4">
                      <Users className="w-6 h-6 text-emerald-600" />
                      <h3 className="font-bold text-gray-900 text-lg">
                        Support Groups
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {getAddictionResources().supportGroups.map((group, i) => (
                        <a
                          key={i}
                          href={group.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block p-4 rounded-2xl border-2 hover:shadow-md transition ${
                            i % 3 === 0
                              ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                              : i % 3 === 1
                              ? "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
                              : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                          }`}
                        >
                          <div className="font-bold text-gray-900">
                            {group.name}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {group.description}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-emerald-100">
                  <div className="flex items-center space-x-2 mb-4">
                    <Lightbulb className="w-6 h-6 text-amber-600" />
                    <h3 className="font-bold text-gray-900 text-lg">
                      Coping Strategies
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                      <div className="font-bold text-gray-900 mb-2">
                        🧘 Deep Breathing
                      </div>
                      <div className="text-sm text-gray-700">
                        Breathe in for 4 counts, hold for 4, exhale for 6.
                        Repeat 5 times.
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                      <div className="font-bold text-gray-900 mb-2">
                        🚶 Physical Activity
                      </div>
                      <div className="text-sm text-gray-700">
                        Take a 10-minute walk. Movement helps process cravings.
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                      <div className="font-bold text-gray-900 mb-2">
                        ☎️ Call Someone
                      </div>
                      <div className="text-sm text-gray-700">
                        Reach out to a sponsor, friend, or family member for
                        support.
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-2xl border border-green-200">
                      <div className="font-bold text-gray-900 mb-2">
                        📝 Journal
                      </div>
                      <div className="text-sm text-gray-700">
                        Write about what you&apos;re feeling. Use the AI support
                        for guidance.
                      </div>
                    </div>
                    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
                      <div className="font-bold text-gray-900 mb-2">
                        🧊 Cold Exposure
                      </div>
                      <div className="text-sm text-gray-700">
                        Splash cold water on your face or hold ice cubes to
                        reset your nervous system.
                      </div>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200">
                      <div className="font-bold text-gray-900 mb-2">
                        ✨ Use AI Support
                      </div>
                      <div className="text-sm text-gray-700">
                        Talk to your AI recovery coach anytime for personalized
                        guidance.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-emerald-100">
                  <div className="flex items-center space-x-2 mb-4">
                    <Book className="w-6 h-6 text-teal-600" />
                    <h3 className="font-bold text-gray-900 text-lg">
                      Educational Resources
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {getAddictionResources().educational.map((resource, i) => (
                      <a
                        key={i}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                      >
                        <div className="font-semibold text-gray-900">
                          {resource.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {resource.description}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-4 z-50">
        {/* Mood Tracker Button */}
        <div className="relative group flex items-center justify-end">
          <button
            onClick={() => setShowMoodTracker(true)}
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-2xl hover:shadow-blue-500/50 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center ring-4 ring-blue-500/20 hover:ring-blue-500/40"
            aria-label="Track your mood"
          >
            <span className="text-3xl">😊</span>
          </button>
          {/* Simple Tooltip Label */}
          <div className="absolute right-20 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Mood
          </div>
        </div>

        {/* AI Assistant Button */}
        <div className="relative group flex items-center justify-end">
          <button
            onClick={() => setShowAIAssistant(true)}
            className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl shadow-2xl hover:shadow-orange-500/50 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center ring-4 ring-amber-400/20 hover:ring-amber-400/40"
            aria-label="AI Support Assistant"
          >
            <Sparkles className="w-8 h-8" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </button>
          {/* Simple Tooltip Label */}
          <div className="absolute right-20 top-1/2 -translate-y-1/2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            AI Help
          </div>
        </div>

        {/* Craving Log Button */}
        <div className="relative group flex items-center justify-end">
          <button
            onClick={startCravingLog}
            className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-2xl shadow-2xl hover:shadow-red-500/50 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center ring-4 ring-red-500/20 hover:ring-red-500/40"
            aria-label="Log a craving"
          >
            <AlertCircle className="w-10 h-10" />
          </button>
          {/* Simple Tooltip Label */}
          <div className="absolute right-24 top-1/2 -translate-y-1/2 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Craving
          </div>
        </div>
      </div>

      {/* AI Assistant Modal */}
      {showAIAssistant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-amber-400 to-orange-500 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-7 h-7 text-white" />
                <div>
                  <h2
                    className="text-2xl font-bold text-white"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    AI Support
                  </h2>
                  <p className="text-white/90 text-sm">
                    I&apos;m here to help you
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAIAssistant(false);
                  setAiMessage("");
                  setAiResponse("");
                }}
                className="p-2 hover:bg-white/20 rounded-full transition"
                aria-label="Close AI assistant"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {aiResponse && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-5 border-2 border-amber-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                      <span className="font-bold text-gray-900">Response</span>
                    </div>
                    <button
                      onClick={() => speakText(aiResponse)}
                      className="p-2 hover:bg-white/50 rounded-xl transition"
                      aria-label="Read response aloud"
                    >
                      <Volume2
                        className={`w-5 h-5 ${
                          isSpeaking ? "text-amber-600" : "text-gray-600"
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {aiResponse}
                  </p>
                </div>
              )}

              <div className="relative">
                <textarea
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  placeholder="Share what's on your mind... How are you feeling? What's challenging you right now?"
                  rows={5}
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-3xl focus:border-amber-500 focus:outline-none resize-none text-gray-900"
                />
                <button
                  onClick={startRecording}
                  disabled={isRecording}
                  className={`absolute bottom-4 right-4 p-3 rounded-full transition ${
                    isRecording
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                  aria-label="Voice input"
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => getAISupport()}
                disabled={!aiMessage.trim() || processingAI}
                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-4 rounded-3xl font-bold hover:shadow-xl transition disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>
                  {processingAI ? "Getting Support..." : "Get AI Support"}
                </span>
              </button>

              <div className="text-center text-sm text-gray-500 pt-2">
                Available 24/7 • Confidential • Compassionate
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mood Tracker Modal */}
      {showMoodTracker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Georgia, serif" }}
              >
                How are you feeling?
              </h2>
              <button
                onClick={() => setShowMoodTracker(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                aria-label="Close mood tracker"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-3 mb-6">
              {[
                {
                  mood: "terrible",
                  icon: "😢",
                  color: "from-red-400 to-red-500",
                  label: "Terrible",
                },
                {
                  mood: "bad",
                  icon: "😟",
                  color: "from-orange-400 to-orange-500",
                  label: "Bad",
                },
                {
                  mood: "okay",
                  icon: "😐",
                  color: "from-yellow-400 to-yellow-500",
                  label: "Okay",
                },
                {
                  mood: "good",
                  icon: "😊",
                  color: "from-lime-400 to-lime-500",
                  label: "Good",
                },
                {
                  mood: "great",
                  icon: "😄",
                  color: "from-green-400 to-green-500",
                  label: "Great",
                },
              ].map(({ mood, icon, color, label }) => (
                <button
                  key={mood}
                  onClick={() => saveMoodEntry(mood)}
                  className={`flex flex-col items-center space-y-2 p-4 bg-gradient-to-br ${color} rounded-2xl hover:scale-110 transition shadow-lg`}
                >
                  <span className="text-4xl">{icon}</span>
                  <span className="text-xs font-bold text-white">{label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowMoodTracker(false)}
              className="w-full text-gray-600 py-2 text-sm hover:text-gray-900 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Craving Modal */}
      {showCravingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative">
            {/* X Button */}
            <button
              onClick={() => {
                setShowCravingModal(false);
                setCurrentCraving({});
                setCravingStep(1);
              }}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition z-10"
              aria-label="Close craving modal"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {cravingStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                  <h2
                    className="text-3xl font-bold text-gray-900"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Craving Alert
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Let&apos;s understand this craving together
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    How intense is this craving?
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <button
                        key={n}
                        onClick={() =>
                          setCurrentCraving({ ...currentCraving, intensity: n })
                        }
                        className={`flex-1 py-3 rounded-xl font-bold transition ${
                          currentCraving.intensity === n
                            ? "bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-xl scale-110"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setCravingStep(2)}
                  disabled={!currentCraving.intensity}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl font-bold hover:shadow-xl transition disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}

            {cravingStep === 2 && (
              <div className="space-y-4">
                <div>
                  <button
                    onClick={() => setCravingStep(1)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-semibold">Back</span>
                  </button>
                  <h2
                    className="text-2xl font-bold text-gray-900 mb-2"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Context
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Help us understand what&apos;s happening
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Where are you?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Home, Work, Bar..."
                    value={currentCraving.location || ""}
                    onChange={(e) =>
                      setCurrentCraving({
                        ...currentCraving,
                        location: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    What are you doing?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Working, Relaxing, Socializing..."
                    value={currentCraving.activity || ""}
                    onChange={(e) =>
                      setCurrentCraving({
                        ...currentCraving,
                        activity: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Who are you with?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Alone, Friends, Coworkers..."
                    value={currentCraving.withPeople || ""}
                    onChange={(e) =>
                      setCurrentCraving({
                        ...currentCraving,
                        withPeople: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    What triggered this?
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe what triggered this craving..."
                    value={currentCraving.trigger || ""}
                    onChange={(e) =>
                      setCurrentCraving({
                        ...currentCraving,
                        trigger: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:outline-none resize-none"
                  />
                </div>

                <button
                  onClick={() => setCravingStep(3)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl font-bold hover:shadow-xl transition"
                >
                  Next
                </button>
              </div>
            )}

            {cravingStep === 3 && (
              <div className="space-y-6">
                <div>
                  <button
                    onClick={() => setCravingStep(2)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-semibold">Back</span>
                  </button>
                  <h2
                    className="text-2xl font-bold text-gray-900 mb-2"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Did you give in?
                  </h2>
                  <p className="text-gray-600">
                    Be honest. Every attempt makes you stronger.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => saveCraving(false)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-5 rounded-2xl font-bold hover:shadow-xl transition flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-6 h-6" />
                    <span>No, I Overcame It! 💪</span>
                  </button>
                  <button
                    onClick={() => saveCraving(true)}
                    className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white py-5 rounded-2xl font-bold hover:shadow-xl transition flex items-center justify-center space-x-2"
                  >
                    <X className="w-6 h-6" />
                    <span>Yes, I Gave In</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
