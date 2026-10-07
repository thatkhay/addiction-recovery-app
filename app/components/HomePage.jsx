// components/HomePage.jsx - Main application component
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { BarChart3, BookOpen, Gamepad2, HeartPulse, House, LayoutGrid, Users } from "lucide-react";

import { useUserData } from "../hooks/useUserData";
import { useMissions } from "../hooks/useMissions";
import { useCravings } from "../hooks/useCravings";
import { useDiary } from "../hooks/useDiary";
import { useMood } from "../hooks/useMood";
import { useCoach } from "../hooks/useCoach";
import { useDailyInsight } from "../hooks/useDailyInsight";
import { clearAll, useHydrated, useNow } from "../lib/store";
import { toast } from "../lib/toast";
import { celebrate } from "../lib/celebrate";
import { haptic } from "../lib/haptics";
import { stopAmbient } from "../lib/ambient";
import { registerServiceWorker } from "../lib/push";
import { refreshNotifications } from "../hooks/useNotifications";
import { askCoach } from "../lib/coach";
import { deleteAccount, initAuth, signOut, useAuth } from "../lib/auth";
import { deleteServerData } from "../lib/sync";
import { calculateDaysClean } from "../utils/dateUtils";

import AuthScreen from "./AuthScreen";
import OnboardingScreen from "./OnboardingScreen";
import Header from "./Header";
import Navigation from "./Navigation";
import Sidebar from "./Sidebar";
import SOSButton from "./SOSButton";
import NowPlaying from "./NowPlaying";
import InstallPrompt from "./InstallPrompt";
import NotificationsSheet from "./NotificationsSheet";
import ReminderPrompt from "./ReminderPrompt";
import Aurora from "./ui/Aurora";
import Celebration from "./ui/Celebration";
import Toaster from "./ui/Toaster";
import { Splash } from "./ui/Logo";
import DashboardView from "./views/DashboardView";
import HealthView from "./views/HealthView";
import MissionsView from "./views/MissionsView";
import InsightsView from "./views/InsightsView";
import DiaryView from "./views/DiaryView";
import ResourcesView from "./views/ResourcesView";
import SettingsView from "./views/SettingsView";
import PlayView from "./views/PlayView";
import MoreView from "./views/MoreView";
import DiaryEntryView from "./DiaryEntryView";
import CravingModal from "./modals/CravingModal";
import AIAssistantModal from "./modals/AIAssistantModal";
import CheckInModal from "./modals/CheckInModal";
import RelapseModal from "./modals/RelapseModal";
import SOSSheet from "./modals/SOSSheet";

// Desktop sidebar
const SIDEBAR_TABS = [
  { id: "home", icon: House, label: "Home" },
  { id: "insights", icon: BarChart3, label: "Insights" },
  { id: "play", icon: Gamepad2, label: "Play" },
  { id: "journal", icon: BookOpen, label: "Journal" },
  { id: "health", icon: HeartPulse, label: "Health" },
  { id: "support", icon: Users, label: "Support" },
];

// Phone tab bar: the rest lives under "More".
const MOBILE_TABS = [
  { id: "home", icon: House, label: "Home" },
  { id: "insights", icon: BarChart3, label: "Insights" },
  { id: "play", icon: Gamepad2, label: "Play" },
  { id: "journal", icon: BookOpen, label: "Journal" },
  { id: "more", icon: LayoutGrid, label: "More" },
];
const UNDER_MORE = ["more", "health", "support", "missions", "settings"];

/** Notification links like "/?checkin=1" open the matching screen. */
function sheetFromUrl(url) {
  try {
    const params = new URL(url, "http://x").searchParams;
    if (params.has("checkin")) return { type: "checkin", mode: "checkin" };
    if (params.has("sos")) return { type: "sos" };
  } catch {
    // ignore
  }
  return null;
}

const TITLES = { home: "Home", insights: "Insights", play: "Play", journal: "Journal", health: "Health", support: "Support", missions: "Missions", settings: "Settings", more: "More" };

