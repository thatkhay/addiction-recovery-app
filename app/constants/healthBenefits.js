// constants/healthBenefits.js
// General timelines; individual recovery varies.
import {
  Activity, Brain, Droplet, Droplets, Footprints, HeartPulse, Leaf, Moon,
  Smile, Sprout, Trophy, Wind, Crown, Gem, Target, Flower2, Sun,
  Wallet, Eye, Users, Battery, Apple, Coffee, Focus, HandHeart,
} from "lucide-react";
import { categoryFor } from "../lib/personalize";

const NICOTINE = [
  { hours: 0.33, title: "20 minutes", Icon: HeartPulse, benefit: "Heart rate and blood pressure begin to drop toward normal." },
  { hours: 12, title: "12 hours", Icon: Wind, benefit: "Carbon monoxide in your blood falls back to normal levels." },
  { hours: 24, title: "1 day", Icon: Sprout, benefit: "Your heart is already under less strain." },
  { hours: 48, title: "2 days", Icon: Flower2, benefit: "Nerve endings start to recover. Taste and smell begin to sharpen." },
  { hours: 72, title: "3 days", Icon: Wind, benefit: "Nicotine is out of your system. Breathing often feels easier." },
  { hours: 336, title: "2 weeks", Icon: Footprints, benefit: "Circulation improves and walking gets easier." },
  { hours: 720, title: "1 month", Icon: Target, benefit: "Lung function keeps improving; coughing and shortness of breath ease." },
  { hours: 2160, title: "3 months", Icon: Activity, benefit: "Lung cilia regrow, helping clear mucus and fight infection." },
  { hours: 8760, title: "1 year", Icon: Trophy, benefit: "Your risk of coronary heart disease is about half that of a smoker." },
  { hours: 43800, title: "5 years", Icon: Crown, benefit: "Stroke risk can fall to that of a non-smoker." },
  { hours: 87600, title: "10 years", Icon: Gem, benefit: "Lung cancer risk is roughly half that of someone who still smokes." },
];

const ALCOHOL = [
  { hours: 24, title: "1 day", Icon: Droplets, benefit: "Blood sugar starts to stabilise and your body begins to rehydrate." },
  { hours: 72, title: "3 days", Icon: Brain, benefit: "The worst of acute withdrawal usually passes. Clarity starts returning." },
  { hours: 168, title: "1 week", Icon: Moon, benefit: "Sleep quality starts to improve. You may feel more rested." },
  { hours: 336, title: "2 weeks", Icon: Leaf, benefit: "Stomach lining recovers; reflux and digestion often improve." },
  { hours: 720, title: "1 month", Icon: Sun, benefit: "Liver fat can drop noticeably. Skin, energy and blood pressure improve." },
  { hours: 2160, title: "3 months", Icon: Droplet, benefit: "Blood cells renew. Energy, mood and concentration keep improving." },
  { hours: 4320, title: "6 months", Icon: Smile, benefit: "Memory and emotional steadiness continue to strengthen." },
  { hours: 8760, title: "1 year", Icon: Trophy, benefit: "Lower risk of liver disease, heart disease and several cancers." },
];

const GENERAL = [
  { hours: 24, title: "1 day", Icon: Sprout, benefit: "You've broken the cycle for a full day. Your body is starting to reset." },
  { hours: 72, title: "3 days", Icon: Brain, benefit: "Early withdrawal often peaks and begins to ease." },
  { hours: 168, title: "1 week", Icon: Activity, benefit: "Sleep and energy commonly start to steady." },
  { hours: 336, title: "2 weeks", Icon: Activity, benefit: "New routines are taking hold; urges often get less frequent." },
  { hours: 720, title: "1 month", Icon: Target, benefit: "Your brain's reward system is recalibrating. Everyday pleasures feel more vivid." },
  { hours: 2160, title: "3 months", Icon: Gem, benefit: "A major milestone. Habits and identity are genuinely shifting." },
  { hours: 4320, title: "6 months", Icon: HeartPulse, benefit: "Relationships, focus and confidence are rebuilding." },
  { hours: 8760, title: "1 year", Icon: Trophy, benefit: "A full year. You've proven you can live this way." },
];

