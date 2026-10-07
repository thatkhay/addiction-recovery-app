// lib/icons.js
// Lucide icons for missions, chosen by what the mission measures.
import {
  Award, BookOpen, Crown, Flame, Gem, Library, Medal, MessageCircleHeart, Moon,
  MoonStar, Mountain, PenLine, Quote, Shield, ShieldCheck, Smile, Star, Sunrise, Target, Trophy,
} from "lucide-react";

const tiered = (target, tiers) => tiers.find(([max]) => target <= max)?.[1] ?? tiers[tiers.length - 1][1];

export function missionIcon(mission) {
  const t = mission.target || 1;
  switch (mission.type) {
    case "craving-first": return { Icon: Target, tint: "text-rose-600 bg-rose-50" };
    case "craving-daily": return { Icon: ShieldCheck, tint: "text-teal-700 bg-teal-50" };
    case "craving-count": return { Icon: tiered(t, [[10, Shield], [100, ShieldCheck], [1000, Award], [Infinity, Crown]]), tint: "text-teal-700 bg-teal-50" };
    case "journal-first": return { Icon: PenLine, tint: "text-sky-700 bg-sky-50" };
    case "journal-morning":
    case "morning-streak": return { Icon: Sunrise, tint: "text-amber-700 bg-amber-50" };
    case "journal-evening": return { Icon: Moon, tint: "text-indigo-700 bg-indigo-50" };
    case "evening-streak": return { Icon: MoonStar, tint: "text-indigo-700 bg-indigo-50" };
    case "journal-affirmation": return { Icon: Quote, tint: "text-violet-700 bg-violet-50" };
    case "journal-count": return { Icon: t >= 100 ? Library : BookOpen, tint: "text-sky-700 bg-sky-50" };
    case "mood-first":
    case "mood-count": return { Icon: Smile, tint: "text-violet-700 bg-violet-50" };
    case "ai-first":
    case "ai-count": return { Icon: MessageCircleHeart, tint: "text-amber-700 bg-amber-50" };
    case "perfect-week": return { Icon: Star, tint: "text-amber-700 bg-amber-50" };
    case "perfect-month": return { Icon: Trophy, tint: "text-amber-700 bg-amber-50" };
    case "streak": return { Icon: tiered(t, [[14, Flame], [60, Medal], [180, Award], [365, Mountain], [1095, Crown], [Infinity, Gem]]), tint: "text-orange-700 bg-orange-50" };
    default: return { Icon: Star, tint: "text-slate-700 bg-slate-100" };
  }
}
