// lib/addictions.js
// Everything people commonly recover from, with the words they actually use.
// Each entry maps to a content `category` used to personalise the whole app.

export const ADDICTIONS = [
  // Substances
  { id: "alcohol", label: "Alcohol", category: "alcohol", group: "Substances", aliases: ["drinking", "drink", "beer", "wine", "liquor", "vodka", "whiskey", "whisky", "booze", "spirits", "binge drinking", "rum", "gin", "tequila", "alcoholism", "hangover"] },
  { id: "smoking", label: "Smoking", category: "nicotine", group: "Substances", aliases: ["cigarettes", "cigs", "tobacco", "smokes", "cigars", "rolling tobacco", "shisha", "hookah"] },
  { id: "vaping", label: "Vaping", category: "nicotine", group: "Substances", aliases: ["vape", "e-cig", "juul", "elf bar", "disposable vape", "pods"] },
  { id: "nicotine-pouches", label: "Nicotine pouches / snus", category: "nicotine", group: "Substances", aliases: ["zyn", "snus", "pouches", "chewing tobacco", "dip", "snuff"] },
  { id: "cannabis", label: "Cannabis", category: "cannabis", group: "Drugs", aliases: ["weed", "marijuana", "pot", "thc", "hash", "edibles", "joints", "blunts", "dabs", "skunk", "ganja", "kush", "smoking weed", "wax"] },
  { id: "opioids", label: "Opioids / painkillers", category: "opioids", group: "Drugs", aliases: ["painkillers", "oxy", "oxycodone", "oxycontin", "percocet", "hydrocodone", "vicodin", "codeine", "tramadol", "morphine", "lean", "syrup", "pills"] },
  { id: "heroin", label: "Heroin", category: "opioids", group: "Drugs", aliases: ["smack", "dope", "h", "brown"] },
  { id: "fentanyl", label: "Fentanyl", category: "opioids", group: "Drugs", aliases: ["fent", "fetty", "blues", "m30"] },
  { id: "kratom", label: "Kratom", category: "opioids", group: "Drugs", aliases: ["kratom tea", "mitragynine"] },
  { id: "cocaine", label: "Cocaine", category: "stimulants", group: "Drugs", aliases: ["coke", "crack", "blow", "snow", "charlie", "yayo"] },
  { id: "meth", label: "Meth", category: "stimulants", group: "Drugs", aliases: ["methamphetamine", "crystal", "ice", "tina", "crank", "glass"] },
  { id: "adderall", label: "Prescription stimulants", category: "stimulants", group: "Drugs", aliases: ["adderall", "ritalin", "vyvanse", "amphetamine", "speed", "study drugs"] },
  { id: "mdma", label: "MDMA / ecstasy", category: "stimulants", group: "Drugs", aliases: ["molly", "ecstasy", "e", "pills", "rolling", "mandy"] },
  { id: "benzos", label: "Benzodiazepines", category: "sedatives", group: "Drugs", aliases: ["benzos", "xanax", "valium", "klonopin", "ativan", "bars", "diazepam", "alprazolam"] },
  { id: "sleeping-pills", label: "Sleeping pills", category: "sedatives", group: "Drugs", aliases: ["ambien", "zolpidem", "z drugs", "sleep meds"] },
  { id: "ketamine", label: "Ketamine", category: "stimulants", group: "Drugs", aliases: ["ket", "special k", "k"] },
  { id: "inhalants", label: "Inhalants / nitrous", category: "general", group: "Drugs", aliases: ["nitrous", "laughing gas", "whippets", "poppers", "huffing", "nos"] },
  { id: "caffeine", label: "Caffeine", category: "caffeine", group: "Substances", aliases: ["coffee", "energy drinks", "red bull", "monster", "espresso", "pre workout", "soda"] },

  // Behaviours
  { id: "porn", label: "Porn", category: "porn", group: "Behaviours", aliases: ["pornography", "masturbation", "masturbating", "fapping", "nofap", "jerking off", "onlyfans", "adult content", "nsfw", "x rated"] },
  { id: "sex", label: "Sex / hookups", category: "porn", group: "Behaviours", aliases: ["sex addiction", "hookups", "hooking up", "one night stands", "compulsive sex", "escorts", "cheating"] },
  { id: "love", label: "Love / relationships", category: "general", group: "Behaviours", aliases: ["love addiction", "toxic relationship", "ex", "codependency", "texting my ex", "situationship"] },
  { id: "gambling", label: "Gambling", category: "gambling", group: "Behaviours", aliases: ["betting", "sports betting", "casino", "slots", "poker", "blackjack", "roulette", "lottery", "scratch cards", "bets", "sportsbook", "bookies"] },
  { id: "crypto-trading", label: "Day trading / crypto", category: "gambling", group: "Behaviours", aliases: ["crypto", "trading", "options", "forex", "stocks", "meme coins", "day trading", "bitcoin"] },
  { id: "gaming", label: "Video games", category: "gaming", group: "Behaviours", aliases: ["gaming", "games", "fortnite", "call of duty", "league of legends", "minecraft", "roblox", "console", "xbox", "playstation", "mobile games", "loot boxes"] },
  { id: "social-media", label: "Social media", category: "digital", group: "Behaviours", aliases: ["instagram", "tiktok", "facebook", "twitter", "x", "snapchat", "reddit", "scrolling", "doomscrolling", "reels", "shorts"] },
  { id: "phone", label: "Phone / screen time", category: "digital", group: "Behaviours", aliases: ["phone", "screen time", "smartphone", "internet", "youtube", "netflix", "binge watching", "streaming", "tv"] },
  { id: "shopping", label: "Shopping / spending", category: "shopping", group: "Behaviours", aliases: ["shopping", "online shopping", "spending", "amazon", "impulse buying", "buying", "shein", "temu", "credit cards", "retail therapy"] },
  { id: "work", label: "Overworking", category: "general", group: "Behaviours", aliases: ["workaholic", "work", "overworking", "hustle", "burnout"] },
  { id: "exercise", label: "Compulsive exercise", category: "general", group: "Behaviours", aliases: ["gym", "overtraining", "exercise addiction", "running"] },
  { id: "self-harm", label: "Self-harm", category: "general", group: "Behaviours", crisis: true, aliases: ["cutting", "self harm", "hurting myself", "burning myself"] },

  // Food
  { id: "sugar", label: "Sugar", category: "food", group: "Food", aliases: ["sweets", "candy", "chocolate", "desserts", "cake", "soda", "fizzy drinks"] },
  { id: "junk-food", label: "Junk food", category: "food", group: "Food", aliases: ["fast food", "takeaway", "takeout", "chips", "crisps", "mcdonalds", "pizza", "snacks", "processed food"] },
  { id: "binge-eating", label: "Binge eating", category: "food", group: "Food", aliases: ["overeating", "binging", "emotional eating", "stress eating", "food addiction", "eating"] },
];