const CANNABIS = [
  { hours: 24, title: "1 day", Icon: Sprout, benefit: "You’ve broken the daily cycle. THC is already leaving your bloodstream." },
  { hours: 72, title: "3 days", Icon: Moon, benefit: "Irritability and poor sleep are common now. They usually peak this week, then ease." },
  { hours: 168, title: "1 week", Icon: Brain, benefit: "Withdrawal symptoms typically begin to settle. Vivid dreams are sleep returning to normal." },
  { hours: 336, title: "2 weeks", Icon: Wind, benefit: "If you smoked, breathing and coughing often improve." },
  { hours: 720, title: "1 month", Icon: Focus, benefit: "Memory, focus and motivation commonly feel sharper." },
  { hours: 2160, title: "3 months", Icon: Sun, benefit: "Mood tends to be steadier, and new routines feel natural." },
  { hours: 8760, title: "1 year", Icon: Trophy, benefit: "A full year. Your relationship with stress and rest has been rebuilt." },
];

const OPIOIDS = [
  { hours: 24, title: "1 day", Icon: HandHeart, benefit: "Withdrawal is hard. Getting through a day is a big deal. Ask a doctor about support." },
  { hours: 72, title: "3 days", Icon: Activity, benefit: "Acute physical symptoms usually peak around now, then start to ease." },
  { hours: 168, title: "1 week", Icon: Battery, benefit: "Most acute physical withdrawal has passed for short-acting opioids." },
  { hours: 720, title: "1 month", Icon: Moon, benefit: "Sleep and energy keep improving, though mood can still dip. That’s normal." },
  { hours: 2160, title: "3 months", Icon: Brain, benefit: "Your brain’s reward system has had real time to rebalance." },
  { hours: 4320, title: "6 months", Icon: Users, benefit: "Relationships, work and routines have room to grow again." },
  { hours: 8760, title: "1 year", Icon: Trophy, benefit: "A year of recovery. Long-term outcomes keep improving from here." },
];

const STIMULANTS = [
  { hours: 24, title: "1 day", Icon: Battery, benefit: "The crash is the body catching up on rest. Sleep as much as you need." },
  { hours: 72, title: "3 days", Icon: Apple, benefit: "Appetite starts returning. Regular meals help your mood recover." },
  { hours: 168, title: "1 week", Icon: Moon, benefit: "Sleep patterns begin to normalise." },
  { hours: 720, title: "1 month", Icon: HeartPulse, benefit: "Heart rate and blood pressure are no longer being pushed up daily." },
  { hours: 2160, title: "3 months", Icon: Brain, benefit: "Mood and the ability to enjoy everyday things keep recovering." },
  { hours: 8760, title: "1 year", Icon: Trophy, benefit: "A year clean. A huge achievement for body and mind." },
];

const GAMBLING = [
  { hours: 24, title: "1 day", Icon: Wallet, benefit: "Every bet not placed is money that stays yours." },
  { hours: 168, title: "1 week", Icon: Brain, benefit: "The constant pull to check odds and games starts to quieten." },
  { hours: 720, title: "1 month", Icon: Moon, benefit: "Many people sleep better without the highs and lows of wins and losses." },
  { hours: 2160, title: "3 months", Icon: Users, benefit: "Trust with the people around you has room to rebuild." },
  { hours: 4320, title: "6 months", Icon: Target, benefit: "Financial plans become possible again: savings, debts paid down." },
  { hours: 8760, title: "1 year", Icon: Trophy, benefit: "A full year. That’s a year of income kept and decisions made clearly." },
];

