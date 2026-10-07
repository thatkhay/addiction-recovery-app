// components/views/PlayView.jsx
// Things to do while a craving passes: games, sounds, videos, challenges, random fun.
"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  Brain, CircleDot, CloudRain, Dices, Flame, Grid2x2, Headphones, Laugh, Lightbulb, PlayCircle, Shuffle, Timer, Trophy, Waves, Wind,
} from "lucide-react";
import Sheet from "../ui/Sheet";
import { AnimatedNumber, Pressable, Rise, Stagger, spring } from "../ui/motion";
import { Equalizer } from "../NowPlaying";
import BubblePop from "../play/BubblePop";
import MemoryMatch from "../play/MemoryMatch";
import Game2048 from "../play/Game2048";
import SpinWheel from "../play/SpinWheel";
import { FACTS, JOKES, VIDEOS } from "../../constants/play";
import { playAmbient, setAmbientVolume, SOUNDS, useAmbient } from "../../lib/ambient";
import { celebrate } from "../../lib/celebrate";
import { toast } from "../../lib/toast";
import { usePlayStats } from "../../hooks/usePlayStats";

const GAMES = [
  { id: "bubbles", title: "Bubble Pop", blurb: "45 calm seconds of popping", Icon: CircleDot, art: "from-sky-400 to-teal-400", Comp: BubblePop, unit: "", lowerIsBetter: false },
  { id: "memory", title: "Memory Match", blurb: "Find all 8 pairs", Icon: Brain, art: "from-violet-500 to-fuchsia-500", Comp: MemoryMatch, unit: " moves", lowerIsBetter: true },
  { id: "2048", title: "2048", blurb: "Slide, merge, get lost in it", Icon: Grid2x2, art: "from-amber-400 to-orange-500", Comp: Game2048, unit: "", lowerIsBetter: false },
];

const SOUND_ICONS = { rain: CloudRain, ocean: Waves, wind: Wind, fire: Flame, brown: Headphones };
const VIDEO_KINDS = ["All", "Calm", "Learn", "Laugh", "Music"];

function SectionTitle({ icon: Icon, children, action }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 font-semibold text-slate-900">
        <Icon className="h-5 w-5 text-violet-600" /> {children}
      </h2>
      {action}
    </div>
  );
}

