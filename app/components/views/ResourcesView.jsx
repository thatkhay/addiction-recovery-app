// components/views/ResourcesView.jsx
"use client";
import React from "react";
import { Apple, Book, ExternalLink, Footprints, Globe, Hourglass, Lightbulb, MessageSquareHeart, Phone, Snowflake, UserPlus, Users, Wind } from "lucide-react";
import { Pressable, Rise, Stagger } from "../ui/motion";

const COPING = [
  { Icon: Wind, tint: "bg-teal-50 text-teal-700", title: "Breathe it down", text: "In for 4, hold for 4, out for 6. Five rounds. The SOS button guides you." },
  { Icon: Hourglass, tint: "bg-violet-50 text-violet-700", title: "Delay 15 minutes", text: "Tell yourself ‘not now, maybe later’. Most urges fade before the timer ends." },
  { Icon: Footprints, tint: "bg-sky-50 text-sky-700", title: "Move your body", text: "A 10-minute walk changes your brain chemistry and your surroundings." },
  { Icon: Apple, tint: "bg-rose-50 text-rose-700", title: "Check HALT", text: "Are you Hungry, Angry, Lonely or Tired? Fix that first." },
  { Icon: Snowflake, tint: "bg-cyan-50 text-cyan-700", title: "Cold reset", text: "Cold water on your face or holding ice calms your nervous system fast." },
  { Icon: MessageSquareHeart, tint: "bg-amber-50 text-amber-700", title: "Say it out loud", text: "Text or call someone. Cravings lose power when they’re shared." },
];

function getResources(addiction) {
  const a = addiction.toLowerCase();
  const helplines = [
    { name: "988 Suicide & Crisis Lifeline", label: "988", dial: "988", description: "US · call or text, 24/7" },
    { name: "SAMHSA National Helpline", label: "1-800-662-4357", dial: "18006624357", description: "US · treatment referral, free & confidential" },
  ];
  const groups = [
    { name: "SMART Recovery", url: "https://smartrecovery.org/", description: "Science-based meetings, online and in person" },
  ];

  if (/smok|cigar|vap|nicotine|tobacco/.test(a)) {
    helplines.push({ name: "Quitline", label: "1-800-QUIT-NOW", dial: "18007848669", description: "US · free quit coaching" });
    groups.push(
      { name: "Smokefree.gov", url: "https://smokefree.gov/", description: "Free tools, texting programs and apps" },
      { name: "Nicotine Anonymous", url: "https://nicotine-anonymous.org/", description: "Find a meeting" }
    );
  } else if (/alcohol|drink/.test(a)) {
    groups.push(
      { name: "Alcoholics Anonymous", url: "https://www.aa.org/find-aa", description: "Find local and online AA meetings" },
      { name: "Al-Anon", url: "https://al-anon.org/", description: "Support for family and friends" }
    );
  } else if (/gambl|bet/.test(a)) {
    helplines.push({ name: "National Problem Gambling Helpline", label: "1-800-522-4700", dial: "18005224700", description: "US · 24/7, call or text" });
    groups.push(
      { name: "Gamblers Anonymous", url: "https://www.gamblersanonymous.org/", description: "Find a GA meeting" },
      { name: "NCPG", url: "https://www.ncpgambling.org/", description: "Resources and treatment finder" }
    );
  } else if (/opioid|heroin|fentanyl|pill|drug|cocaine|meth|cannabis|weed/.test(a)) {
    groups.push({ name: "Narcotics Anonymous", url: "https://na.org/meetingsearch/", description: "Find an NA meeting" });
  }

  return { helplines, groups };
}

export default function ResourcesView({ userData, onOpenSettings }) {
  const { helplines, groups } = getResources(userData.addiction);
  const contacts = userData.supportContacts || [];

  return (
    <Stagger className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 lg:gap-6">
      <Rise as="section" className="card bg-rose-50/90 ring-rose-200">
        <h2 className="flex items-center gap-2 font-semibold text-rose-950">
          <Phone className="h-5 w-5 text-rose-600" /> Crisis support
        </h2>
        <p className="mt-1 text-sm text-rose-900/80">If you’re in danger or thinking about harming yourself, reach out now. You’re not alone.</p>
        <div className="mt-3 space-y-2">
          {helplines.map((h) => (
            <a key={h.name} href={`tel:${h.dial}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3.5 transition hover:bg-rose-50/50">
              <div>
                <div className="font-semibold text-slate-900">{h.name}</div>
                <div className="text-xs text-slate-500">{h.label} · {h.description}</div>
              </div>
              <Phone className="h-5 w-5 shrink-0 text-rose-600" />
            </a>
          ))}
          <a href="https://findahelpline.com/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3.5 transition hover:bg-rose-50/50">
            <div>
              <div className="font-semibold text-slate-900">Outside the US?</div>
              <div className="text-xs text-slate-500">Find a free helpline in your country</div>
            </div>
            <Globe className="h-5 w-5 shrink-0 text-rose-600" />
          </a>
        </div>
      </Rise>

      <Rise as="section" className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <Users className="h-5 w-5 text-teal-600" /> Your people
          </h2>
          <button onClick={onOpenSettings} className="flex items-center gap-1 text-sm font-semibold text-teal-700">
            <UserPlus className="h-4 w-4" /> {contacts.length ? "Edit" : "Add"}
          </button>
        </div>
        {contacts.length === 0 ? (
          <p className="text-sm text-slate-500">Add a sponsor, friend or family member. They’ll be one tap away in the SOS toolkit.</p>
        ) : (
          <div className="space-y-2">
            {contacts.map((c) => (
              <a key={c.id} href={`tel:${c.phone}`} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5">
                <div>
                  <div className="font-semibold text-slate-900">{c.name}</div>
                  <div className="text-xs text-slate-500">{c.phone}</div>
                </div>
                <Phone className="h-5 w-5 text-teal-600" />
              </a>
            ))}
          </div>
        )}
      </Rise>

      <Rise as="section" className="card lg:col-span-2">
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
          <Lightbulb className="h-5 w-5 text-amber-500" /> Coping toolkit
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 lg:gap-3">
          {COPING.map((c) => (
            <Pressable key={c.title} className="flex items-start gap-3 rounded-2xl bg-slate-50/80 p-4 text-left">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.tint}`}>
                <c.Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold text-slate-900">{c.title}</span>
                <span className="mt-0.5 block text-sm text-slate-600">{c.text}</span>
              </span>
            </Pressable>
          ))}
        </div>
      </Rise>

      <Rise as="section" className="card lg:col-span-2">
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
          <Book className="h-5 w-5 text-sky-600" /> Groups & programs
        </h2>
        <div className="space-y-2">
          {[...groups, { name: "Psychology Today", url: "https://www.psychologytoday.com/us/therapists", description: "Find a therapist who specialises in addiction" }].map((g) => (
            <a key={g.name} href={g.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3.5 transition hover:bg-slate-100">
              <div>
                <div className="font-semibold text-slate-900">{g.name}</div>
                <div className="text-xs text-slate-500">{g.description}</div>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
            </a>
          ))}
        </div>
      </Rise>
    </Stagger>
  );
}