const DIGITAL = [
  { hours: 24, title: "1 day", Icon: Sprout, benefit: "A full day of choosing differently. The habit loop is already weakening." },
  { hours: 72, title: "3 days", Icon: Eye, benefit: "Urges can feel restless now. That’s your attention looking for its old reward." },
  { hours: 168, title: "1 week", Icon: Moon, benefit: "Many people fall asleep more easily without late-night screens." },
  { hours: 336, title: "2 weeks", Icon: Focus, benefit: "Focus and patience for slower things often start returning." },
  { hours: 720, title: "1 month", Icon: Smile, benefit: "Everyday pleasures can feel more rewarding as your brain recalibrates." },
  { hours: 2160, title: "3 months", Icon: Users, benefit: "More time and attention for people and things you care about." },
  { hours: 8760, title: "1 year", Icon: Trophy, benefit: "A year of reclaimed time and attention." },
];

const FOOD = [
  { hours: 24, title: "1 day", Icon: Droplets, benefit: "Blood sugar has had a day without big spikes and crashes." },
  { hours: 72, title: "3 days", Icon: Brain, benefit: "Cravings can be loud now. They tend to settle after the first week." },
  { hours: 168, title: "1 week", Icon: Battery, benefit: "Energy is often steadier through the day." },
  { hours: 336, title: "2 weeks", Icon: Apple, benefit: "Taste adapts: naturally sweet foods start tasting sweeter." },
  { hours: 720, title: "1 month", Icon: Smile, benefit: "Many people notice better mood, skin and sleep." },
  { hours: 2160, title: "3 months", Icon: Trophy, benefit: "New eating habits are becoming second nature." },
];

const CAFFEINE = [
  { hours: 24, title: "1 day", Icon: Coffee, benefit: "Headaches are common now. Drink water and rest. They pass." },
  { hours: 48, title: "2 days", Icon: Activity, benefit: "Withdrawal usually peaks around here." },
  { hours: 168, title: "1 week", Icon: Battery, benefit: "Most withdrawal symptoms have usually faded. Energy evens out." },
  { hours: 336, title: "2 weeks", Icon: Moon, benefit: "Deeper, more restful sleep for many people." },
  { hours: 720, title: "1 month", Icon: HeartPulse, benefit: "Fewer jitters and less anxiety for many." },
];


const SEDATIVES = [
  { hours: 24, title: "1 day", Icon: HandHeart, benefit: "If you’re tapering with a doctor, every step down counts. Go slowly and safely." },
  { hours: 168, title: "1 week", Icon: Moon, benefit: "Sleep may be unsettled. A steady bedtime routine helps your body relearn sleep." },
  { hours: 720, title: "1 month", Icon: Brain, benefit: "Clearer thinking and memory are common as sedation lifts." },
  { hours: 2160, title: "3 months", Icon: Sun, benefit: "Your own calming skills keep getting stronger." },
  { hours: 8760, title: "1 year", Icon: Trophy, benefit: "A year. Your nervous system has had real time to recover." },
];

const SHOPPING = [
  { hours: 24, title: "1 day", Icon: Wallet, benefit: "A day without impulse buys. Your money is staying put." },
  { hours: 168, title: "1 week", Icon: Brain, benefit: "The urge to check deals and baskets starts to quieten." },
  { hours: 720, title: "1 month", Icon: Target, benefit: "A full month of spending on purpose. Look at what you’ve kept." },
  { hours: 2160, title: "3 months", Icon: Smile, benefit: "Less clutter, less guilt, and more room for what matters." },
  { hours: 8760, title: "1 year", Icon: Trophy, benefit: "A year of financial freedom you built yourself." },
];

const LISTS = {
  nicotine: NICOTINE, alcohol: ALCOHOL, cannabis: CANNABIS, opioids: OPIOIDS, stimulants: STIMULANTS,
  gambling: GAMBLING, digital: DIGITAL, porn: DIGITAL, gaming: DIGITAL, food: FOOD, caffeine: CAFFEINE,
  sedatives: SEDATIVES, shopping: SHOPPING,
};

/** Pass the user's profile (or a plain addiction string for older callers). */
export function benefitsFor(userData) {
  const kind = categoryFor(typeof userData === "string" ? { addiction: userData } : userData);
  return { kind, list: LISTS[kind] || GENERAL };
}
