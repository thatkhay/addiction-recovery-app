// lib/personalize.js
// Tailors content to what someone is recovering from, how far along they are,
// and their own patterns. Everything here works offline; the AI "For you" card
// (app/api/insight) builds on the same signals.
import { Apple, CupSoda, Droplets, Moon, Phone, PiggyBank, Smartphone, UtensilsCrossed } from "lucide-react";
import { DAY, dayKey } from "../utils/dateUtils";
import { byId, matchAddiction } from "./addictions";

export const CATEGORIES = {
  alcohol: /alcohol|drink|beer|wine|liquor|booze|vodka|whisk/i,
  nicotine: /smok|cigar|vap|nicotine|tobacco|juul|snus/i,
  gambling: /gambl|\bbet(s|ting)?\b|casino|poker|\bslots?\b|lotter/i,
  cannabis: /cannabis|weed|marijuana|\bpot\b|\bthc\b|hash|edible/i,
  opioids: /opioid|opiate|heroin|fentanyl|oxy|percocet|painkill|codeine|tramadol|morphine/i,
  stimulants: /cocaine|\bcoke\b|\bmeth\b|amphetamine|adderall|\bcrack\b|\bspeed\b/i,
  porn: /porn|sex addic|masturbat/i,
  sedatives: /benzo|xanax|valium|klonopin|ativan|sleeping pill|ambien/i,
  gaming: /gaming|video game|fortnite|roblox/i,
  shopping: /shopping|spending|impulse buy/i,
  digital: /social media|phone|screen|tiktok|instagram|scroll|internet/i,
  food: /sugar|food|binge|junk|eating/i,
  caffeine: /caffeine|coffee|energy drink/i,
};

export function categoryOf(addiction = "") {
  return Object.keys(CATEGORIES).find((k) => CATEGORIES[k].test(addiction)) || "general";
}

/**
 * The content category for a profile: the picked catalog entry wins, then a
 * catalog match on the text, then keyword rules.
 */
export function categoryFor(userData) {
  if (!userData) return "general";
  return byId(userData.addictionId)?.category ?? userData.addictionCategory ?? matchAddiction(userData.addiction)?.category ?? categoryOf(userData.addiction);
}

export function stageOf(days) {
  if (days < 4) return "early";
  if (days < 31) return "building";
  if (days < 91) return "strengthening";
  return "steady";
}

export const STAGE_LABEL = {
  early: "The first days",
  building: "Building momentum",
  strengthening: "Getting stronger",
  steady: "Living it",
};

const STAGE_NOTES = {
  early: [
    "The first few days are usually the hardest. Your only job today is to get to tonight.",
    "Your brain is noticing the change and asking loudly for the old routine. That noise fades.",
    "Expect strong urges and mood swings now. They are a sign of healing, not of failure.",
  ],
  building: [
    "Urges often come in waves now rather than constantly. Notice the gaps getting longer.",
    "This is when routines matter most. Same wake-up time, real meals, some movement.",
    "Watch for ‘just once’ thoughts. They show up when things start feeling easier.",
  ],
  strengthening: [
    "You have proof now that you can do this. Lean on it when doubt shows up.",
    "Cravings are usually triggered by situations now. Plan for the big ones ahead of time.",
    "Good time to add something new: a class, a hobby, a regular meet-up.",
  ],
  steady: [
    "Recovery is now part of who you are. Keep the habits that got you here.",
    "Complacency is the quiet risk. Check in with yourself honestly once a week.",
    "Consider helping someone earlier in the road. It strengthens your own recovery.",
  ],
};

