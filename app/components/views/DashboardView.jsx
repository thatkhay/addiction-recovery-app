// components/views/DashboardView.jsx
"use client";
import React from "react";
import { motion } from "motion/react";
import {
  BookOpen, CheckCircle2, ChevronRight, CloudSun, Flame, Gamepad2, HandHeart, Heart, HeartCrack,
  MessageCircleHeart, Quote, Shield, Shuffle, TrendingUp, Trophy, Wallet, Zap,
  Compass, LifeBuoy, PenLine, RefreshCw,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { THOUGHTS, thoughtOfTheDay } from "../../constants/play";
import ProgressRing from "../ui/ProgressRing";
import { AnimatedNumber, Bar, Pressable, Rise, Stagger } from "../ui/motion";
import { missionIcon } from "../../lib/icons";
import {
  calculateMoneySaved, formatDuration, formatMoney, getCheckinStreak, getElapsed,
  getLongestStreakMs, getMilestoneProgress, hasCheckedInToday, milestoneLabel,
} from "../../utils/dateUtils";

const pad = (n) => String(n).padStart(2, "0");

function Stat({ icon: Icon, tint, children, label }) {
  return (
    <Rise className="card p-4 last:odd:col-span-2">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${tint}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="font-display truncate text-2xl font-semibold text-slate-900 tabular-nums">{children}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </Rise>
  );
}

function QuickAction({ icon: Icon, label, onClick, tint }) {
  return (
    <Pressable onClick={onClick} className="card flex flex-col items-center gap-2 p-3">
      <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tint}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-xs font-semibold text-slate-700">{label}</span>
    </Pressable>
  );
}

const TRENDS = {
  improving: { Icon: TrendingUp, tint: "text-teal-700 bg-teal-50", text: "Trending up. Whatever you’re doing, keep doing it." },
  stable: { Icon: CloudSun, tint: "text-sky-700 bg-sky-50", text: "Holding steady. Consistency is how recovery is built." },
  struggling: { Icon: HeartCrack, tint: "text-amber-700 bg-amber-50", text: "It’s been a heavy week. Consider reaching out to someone today." },
};

const INSIGHT_ACTIONS = {
  sos: { label: "Open SOS toolkit", Icon: LifeBuoy },
  play: { label: "Find a distraction", Icon: Gamepad2 },
  journal: { label: "Write about it", Icon: PenLine },
  coach: { label: "Talk it through", Icon: MessageCircleHeart },
};