export default function PlayView() {
  const { stats, addTime, completeChallenge, recordScore } = usePlayStats();
  const ambient = useAmbient();
  const [active, setActive] = useState(null); // { kind: "game", game } | { kind: "video", video }
  const [videoKind, setVideoKind] = useState("All");
  const [card, setCard] = useState({ type: "fact", index: 0 });
  const openedAt = useRef(0);

  const open = (item) => {
    openedAt.current = Date.now();
    setActive(item);
  };
  const close = () => {
    addTime((Date.now() - openedAt.current) / 1000);
    setActive(null);
  };

  const shuffleCard = (type = card.type) => {
    const list = type === "fact" ? FACTS : JOKES;
    let index = Math.floor(Math.random() * list.length);
    if (type === card.type && index === card.index) index = (index + 1) % list.length;
    setCard({ type, index });
  };

  const surprise = () => {
    const roll = Math.floor(Math.random() * 5);
    if (roll === 0) {
      const game = GAMES[Math.floor(Math.random() * GAMES.length)];
      toast(`Surprise: ${game.title}`, "info");
      open({ kind: "game", game });
    } else if (roll === 1) {
      const video = VIDEOS[Math.floor(Math.random() * VIDEOS.length)];
      toast("Surprise: something to watch", "info");
      open({ kind: "video", video });
    } else if (roll === 2) {
      const sound = SOUNDS[Math.floor(Math.random() * SOUNDS.length)];
      playAmbient(sound.id);
      toast(`Surprise: ${sound.label} sounds`, "info");
    } else {
      shuffleCard(roll === 3 ? "joke" : "fact");
      document.getElementById("random-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const minutes = Math.floor((stats.seconds || 0) / 60);
  const videos = VIDEOS.filter((v) => videoKind === "All" || v.kind === videoKind);
  const text = card.type === "fact" ? FACTS[card.index] : JOKES[card.index];

  return (
    <Stagger className="space-y-4 lg:space-y-6">
      {/* Hero */}
      <Rise as="section" className="relative overflow-hidden rounded-4xl bg-linear-to-br from-violet-600 via-indigo-600 to-sky-600 p-6 text-white shadow-xl shadow-indigo-700/20 lg:p-10">
        <motion.div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-fuchsia-400/30 blur-3xl" animate={{ x: [0, -40, 0], y: [0, 30, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-sky-300/30 blur-3xl" animate={{ x: [0, 40, 0] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }} />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">Play & unwind</p>
            <h1 className="font-display mt-1 text-3xl font-semibold lg:text-5xl">Give the craving something else to chase.</h1>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
                <Timer className="h-4 w-4" /> <AnimatedNumber value={minutes} /> min spent here instead
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
                <Trophy className="h-4 w-4" /> <AnimatedNumber value={stats.challengesDone || 0} /> {stats.challengesDone === 1 ? "challenge" : "challenges"} done
              </span>
            </div>
          </div>
          <motion.button
            onClick={surprise}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="group flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-semibold text-indigo-700 shadow-lg"
          >
            <motion.span className="flex" whileHover={{ rotate: 180 }} transition={spring}>
              <Dices className="h-5 w-5" />
            </motion.span>
            Surprise me
          </motion.button>
        </div>
      </Rise>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        {/* Spin wheel */}
        <Rise as="section" className="card">
          <SectionTitle icon={Shuffle}>Spin a challenge</SectionTitle>
          <SpinWheel
            onComplete={(c) => {
              completeChallenge();
              celebrate();
              toast(`Nice! “${c.label}” done.`);
            }}
          />
        </Rise>

        <div className="space-y-4 lg:space-y-6">
          {/* Random fun */}
          <Rise as="section" id="random-card" className="card">
            <SectionTitle
              icon={card.type === "fact" ? Lightbulb : Laugh}
              action={
                <div className="flex rounded-xl bg-slate-100 p-0.5 text-xs font-semibold">
                  {[
                    ["fact", "Fact"],
                    ["joke", "Joke"],
                  ].map(([id, label]) => (
                    <button key={id} onClick={() => shuffleCard(id)} className={`relative rounded-lg px-3 py-1 ${card.type === id ? "text-slate-900" : "text-slate-500"}`}>
                      {card.type === id && <motion.span layoutId="fun-toggle" className="absolute inset-0 rounded-lg bg-white shadow-sm" transition={spring} />}
                      <span className="relative">{label}</span>
                    </button>
                  ))}
                </div>
              }
            >
              {card.type === "fact" ? "Did you know?" : "Quick laugh"}
            </SectionTitle>
            <div className="relative min-h-24">
              <AnimatePresence mode="wait">
                <motion.p
                  key={`${card.type}-${card.index}`}
                  initial={{ opacity: 0, rotateX: -60, y: 10 }}
                  animate={{ opacity: 1, rotateX: 0, y: 0 }}
                  exit={{ opacity: 0, rotateX: 60, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="font-display text-xl leading-relaxed text-slate-800"
                >
                  {text}
                </motion.p>
              </AnimatePresence>
            </div>
            <button onClick={() => shuffleCard()} className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-violet-700 hover:underline">
              <Shuffle className="h-4 w-4" /> Another one
            </button>
          </Rise>

          {/* Sounds */}
          <Rise as="section" className="card">
            <SectionTitle icon={Headphones}>Calming sounds</SectionTitle>
            <div className="grid grid-cols-5 gap-2">
              {SOUNDS.map((s) => {
                const Icon = SOUND_ICONS[s.id];
                const on = ambient.playing === s.id;
                return (
                  <Pressable
                    key={s.id}
                    onClick={() => playAmbient(s.id)}
                    aria-pressed={on}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl py-3 text-xs font-semibold transition-colors ${on ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
                  >
                    <span className="flex h-6 items-center">{on ? <Equalizer /> : <Icon className="h-5 w-5" />}</span>
                    {s.label}
                  </Pressable>
                );
              })}
            </div>
            <AnimatePresence>
              {ambient.playing && (
                <motion.label initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 flex items-center gap-3 overflow-hidden text-sm text-slate-500">
                  Volume
                  <input type="range" min="0" max="1" step="0.05" value={ambient.volume} onChange={(e) => setAmbientVolume(Number(e.target.value))} className="flex-1 accent-violet-600" aria-label="Volume" />
                </motion.label>
              )}
            </AnimatePresence>
          </Rise>
        </div>
      </div>

      {/* Games */}
      <Rise as="section">
        <SectionTitle icon={PlayCircle}>Games</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:gap-4">
          {GAMES.map((g) => (
            <Pressable key={g.id} onClick={() => open({ kind: "game", game: g })} className="card group flex items-center gap-4 overflow-hidden p-4 text-left sm:flex-col sm:items-start">
              <span className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${g.art} text-white shadow-lg sm:h-20 sm:w-full`}>
                <motion.span className="flex" whileHover={{ scale: 1.2, rotate: -8 }} transition={spring}>
                  <g.Icon className="h-7 w-7 sm:h-9 sm:w-9" />
                </motion.span>
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-slate-900">{g.title}</span>
                <span className="block text-sm text-slate-500">{g.blurb}</span>
                {stats.best?.[g.id] !== undefined && (
                  <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-amber-700">
                    <Trophy className="h-3.5 w-3.5" /> Best {stats.best[g.id]}
                    {g.unit}
                  </span>
                )}
              </span>
            </Pressable>
          ))}
        </div>
      </Rise>

      {/* Videos */}
      <Rise as="section">
        <SectionTitle icon={PlayCircle}>Watch something</SectionTitle>
        <div className="scrollbar-hide -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          {VIDEO_KINDS.map((k) => (
            <button key={k} onClick={() => setVideoKind(k)} className={`relative shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${videoKind === k ? "border-transparent text-white" : "border-slate-200 bg-white/80 text-slate-600"}`}>
              {videoKind === k && <motion.span layoutId="video-kind" className="absolute inset-0 rounded-full bg-violet-600" transition={spring} />}
              <span className="relative">{k}</span>
            </button>
          ))}
        </div>
        <motion.div layout className="scrollbar-hide -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
          <AnimatePresence mode="popLayout" initial={false}>
            {videos.map((v) => (
              <motion.button
                layout
                key={v.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => open({ kind: "video", video: v })}
                className="card group w-64 shrink-0 snap-start overflow-hidden p-0 text-left lg:w-auto"
              >
                <span className="relative block aspect-video overflow-hidden bg-slate-200">
                  <Image src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" fill sizes="(min-width: 1024px) 33vw, 256px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute inset-0 flex items-center justify-center bg-slate-900/10 opacity-0 transition-opacity group-hover:opacity-100">
                    <PlayCircle className="h-12 w-12 text-white drop-shadow-lg" />
                  </span>
                  <span className="absolute top-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">{v.kind}</span>
                  {v.mins > 0 && <span className="absolute right-2 bottom-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-semibold text-white">{v.mins} min</span>}
                </span>
                <span className="block p-3">
                  <span className="line-clamp-2 block font-semibold text-slate-900">{v.title}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{v.by}</span>
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </Rise>

      <AnimatePresence>
        {active?.kind === "game" && (
          <Sheet key="game" onClose={close} title={active.game.title} size="full">
            <active.game.Comp best={stats.best?.[active.game.id]} onFinish={(score) => {
              const isBest = recordScore(active.game.id, score, active.game.lowerIsBetter);
              if (isBest) celebrate();
              return isBest;
            }} />
          </Sheet>
        )}
        {active?.kind === "video" && (
          <Sheet key="video" onClose={close} title={active.video.title} subtitle={active.video.by} size="full">
            <div className="aspect-video overflow-hidden rounded-2xl bg-black">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${active.video.id}?autoplay=1&rel=0&modestbranding=1`}
                title={active.video.title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
          </Sheet>
        )}
      </AnimatePresence>
    </Stagger>
  );
}