// Category-specific content. Kept general and non-clinical on purpose.
const CONTENT = {
  alcohol: {
    tips: [
      "Have an alcohol-free drink you actually enjoy ready for the times you’d normally drink.",
      "Evenings and weekends are common danger zones. Make a plan for them before they arrive.",
      "If you’re going somewhere with drinking, arrive with an exit plan and your own drink in hand.",
      "Sugar cravings are common early on. A little fruit or chocolate is a fine trade.",
    ],
    facts: [
      "Sleep quality often improves noticeably within the first couple of weeks without alcohol.",
      "Alcohol is a depressant: many people find their anxiety eases after a few weeks off it.",
      "The liver is remarkably good at repairing itself once it gets a break.",
    ],
    challenges: [{ label: "Make a fancy alcohol-free drink", Icon: CupSoda, color: "#8b5cf6" }],
    search: "alcohol free life stories motivation",
    warning: "Stopping heavy drinking suddenly can be dangerous. If you get shakes, sweats or confusion, get medical help.",
  },
  nicotine: {
    tips: [
      "Nicotine cravings usually last a few minutes. Keep your hands and mouth busy until they pass.",
      "Coffee, alcohol and the end of meals are classic triggers. Change the routine around them.",
      "Deep breathing mimics the drag of a cigarette and calms the urge.",
      "Keep gum, toothpicks or crunchy snacks within reach for the first weeks.",
    ],
    facts: [
      "Carbon monoxide levels in your blood start dropping within hours of your last cigarette.",
      "Taste and smell often sharpen within days of quitting.",
      "Each craving you ride out makes the next one a little weaker.",
    ],
    challenges: [{ label: "Crunch a carrot or chew gum", Icon: Apple, color: "#f97316" }],
    search: "quit smoking vaping success stories",
  },
  gambling: {
    tips: [
      "Block gambling sites and apps on your phone today. Self-exclusion tools make relapse harder.",
      "Hand control of spare money to someone you trust for a while.",
      "Boredom and money worries are big triggers. Plan something for payday and quiet evenings.",
      "Chasing losses never works out. Every bet you don’t place is money kept.",
    ],
    facts: [
      "Gambling lights up the same reward pathways as substances, which is why near-misses feel so compelling.",
      "Many banks let you block gambling transactions from your card.",
      "The house edge means that, over time, the casino always comes out ahead.",
    ],
    challenges: [{ label: "Check your savings and set a goal", Icon: PiggyBank, color: "#10b981" }],
    search: "gambling addiction recovery stories",
  },
  cannabis: {
    tips: [
      "Irritability and vivid dreams are common in the first weeks. They pass.",
      "Sleep can be rough at first. Keep a wind-down routine with no screens before bed.",
      "Clear out anything you use to smoke or vape so it isn’t within easy reach.",
      "Many people used to unwind. Find a new way to unwind each evening.",
    ],
    facts: [
      "Cannabis withdrawal symptoms usually peak in the first week and ease over a few weeks.",
      "Dreams often come back vividly after stopping. That’s normal sleep returning.",
      "Memory and focus tend to sharpen over the weeks after stopping.",
    ],
    challenges: [{ label: "Plan a screen-free wind-down for tonight", Icon: Moon, color: "#6366f1" }],
    search: "quitting weed what to expect stories",
  },
  opioids: {
    tips: [
      "Medication-assisted treatment (like buprenorphine or methadone) is effective. Ask a doctor about it.",
      "Your tolerance drops quickly after stopping, so using again carries a high overdose risk. Keep naloxone nearby.",
      "Withdrawal is easier with support. You don’t have to do it alone.",
      "Gentle movement, warm baths and hydration help with aches.",
    ],
    facts: [
      "Naloxone can reverse an opioid overdose and is available without a prescription in many places.",
      "Acute withdrawal usually eases within about a week, though sleep and mood take longer.",
      "Recovery rates are much higher with ongoing support and treatment.",
    ],
    challenges: [{ label: "Text someone how you’re doing", Icon: Phone, color: "#10b981" }],
    search: "opioid recovery stories hope",
    warning: "After a break, tolerance is lower and overdose risk is higher. If you slip, never use alone and keep naloxone close.",
  },
  stimulants: {
    tips: [
      "Exhaustion and low mood are common early on. Rest is part of recovery.",
      "Cut contact with people you used with, at least for now.",
      "Eat regular meals. Stimulants suppress appetite, and your body needs fuel to heal.",
      "Exercise is one of the best natural mood lifters while your brain rebalances.",
    ],
    facts: [
      "The ‘crash’ in the first days is temporary as the brain’s chemistry rebalances.",
      "Regular exercise has been shown to help with stimulant cravings.",
      "Sleep usually improves over the first weeks.",
    ],
    challenges: [{ label: "Eat a proper meal", Icon: UtensilsCrossed, color: "#f97316" }],
    search: "addiction recovery stories hope",
  },
  porn: {
    tips: [
      "Late nights and being alone with your phone are the usual triggers. Charge it outside the bedroom.",
      "Install a blocker so the easy path isn’t easy.",
      "When the urge hits, change rooms or go outside. A change of scene breaks the loop.",
      "Loneliness and stress often sit underneath. Reach out to a real person today.",
    ],
    facts: [
      "Urges tend to be strongest late at night and when bored or stressed.",
      "Many people notice better focus and mood after a few weeks off.",
      "Habits are tied to cues. Change the cue and the urge weakens.",
    ],
    challenges: [{ label: "Put your phone in another room for 20 min", Icon: Smartphone, color: "#0ea5e9" }],
    search: "quitting porn benefits stories",
  },
  digital: {
    tips: [
      "Turn off non-essential notifications. Every ping is an invitation back in.",
      "Move the apps off your home screen, or log out so there’s a speed bump.",
      "Keep your phone out of the bedroom and buy a cheap alarm clock.",
      "Replace scrolling time with something hands-on: cooking, walking, drawing.",
    ],
    facts: [
      "Infinite scroll and variable rewards are designed to keep you hooked. It isn’t a willpower failure.",
      "Grayscale mode makes phones noticeably less compelling.",
      "Many people find their attention span recovers within a few weeks.",
    ],
    challenges: [{ label: "Switch your phone to grayscale for an hour", Icon: Smartphone, color: "#64748b" }],
    search: "digital detox benefits",
  },
  food: {
    tips: [
      "Don’t skip meals. Getting too hungry makes cravings much harder to resist.",
      "Keep trigger foods out of the house for now.",
      "Notice whether you’re physically hungry or emotionally hungry before you eat.",
      "Drink a glass of water first. Thirst often feels like hunger.",
    ],
    facts: [
      "Taste preferences adapt: sweet things start tasting sweeter after cutting back.",
      "Protein and fibre help you stay full and steady through the day.",
      "Stress raises cravings for sugary, fatty food. Tackle the stress and the craving softens.",
    ],
    challenges: [{ label: "Drink a glass of water and wait 10 minutes", Icon: Droplets, color: "#0ea5e9" }],
    search: "breaking sugar habit",
  },
  caffeine: {
    tips: [
      "Headaches are the most common withdrawal symptom. Water and rest help.",
      "Taper if you can rather than stopping all at once.",
      "Get daylight and movement in the morning for a natural energy lift.",
      "Try herbal tea or decaf to keep the ritual without the caffeine.",
    ],
    facts: [
      "Caffeine withdrawal usually peaks in the first two days and fades within about a week.",
      "Many people sleep more deeply after cutting caffeine.",
      "The ritual matters as much as the chemical. Keep the cup, change the contents.",
    ],
    challenges: [{ label: "Make a herbal tea instead", Icon: CupSoda, color: "#84cc16" }],
    search: "quitting caffeine what happens",
  },
  sedatives: {
    tips: [
      "Never stop benzodiazepines or sleeping pills abruptly after regular use. Taper with a doctor; sudden withdrawal can cause seizures.",
      "Anxiety and poor sleep can return during a taper. That’s withdrawal, not a sign you need the pills forever.",
      "Build a calm bedtime routine: same time, dim lights, no screens.",
      "Breathing exercises and grounding are real tools for anxiety. Practise them daily, not just in a crisis.",
    ],
    facts: [
      "A slow, supervised taper is the safest way off benzodiazepines.",
      "Sleep usually improves gradually over weeks after stopping sleeping pills.",
      "Rebound anxiety during a taper is common and temporary.",
    ],
    challenges: [{ label: "Do 5 minutes of slow breathing", Icon: Moon, color: "#6366f1" }],
    search: "benzodiazepine taper recovery stories",
    warning: "Stopping benzodiazepines or sleeping pills suddenly can be dangerous. Always taper with medical support.",
  },
  gaming: {
    tips: [
      "Uninstall or log out of the game that pulls you most. A speed bump changes everything.",
      "Gaming often fills a need: challenge, friends, escape. Find another way to meet that need.",
      "Late-night ‘one more game’ is the classic trap. Set a hard device curfew.",
      "Try a physical hobby with clear progress: climbing, an instrument, cooking.",
    ],
    facts: [
      "Games are built around variable rewards and progress loops, the same hooks as slot machines.",
      "Many people find sleep and mood improve within weeks of cutting back.",
      "Boredom is the most common trigger. It gets easier as new hobbies take root.",
    ],
    challenges: [{ label: "Go outside for 10 minutes without your phone", Icon: Smartphone, color: "#22c55e" }],
    search: "quitting video games what happened",
  },
  shopping: {
    tips: [
      "Delete saved cards from shopping sites and apps. Make buying slow again.",
      "Unsubscribe from marketing emails and mute shopping accounts.",
      "Use a 48-hour rule: put it in the basket, wait two days, then decide.",
      "Notice the feeling right before you buy. Boredom? Stress? Loneliness? Meet that need another way.",
    ],
    facts: [
      "The thrill often peaks before the purchase arrives, which is why the high fades so fast.",
      "Sales and countdown timers are designed to rush you past your own judgement.",
      "Tracking every purchase for a month is one of the most effective ways to cut spending.",
    ],
    challenges: [{ label: "Unsubscribe from 3 shopping emails", Icon: PiggyBank, color: "#10b981" }],
    search: "shopping addiction recovery",
  },
  general: {
    tips: [
      "Notice your triggers: people, places, times and feelings. Awareness is the first step.",
      "Have a plan for your hardest hour of the day.",
      "Tell one person you trust what you’re working on.",
      "Small routines (wake time, meals, a walk) make everything else easier.",
    ],
    facts: [
      "Cravings typically peak and fade within half an hour.",
      "Habits are linked to cues. Change the cue and the habit weakens.",
      "Every day you stay on track strengthens new pathways in your brain.",
    ],
    challenges: [],
    search: "addiction recovery motivation stories",
  },
};