function ForYouCard({ insight, loading, onRefresh, onAction }) {
  if (!insight) return null;
  const action = INSIGHT_ACTIONS[insight.action];
  return (
    <Rise className="relative overflow-hidden rounded-3xl bg-linear-to-br from-teal-600 to-sky-700 p-[1.5px] shadow-lg shadow-teal-800/15">
      <div className="relative rounded-[calc(1.5rem-1.5px)] bg-white/95 p-5 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <span className="eyebrow flex items-center gap-1.5 text-teal-700">
            <Compass className="h-3.5 w-3.5" /> For you today
          </span>
          <motion.button
            whileTap={{ rotate: 180 }}
            onClick={onRefresh}
            disabled={loading}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Refresh suggestion"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </motion.button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={insight.title + insight.body} initial={{ opacity: 0, y: 6, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }} exit={{ opacity: 0 }}>
            <p className="font-display mt-2 text-xl font-semibold text-slate-900">{insight.title}</p>
            <p className="mt-1 leading-relaxed text-slate-600">{insight.body}</p>
            {action && (
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => onAction(insight.action, insight.journalPrompt)} className="btn mt-4 bg-teal-600 px-4 py-2.5 text-sm text-white hover:bg-teal-700">
                <action.Icon className="h-4 w-4" /> {action.label}
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Rise>
  );
}

function ThoughtCard({ now }) {
  const [custom, setCustom] = React.useState(null);
  const text = custom ?? thoughtOfTheDay(new Date(now || 0));
  return (
    <Rise className="card relative overflow-hidden bg-linear-to-br from-white/90 to-violet-50/80">
      <Quote className="absolute -top-2 -right-2 h-20 w-20 text-violet-100" />
      <div className="relative flex items-center justify-between">
        <span className="eyebrow text-violet-700">Thought for today</span>
        <motion.button
          whileTap={{ rotate: 180, scale: 0.9 }}
          onClick={() => {
            let next = THOUGHTS[Math.floor(Math.random() * THOUGHTS.length)];
            if (next === text) next = THOUGHTS[(THOUGHTS.indexOf(next) + 1) % THOUGHTS.length];
            setCustom(next);
          }}
          className="rounded-full p-1.5 text-violet-500 hover:bg-violet-100"
          aria-label="Show another thought"
        >
          <Shuffle className="h-4 w-4" />
        </motion.button>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={text}
          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
          className="font-display relative mt-2 text-lg leading-snug text-slate-800"
        >
          {text}
        </motion.p>
      </AnimatePresence>
    </Rise>
  );
}

export default function DashboardView({ userData, now, missions, cravingStats, moodEntries, getMoodTrend, onCheckIn, onLogMood, onLogCraving, onOpenCoach, onOpenJournal, onOpenMissions, onOpenPlay, insight, insightLoading, onRefreshInsight, onInsightAction, topSlot }) {
  const elapsed = getElapsed(userData.quitDate, now);
  const milestone = getMilestoneProgress(elapsed.ms);
  const moneySaved = calculateMoneySaved(userData.costPerDay, userData.quitDate, now);
  const longest = getLongestStreakMs(userData, now);
  const checkedIn = hasCheckedInToday(moodEntries, now);
  const checkinStreak = getCheckinStreak(moodEntries, now);
  const trend = TRENDS[getMoodTrend()];

  const nextMission = missions
    .filter((m) => !m.completed)
    .sort((a, b) => b.progress / b.target - a.progress / a.target || a.xp - b.xp)[0];
  const nextIcon = nextMission && missionIcon(nextMission);

  return (
    <Stagger className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-6">
      {topSlot && <div className="lg:col-span-5">{topSlot}</div>}

      {/* Left column */}
      <div className="min-w-0 space-y-4 lg:col-span-3">
        <Rise className="hero-gradient relative overflow-hidden rounded-4xl p-6 text-white shadow-xl shadow-teal-800/20 lg:p-10">
          <motion.div
            className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgb(255_255_255/0.28),transparent_68%)]"
            animate={{ x: [0, -30, 0], y: [0, 20, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgb(110_231_183/0.35),transparent_68%)]"
            animate={{ x: [0, 30, 0], y: [0, -16, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <p className="relative text-center text-sm font-medium text-white/80">{userData.addiction}-free for</p>
          <div className="relative mt-3 flex justify-center">
            <ProgressRing progress={milestone.progress} size={220}>
              <AnimatedNumber value={elapsed.days} className="font-display text-7xl leading-none font-semibold" />
              <span className="mt-1 text-lg font-medium text-white/90">{elapsed.days === 1 ? "day" : "days"}</span>
              <span className="mt-2 font-mono text-sm text-white/80 tabular-nums">
                {pad(elapsed.hours)}:{pad(elapsed.minutes)}:
                <motion.span key={elapsed.seconds} initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} className="inline-block">
                  {pad(elapsed.seconds)}
                </motion.span>
              </span>
            </ProgressRing>
          </div>
          <p className="relative mt-5 text-center text-sm text-white/90">
            {milestone.next ? (
              <>
                Next milestone: <span className="font-semibold">{milestoneLabel(milestone.next)}</span> in {formatDuration(milestone.remainingMs)}
              </>
            ) : (
              "You’ve passed every milestone. Incredible."
            )}
          </p>
        </Rise>

        <Rise>
          {checkedIn ? (
            <div className="card flex items-center gap-4">
              <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 15 }} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50">
                <CheckCircle2 className="h-6 w-6 text-teal-600" />
              </motion.div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">Checked in today</p>
                <p className="flex items-center gap-1 text-sm text-slate-500">
                  <Flame className="h-4 w-4 text-orange-500" /> {checkinStreak}-day check-in streak
                </p>
              </div>
              <button onClick={onLogMood} className="text-sm font-semibold text-teal-700">Log mood</button>
            </div>
          ) : (
            <Pressable lift={false} onClick={onCheckIn} className="card relative flex w-full items-center gap-4 overflow-hidden text-left ring-2 ring-teal-500/30">
              <motion.span
                className="absolute inset-y-0 -left-1/2 w-1/2 bg-linear-to-r from-transparent via-teal-100/60 to-transparent"
                animate={{ x: ["0%", "400%"] }}
                transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
              />
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-600">
                <HandHeart className="h-6 w-6 text-white" />
              </div>
              <div className="relative flex-1">
                <p className="font-semibold text-slate-900">Make today’s pledge</p>
                <p className="text-sm text-slate-500">
                  {checkinStreak > 0 ? `Keep your ${checkinStreak}-day streak going` : "Check in with yourself. It takes 30 seconds."}
                </p>
              </div>
              <ChevronRight className="relative h-5 w-5 text-slate-400" />
            </Pressable>
          )}
        </Rise>

        <Rise className="grid grid-cols-4 gap-2 lg:gap-3">
          <QuickAction icon={MessageCircleHeart} label="Coach" onClick={onOpenCoach} tint="bg-amber-50 text-amber-600" />
          <QuickAction icon={BookOpen} label="Journal" onClick={onOpenJournal} tint="bg-sky-50 text-sky-600" />
          <QuickAction icon={Gamepad2} label="Play" onClick={onOpenPlay} tint="bg-violet-50 text-violet-600" />
          <QuickAction icon={Zap} label="Craving" onClick={onLogCraving} tint="bg-rose-50 text-rose-600" />
        </Rise>
      </div>

      {/* Right column */}
      <div className="min-w-0 space-y-4 lg:col-span-2">
        <ForYouCard insight={insight} loading={insightLoading} onRefresh={onRefreshInsight} onAction={onInsightAction} />

        <div className="grid grid-cols-2 gap-3">
          {userData.costPerDay > 0 && (
            <Stat icon={Wallet} tint="bg-emerald-50 text-emerald-700" label="Money saved">
              <AnimatedNumber value={moneySaved} format={(n) => formatMoney(n, userData.currency)} />
            </Stat>
          )}
          <Stat icon={Shield} tint="bg-teal-50 text-teal-700" label="Cravings resisted">
            <AnimatedNumber value={cravingStats.overcame} />
          </Stat>
          <Stat icon={Trophy} tint="bg-amber-50 text-amber-700" label="Longest streak">
            {formatDuration(longest)}
          </Stat>
          <Stat icon={Flame} tint="bg-orange-50 text-orange-700" label="Check-in streak">
            <AnimatedNumber value={checkinStreak} />
          </Stat>
        </div>

        <ThoughtCard now={now} />

        {nextMission && (
          <Rise>
            <Pressable lift onClick={onOpenMissions} className="card w-full text-left">
              <div className="mb-3 flex items-center justify-between">
                <span className="eyebrow">Next mission</span>
                <span className="text-xs font-bold text-amber-700">+{nextMission.xp} XP</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${nextIcon.tint}`}>
                  <nextIcon.Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{nextMission.title}</p>
                  <p className="truncate text-sm text-slate-500">{nextMission.description}</p>
                  {nextMission.target > 1 && (
                    <div className="mt-2">
                      <Bar value={nextMission.progress / nextMission.target} height="h-1.5" />
                    </div>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
              </div>
            </Pressable>
          </Rise>
        )}

        {trend && (
          <Rise className="card flex items-start gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${trend.tint}`}>
              <trend.Icon className="h-5 w-5" />
            </span>
            <div>
              <span className="eyebrow">Mood this week</span>
              <p className="mt-0.5 font-medium text-slate-800">{trend.text}</p>
            </div>
          </Rise>
        )}

        <Rise className="card">
          <p className="eyebrow flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 text-rose-500" fill="currentColor" /> Your why
          </p>
          <p className="font-display mt-2 text-xl leading-relaxed text-slate-800">“{userData.motivation}”</p>
        </Rise>
      </div>
    </Stagger>
  );
}
