// constants/play.js
// Content for the Play space. Video IDs were verified against YouTube's oEmbed endpoint.
import {
  Brush, CupSoda, Droplets, Dumbbell, Footprints, Music2, Phone, Sparkles as Shine, StretchHorizontal, Sun,
} from "lucide-react";

export const VIDEOS = [
  { id: "inpok4MKVLM", title: "5-minute meditation you can do anywhere", by: "Goodful", mins: 5, kind: "Calm" },
  { id: "O-6f5wQXSu8", title: "10-minute meditation for anxiety", by: "Goodful", mins: 10, kind: "Calm" },
  { id: "ZToicYcHIOU", title: "Daily Calm: 10-minute mindfulness", by: "Calm", mins: 10, kind: "Calm" },
  { id: "d4S4twjeWTs", title: "Meditation for inner peace", by: "Yoga With Adriene", mins: 12, kind: "Calm" },
  { id: "PY9DcIMGxMs", title: "Everything you think you know about addiction is wrong", by: "Johann Hari · TED", mins: 15, kind: "Learn" },
  { id: "-moW9jvvMr4", title: "A simple way to break a bad habit", by: "Judson Brewer · TED", mins: 10, kind: "Learn" },
  { id: "RcGyVTAoXEU", title: "How to make stress your friend", by: "Kelly McGonigal · TED", mins: 14, kind: "Learn" },
  { id: "8jPQjjsBbIc", title: "How to stay calm when you know you’ll be stressed", by: "Daniel Levitin · TED", mins: 12, kind: "Learn" },
  { id: "75d_29QWELk", title: "Change your life, one tiny step at a time", by: "Kurzgesagt", mins: 10, kind: "Learn" },
  { id: "iCvmsMzlF7o", title: "The power of vulnerability", by: "Brené Brown · TED", mins: 20, kind: "Learn" },
  { id: "4q1dgn_C0AU", title: "The surprising science of happiness", by: "Dan Gilbert · TED", mins: 21, kind: "Learn" },
  { id: "arj7oStGLkU", title: "Inside the mind of a master procrastinator", by: "Tim Urban · TED", mins: 14, kind: "Laugh" },
  { id: "DWcJFNfaw9c", title: "Lofi hip hop radio: beats to sleep and chill to", by: "Lofi Girl", mins: 0, kind: "Music" },
  { id: "eKFTSSKCzWA", title: "Forest waterfall nature sounds", by: "johnnielawson", mins: 0, kind: "Music" },
  { id: "2OEL4P1Rz04", title: "The Hidden Valley: ambient relaxing music", by: "Soothing Relaxation", mins: 0, kind: "Music" },
];

export const CHALLENGES = [
  { label: "Drink a full glass of water", Icon: Droplets, color: "#0ea5e9" },
  { label: "Do 10 push-ups or squats", Icon: Dumbbell, color: "#f43f5e" },
  { label: "Step outside for 5 minutes", Icon: Sun, color: "#f59e0b" },
  { label: "Text someone you like", Icon: Phone, color: "#10b981" },
  { label: "Make a warm drink, slowly", Icon: CupSoda, color: "#8b5cf6" },
  { label: "Stretch for 2 minutes", Icon: StretchHorizontal, color: "#0d9488" },
  { label: "Doodle anything for 3 minutes", Icon: Brush, color: "#ec4899" },
  { label: "Dance to one whole song", Icon: Music2, color: "#6366f1" },
  { label: "Walk around the block", Icon: Footprints, color: "#14b8a6" },
  { label: "Tidy one small thing", Icon: Shine, color: "#eab308" },
];

export const FACTS = [
  "Octopuses have three hearts and blue blood.",
  "Sea otters hold hands while they sleep so they don’t drift apart.",
  "A group of flamingos is called a flamboyance.",
  "Bananas are botanically berries. Strawberries aren’t.",
  "A day on Venus is longer than a year on Venus.",
  "Wombats produce cube-shaped droppings.",
  "Butterflies taste with sensors on their feet.",
  "Sharks have been around longer than trees.",
  "The Eiffel Tower grows a few centimetres taller in summer heat.",
  "Your brain uses about a fifth of your body’s energy.",
  "Honey found in ancient Egyptian tombs was still edible.",
  "There are more possible games of chess than atoms in the observable universe.",
  "Cravings typically peak and pass in under half an hour. You can outlast them.",
  "Exercise releases endorphins, the same family of chemicals many substances imitate.",
];

export const JOKES = [
  "I told my partner they were drawing her eyebrows too high. They looked surprised.",
  "Why don’t skeletons fight each other? They don’t have the guts.",
  "I’m reading a book about anti-gravity. It’s impossible to put down.",
  "What do you call a fake noodle? An impasta.",
  "Why did the scarecrow win an award? He was outstanding in his field.",
  "I used to hate facial hair, but then it grew on me.",
  "What do you call a bear with no teeth? A gummy bear.",
  "Why can’t you trust atoms? They make up everything.",
  "Parallel lines have so much in common. It’s a shame they’ll never meet.",
  "I only know 25 letters of the alphabet. I don’t know y.",
];

export const THOUGHTS = [
  "You don’t have to see the whole staircase. Just take the next step.",
  "Cravings are waves. You’re learning to surf.",
  "Every ‘no’ to the urge is a ‘yes’ to the life you want.",
  "Healing isn’t linear. Showing up still counts on the hard days.",
  "You’ve survived every bad day so far. That’s a perfect record.",
  "Feelings are visitors. Let them come and go.",
  "Rest is part of the work.",
  "The urge will pass whether you act on it or not.",
  "Small steps, repeated, become a new life.",
  "Be as kind to yourself as you would be to a friend.",
  "Discomfort now is the price of freedom later. It’s worth it.",
  "You are not your worst day.",
  "Progress, not perfection.",
  "Today only asks for today.",
];

/** Same thought all day, a new one tomorrow. */
export function thoughtOfTheDay(now = new Date()) {
  const start = new Date(now.getFullYear(), 0, 0);
  const day = Math.floor((now - start) / 86400000);
  return THOUGHTS[day % THOUGHTS.length];
}