const TRIGGER_TIPS = {
  Stress: "Stress is your top trigger. A 5-minute breathing break before stressful moments can take the edge off.",
  Boredom: "Boredom shows up a lot for you. Keep a short list of go-to activities ready, or open Play.",
  Loneliness: "Loneliness is a big one for you. Schedule one real conversation today, even a short call.",
  Anxiety: "Anxiety often comes before your cravings. Grounding (5-4-3-2-1) works fast. It’s in SOS.",
  Anger: "Anger is a frequent trigger. Moving your body hard for a few minutes helps burn it off.",
  Tired: "You crave more when tired. Protect your sleep tonight like it’s medicine.",
  Hungry: "Hunger triggers you. Don’t let yourself get too hungry, and keep snacks around.",
  "Social pressure": "Social situations are tough for you. Practise your ‘no thanks’ line and have an exit plan.",
  Celebration: "Celebrations are a trigger. Plan how you’ll celebrate differently next time.",
  "Saw or smelled it": "Cues around you set you off. Change your environment where you can.",
  Pain: "Pain is a trigger. Talk to a doctor about other ways to manage it.",
  "Habit / routine": "Routine moments trigger you. Swap in a new action at exactly those times.",
};

/** Deterministic pick that changes each day (and differs per list). */
export function dailyPick(list, now = Date.now(), salt = 0) {
  if (!list.length) return null;
  const day = Math.floor(new Date(dayKey(now)).getTime() / DAY);
  return list[(day + salt) % list.length];
}