function Overlays({ children }) {
  return (
    <>
      <Aurora />
      <Toaster />
      <Celebration />
      {children}
    </>
  );
}

export default function RecoveryApp() {
  return (
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  );
}

function App() {
  const hydrated = useHydrated();
  const now = useNow();
  const auth = useAuth();

  const [view, setView] = useState("home");
  // A notification tap can open the app straight onto a screen.
  const [sheet, setSheet] = useState(() => (typeof window === "undefined" ? null : sheetFromUrl(window.location.href)));
  const [installGuide, setInstallGuide] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [reflectingId, setReflectingId] = useState(null);
  const [journalSeed, setJournalSeed] = useState("");

  const { userData, saveUserData, updateProfile, recordRelapse } = useUserData();
  const { cravings, addCraving, deleteCraving, restoreCraving, getCravingStats } = useCravings();
  const { diaryEntries, addDiaryEntry, updateDiaryEntry, deleteDiaryEntry, restoreDiaryEntry } = useDiary();
  const { moodEntries, saveMoodEntry, getMoodTrend } = useMood();
  const coach = useCoach();

  useEffect(() => {
    initAuth();
    registerServiceWorker();
    if (window.location.search) window.history.replaceState(null, "", window.location.pathname);
  }, []);

  // In-app notifications: poll the inbox, and react to pushes while the app is open.
  const signedIn = auth.status === "ready";
  useEffect(() => {
    if (!signedIn) return;
    refreshNotifications();
    const timer = setInterval(refreshNotifications, 60000);
    const onMessage = (event) => {
      const msg = event.data || {};
      if (msg.type === "notification") {
        toast(`${msg.title}${msg.body ? `: ${msg.body}` : ""}`, msg.kind === "milestone" ? "achievement" : "info", 6000);
        refreshNotifications();
      } else if (msg.type === "open") {
        const target = sheetFromUrl(msg.url);
        if (target) setSheet(target);
      }
    };
    navigator.serviceWorker?.addEventListener("message", onMessage);
    return () => {
      clearInterval(timer);
      navigator.serviceWorker?.removeEventListener("message", onMessage);
    };
  }, [signedIn]);

  useEffect(() => {
    document.title = `${TITLES[view] || "Recovery"} · Recovery`;
  }, [view]);

  const ready = hydrated && auth.status === "ready";
  const daysClean = userData ? calculateDaysClean(userData.quitDate, now) : 0;
  const missionData = useMemo(
    () => ({ daysClean, cravings, diaryEntries, moodEntries, aiUsageCount: coach.aiUsageCount }),
    [daysClean, cravings, diaryEntries, moodEntries, coach.aiUsageCount]
  );
  const { missions, totalXP, level, progress: levelProgress, toNext } = useMissions(missionData, ready && Boolean(userData));
  const daily = useDailyInsight({ userData: ready ? userData : null, cravings, moodEntries, daysClean, now });

  const go = (next) => {
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const open = (type, props = {}) => setSheet({ type, ...props });
  const close = () => setSheet(null);

  if (!hydrated || auth.status === "loading") return <Overlays><Splash label="Loading" /></Overlays>;
  if (auth.status === "syncing") return <Overlays><Splash label="Syncing your progress" /></Overlays>;
  if (auth.status === "anon") {
    return (
      <Overlays>
        <AuthScreen initialError={auth.error} />
      </Overlays>
    );
  }

  if (!userData) {
    return (
      <Overlays>
        <OnboardingScreen
          defaultName={auth.user?.name || ""}
          onComplete={(data) => {
            saveUserData(data);
            setView("home");
            celebrate("big");
            toast("Welcome. Your journey starts now.");
          }}
        />
      </Overlays>
    );
  }

  const profile = { addiction: userData.addiction, daysClean, motivation: userData.motivation };

  const reflectOn = async (entry) => {
    setReflectingId(entry.id);
    coach.recordUsage();
    const { text, offline } = await askCoach({
      mode: "journal",
      messages: [{ role: "user", content: entry.content }],
      profile,
      onText: (partial) => updateDiaryEntry(entry.id, { aiResponse: partial }),
    });
    updateDiaryEntry(entry.id, { aiResponse: text, aiOffline: offline });
    setReflectingId(null);
  };

  const exportData = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("recovery-")) data[key] = JSON.parse(localStorage.getItem(key));
    }
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), account: auth.user?.email, data }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: `recovery-backup-${new Date().toISOString().slice(0, 10)}.json` });
    a.click();
    URL.revokeObjectURL(url);
    toast("Backup downloaded");
  };

  const handleSignOut = async () => {
    stopAmbient();
    await signOut();
    setView("home");
    setSheet(null);
  };

  const selectedEntry = diaryEntries.find((e) => e.id === selectedEntryId);
  const mobileNavView = UNDER_MORE.includes(view) ? "more" : view;

  return (
    <Overlays>
      <div className="min-h-dvh pb-28 lg:pb-12 lg:pl-72">
        <Sidebar tabs={SIDEBAR_TABS} currentView={view} onViewChange={go} onSOS={() => open("sos")} user={auth.user} onSignOut={handleSignOut} />

        <Header
          userData={userData}
          now={now}
          level={level}
          levelProgress={levelProgress}
          toNext={toNext}
          onOpenMissions={() => go("missions")}
          onOpenSettings={() => go("settings")}
          onOpenNotifications={() => open("notifications")}
        />

        <main className="mx-auto max-w-2xl px-4 py-4 lg:max-w-6xl lg:px-10 lg:py-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
            >
              {view === "home" && (
                <DashboardView
                  topSlot={<ReminderPrompt onNeedsInstall={() => setInstallGuide(true)} />}
                  userData={userData}
                  now={now}
                  missions={missions}
                  cravingStats={getCravingStats()}
                  moodEntries={moodEntries}
                  getMoodTrend={getMoodTrend}
                  onCheckIn={() => open("checkin", { mode: "checkin" })}
                  onLogMood={() => open("checkin", { mode: "mood" })}
                  onLogCraving={() => open("craving")}
                  onOpenCoach={() => open("coach")}
                  onOpenJournal={() => go("journal")}
                  onOpenMissions={() => go("missions")}
                  onOpenPlay={() => go("play")}
                  insight={daily.insight}
                  insightLoading={daily.loading}
                  onRefreshInsight={daily.refresh}
                  onInsightAction={(action, prompt) => {
                    if (action === "sos") open("sos");
                    else if (action === "play") go("play");
                    else if (action === "coach") open("coach");
                    else if (action === "journal") {
                      setJournalSeed(prompt ? `${prompt}\n\n` : "");
                      go("journal");
                    }
                  }}
                />
              )}
              {view === "insights" && (
                <InsightsView
                  cravings={cravings}
                  moodEntries={moodEntries}
                  getCravingStats={getCravingStats}
                  onDeleteCraving={(craving) => {
                    deleteCraving(craving.id);
                    toast("Craving deleted", "info", 5000, { label: "Undo", onClick: () => restoreCraving(craving) });
                  }}
                />
              )}
              {view === "play" && <PlayView userData={userData} />}
              {view === "more" && <MoreView user={auth.user} level={level} onOpen={go} onSignOut={handleSignOut} />}
              {view === "journal" && (
                <DiaryView
                  key={journalSeed}
                  initialDraft={journalSeed}
                  diaryEntries={diaryEntries}
                  onSelectEntry={setSelectedEntryId}
                  onSave={(text, withReflection) => {
                    const entry = addDiaryEntry(text);
                    if (!entry) return;
                    setJournalSeed("");
                    if (withReflection) {
                      setSelectedEntryId(entry.id);
                      reflectOn(entry);
                    } else {
                      toast("Entry saved");
                    }
                  }}
                />
              )}
              {view === "health" && <HealthView userData={userData} now={now} />}
              {view === "support" && <ResourcesView userData={userData} onOpenSettings={() => go("settings")} />}
              {view === "missions" && <MissionsView missions={missions} totalXP={totalXP} level={level} levelProgress={levelProgress} toNext={toNext} onBack={() => go("home")} />}
              {view === "settings" && (
                <SettingsView
                  user={auth.user}
                  userData={userData}
                  onBack={() => go("home")}
                  onUpdateProfile={updateProfile}
                  onSlip={() => open("relapse")}
                  onExport={exportData}
                  onSignOut={handleSignOut}
                  onShowInstall={() => setInstallGuide(true)}
                  onDeleteAccount={async (password) => {
                    await deleteAccount(password);
                    setView("home");
                    toast("Your account has been deleted", "info");
                  }}
                  onResetAll={async () => {
                    try {
                      await deleteServerData();
                      clearAll();
                      setView("home");
                      toast("All data deleted", "info");
                    } catch (error) {
                      toast(error.message, "error");
                    }
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {view !== "settings" && <SOSButton onClick={() => open("sos")} />}
        <Navigation tabs={MOBILE_TABS} currentView={mobileNavView} onViewChange={go} />
        <NowPlaying />
        {!sheet && <InstallPrompt key={installGuide ? "guide" : "auto"} force={installGuide} onClose={() => setInstallGuide(false)} />}

        <AnimatePresence>
          {sheet?.type === "sos" && (
            <SOSSheet
              key="sos"
              userData={userData}
              onClose={close}
              onTalkToCoach={() => open("coach")}
              onLogCraving={() => open("craving", { resisted: true })}
              onSlip={() => open("relapse")}
              onDistract={() => {
                close();
                go("play");
              }}
              onOpenSettings={() => {
                close();
                go("settings");
              }}
            />
          )}

          {sheet?.type === "craving" && (
            <CravingModal
              key="craving"
              resisted={sheet.resisted}
              onClose={close}
              onSave={(craving) => {
                addCraving(craving);
                close();
                celebrate();
                haptic([12, 40, 12]);
                toast("Craving logged. You rode it out.");
              }}
              onGaveIn={(craving) => {
                addCraving(craving);
                open("relapse");
              }}
            />
          )}

          {sheet?.type === "checkin" && (
            <CheckInModal
              key="checkin"
              mode={sheet.mode}
              addiction={userData.addiction}
              onClose={close}
              onSave={(mood, note, pledge) => {
                saveMoodEntry(mood, note, pledge);
                close();
                if (pledge) {
                  celebrate();
                  haptic([12, 40, 12]);
                }
                toast(pledge ? "Pledge made. One day at a time." : "Mood logged");
              }}
            />
          )}

          {sheet?.type === "notifications" && (
            <NotificationsSheet
              key="notifications"
              onClose={close}
              onOpenSettings={() => {
                close();
                go("settings");
              }}
              onOpenUrl={(url) => {
                const target = sheetFromUrl(url);
                setSheet(target);
                if (!target) go("home");
              }}
            />
          )}

          {sheet?.type === "coach" && <AIAssistantModal key="coach" onClose={close} userData={userData} daysClean={daysClean} coach={coach} />}

          {sheet?.type === "relapse" && (
            <RelapseModal
              key="relapse"
              userData={userData}
              onClose={close}
              onConfirm={(details) => {
                recordRelapse(details);
                close();
                go("home");
                toast("Counter restarted. You’re still here, and that’s what matters.", "info", 5000);
              }}
            />
          )}

          {selectedEntry && (
            <DiaryEntryView
              key="entry"
              entry={selectedEntry}
              reflecting={reflectingId === selectedEntry.id}
              onClose={() => setSelectedEntryId(null)}
              onReflect={() => reflectOn(selectedEntry)}
              onDelete={() => {
                const entry = selectedEntry;
                deleteDiaryEntry(entry.id);
                setSelectedEntryId(null);
                toast("Entry deleted", "info", 5000, { label: "Undo", onClick: () => restoreDiaryEntry(entry) });
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </Overlays>
  );
}
