// constants/healthBenefits.js
// General timelines; individual recovery varies.
import {
  Activity, Brain, Droplet, Droplets, Footprints, HeartPulse, Leaf, Moon,
  Smile, Sprout, Trophy, Wind, Crown, Gem, Target, Flower2, Sun,
} from "lucide-react";

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

export function benefitsFor(addiction = "") {
  const a = addiction.toLowerCase();
  if (/smok|cigar|vap|nicotine|tobacco|juul/.test(a)) return { kind: "nicotine", list: NICOTINE };
  if (/alcohol|drink|beer|wine|liquor|booze/.test(a)) return { kind: "alcohol", list: ALCOHOL };
  return { kind: "general", list: GENERAL };
}