/** Content for a profile (pass userData). */
export function contentFor(userData) {
  const cat = categoryFor(userData);
  return { category: cat, ...(CONTENT[cat] || CONTENT.general), general: CONTENT.general };
}

/** What we know about the person, for tailoring and for the AI insight. */
export function signalsFrom({ userData, cravings, moodEntries, daysClean, now = Date.now() }) {
  const counts = {};
  cravings.forEach((c) => (c.triggers || []).forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
  const topTriggers = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);

  const buckets = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  cravings.forEach((c) => {
    const h = new Date(c.timestamp).getHours();
    buckets[h >= 5 && h < 12 ? "morning" : h < 17 && h >= 12 ? "afternoon" : h >= 17 && h < 22 ? "evening" : "night"]++;
  });
  const peak = Object.entries(buckets).sort((a, b) => b[1] - a[1])[0];

  const recentMoods = moodEntries.slice(0, 5).map((m) => m.mood);
  const hour = new Date(now).getHours();

  return {
    category: categoryFor(userData),
    stage: stageOf(daysClean),
    daysClean,
    topTriggers,
    peakTime: peak && peak[1] >= 2 ? peak[0] : null,
    cravingsLast24h: cravings.filter((c) => now - new Date(c.timestamp).getTime() < DAY).length,
    slips: (userData.relapseHistory || []).length,
    recentMoods,
    timeOfDay: hour < 5 ? "late night" : hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 22 ? "evening" : "night",
  };
}

/** Offline "For you" card: picks the most relevant thing to say right now. */
export function offlineInsight(signals, userData, now = Date.now()) {
  const c = contentFor(userData);
  const lowMood = signals.recentMoods.slice(0, 3).filter((m) => m === "bad" || m === "terrible").length >= 2;

  if (signals.cravingsLast24h >= 3) {
    return { title: "A tough stretch", body: `You’ve logged ${signals.cravingsLast24h} cravings in the last day and you’re still here. Keep the SOS toolkit close and go easy on yourself tonight.`, action: "sos" };
  }
  if (lowMood) {
    return { title: "Heavy days", body: "Your last few check-ins have been low. That’s worth talking about. Reach out to someone, or talk it through with the coach.", action: "coach" };
  }
  if (signals.peakTime && signals.timeOfDay.includes(signals.peakTime)) {
    return { title: `Your ${signals.peakTime}s are tricky`, body: `Most of your cravings happen in the ${signals.peakTime}, and that’s now. Line up something to do for the next hour.`, action: "play" };
  }
  if (signals.topTriggers[0] && TRIGGER_TIPS[signals.topTriggers[0]]) {
    return { title: "Know your pattern", body: TRIGGER_TIPS[signals.topTriggers[0]], action: "none" };
  }
  const pool = [...STAGE_NOTES[signals.stage], ...c.tips];
  return { title: STAGE_LABEL[signals.stage], body: dailyPick(pool, now, signals.daysClean), action: "journal" };
}

export const youtubeSearchUrl = (query) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