/** Broad words that need narrowing down. */
export const UMBRELLAS = {
  drugs: { prompt: "Which one, mostly?", ids: ["cannabis", "cocaine", "opioids", "heroin", "fentanyl", "meth", "benzos", "mdma", "adderall", "ketamine", "kratom", "inhalants"] },
  substances: { prompt: "Which one, mostly?", ids: ["alcohol", "smoking", "vaping", "cannabis", "cocaine", "opioids", "benzos"] },
  pills: { prompt: "What kind of pills?", ids: ["opioids", "benzos", "adderall", "sleeping-pills", "mdma"] },
  nicotine: { prompt: "In what form?", ids: ["smoking", "vaping", "nicotine-pouches"] },
  screens: { prompt: "Mostly what?", ids: ["social-media", "phone", "gaming", "porn"] },
  internet: { prompt: "Mostly what?", ids: ["social-media", "phone", "gaming", "porn", "shopping", "gambling"] },
  food: { prompt: "What kind of eating?", ids: ["sugar", "junk-food", "binge-eating"] },
  sex: { prompt: "Which fits best?", ids: ["porn", "sex", "love"] },
  money: { prompt: "Where does it go?", ids: ["gambling", "crypto-trading", "shopping"] },
};

export const POPULAR = ["alcohol", "smoking", "vaping", "cannabis", "porn", "gambling", "social-media", "sugar", "cocaine", "opioids", "gaming", "shopping"];

export const byId = (id) => ADDICTIONS.find((a) => a.id === id);

const norm = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

function score(entry, q) {
  const terms = [entry.label, entry.id.replace(/-/g, " "), ...entry.aliases].map(norm);
  let best = 0;
  for (const t of terms) {
    if (t === q) return 100;
    if (t.startsWith(q)) best = Math.max(best, 80 - (t.length - q.length) * 0.5);
    else if (q.length >= 3 && t.split(" ").some((w) => w.startsWith(q))) best = Math.max(best, 65);
    else if (q.length >= 4 && t.length >= 5 && (t.includes(q) || q.includes(t))) best = Math.max(best, 55);
    else if (q.length >= 4 && t.split(" ").some((w) => w[0] === q[0] && editDistance(w, q) <= (q.length > 6 ? 2 : 1))) best = Math.max(best, 45);
  }
  return best;
}

/**
 * Search the catalog. Returns { umbrella, results } where umbrella is set when
 * the query is a broad word like "drugs" that should be narrowed down.
 */
export function searchAddictions(query) {
  const q = norm(query);
  if (!q) return { umbrella: null, results: [] };
  const umbrellaKey = Object.keys(UMBRELLAS).find((k) => k === q || (q.length >= 4 && k.startsWith(q)) || k === q.replace(/s$/, "") || k + "s" === q);
  const umbrella = umbrellaKey ? { key: umbrellaKey, ...UMBRELLAS[umbrellaKey], options: UMBRELLAS[umbrellaKey].ids.map(byId) } : null;
  const results = ADDICTIONS.map((a) => ({ a, s: score(a, q) }))
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s)
    .slice(0, 6)
    .map((x) => x.a);
  return { umbrella, results };
}

/** Best guess for an existing free-text profile (e.g. from before the picker existed). */
export function matchAddiction(text) {
  const { results } = searchAddictions(text || "");
  return results[0] || null;
}
