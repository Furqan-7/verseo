// Hardcoded demo workspace for the hackathon. Every signed-in visitor sees
// this creator's day; swap these for real data once integrations land.

export type Category = "Brand deal" | "Collab" | "Fan question" | "Spam";
export type Platform = "Instagram" | "YouTube" | "TikTok" | "Shorts" | "Reels";

export interface Todo {
  id: string;
  title: string;
  detail: string;
  when: string;
  done: boolean;
}

export interface InboxMessage {
  id: string;
  from: string;
  initial: string;
  color: string;
  category: Category;
  subject: string;
  draft: string;
  minutesSaved: number;
}

export interface Idea {
  id: string;
  title: string;
  why: string;
  platforms: Platform[];
}

export interface Deal {
  id: string;
  brand: string;
  campaign: string;
  detail: string;
  health: number;
  value: string;
  overdue?: { amount: string; days: number; reminder: string };
}

export interface ScheduledPost {
  id: string;
  title: string;
  platform: string;
  status: string;
  when: string;
}

export interface CopilotAnswer {
  question: string;
  keywords: string[];
  answer: string;
}

export const creator = {
  name: "Maya Lopez",
  firstName: "Maya",
  initial: "M",
  audience: "180k · YouTube",
  connected: ["Gmail", "Calendar", "YouTube", "Instagram"],
};

export const today = {
  label: "Wed 28 Oct",
  summary: "2 brand deals need you, 4 replies are drafted, and Nike's Reel is due Friday.",
  minutesSavedThisWeek: 390,
};

export const stats = {
  messagesSorted: 23,
  scheduledPosts: 5,
  expectedRevenue: "$18.4k",
};

export const categoryCounts: Record<Category, number> = {
  "Brand deal": 2,
  Collab: 3,
  "Fan question": 14,
  Spam: 4,
};

export const todos: Todo[] = [
  { id: "t1", title: "Reply to Nike brief", detail: "Brand deal · approved draft", when: "9:10", done: true },
  { id: "t2", title: "Film camera setup Short", detail: "Idea from 12 comments", when: "11:00", done: false },
  { id: "t3", title: "Approve Reel caption", detail: "Publish · goes out 6:30 pm", when: "17:00", done: false },
  { id: "t4", title: "Chase Glossier invoice", detail: "$2,500 · follow-up drafted", when: "Today", done: false },
  { id: "t5", title: "Review Adidas contract", detail: "Deal Health 61 · 3 risks", when: "Fri", done: false },
];

export const inbox: InboxMessage[] = [
  {
    id: "m1",
    from: "Alex · Nike Partnerships",
    initial: "N",
    color: "#181818",
    category: "Brand deal",
    subject: "Re: Spring campaign brief – can you confirm the dates?",
    draft:
      "Hi Alex,\n\nThanks for the brief! The Reel and two Stories work for me, and I can deliver by Friday 30 October. Before I sign, can we confirm Net 30 payment terms and two revision rounds?\n\nBest,\nMaya",
    minutesSaved: 8,
  },
  {
    id: "m2",
    from: "Leo Films",
    initial: "L",
    color: "#3d7a35",
    category: "Collab",
    subject: "Want to shoot a gear swap video next week?",
    draft:
      "Hey Leo,\n\nLove this idea! Next Tuesday or Wednesday afternoon works for me. Want to film at my studio? I'll send a calendar invite once you pick a slot.\n\nMaya",
    minutesSaved: 5,
  },
  {
    id: "m3",
    from: "@sam.creates",
    initial: "S",
    color: "#c99a00",
    category: "Fan question",
    subject: "What mic do you use in your vlogs?",
    draft:
      "Hey Sam! I use a small wireless clip-on mic for vlogs and a shotgun mic in the studio. Full list is linked in my bio. Thanks for watching!",
    minutesSaved: 3,
  },
];

export const ideas: Idea[] = [
  { id: "i1", title: "“What camera do you use?” – 60s Short", why: "12 comments asked this week", platforms: ["Shorts", "Reels"] },
  { id: "i2", title: "Studio tour: before and after", why: "Your tours get 2.1x average views", platforms: ["YouTube"] },
  { id: "i3", title: "3 apps I use to edit on my phone", why: "Rising in your niche this week", platforms: ["TikTok"] },
];

export const deals: Deal[] = [
  { id: "d1", brand: "Nike", campaign: "Spring campaign", detail: "1 Reel, 2 Stories · due Fri 30 Oct", health: 78, value: "$4,000" },
  {
    id: "d2",
    brand: "Glossier",
    campaign: "Holiday edit",
    detail: "Invoice #0142",
    health: 92,
    value: "$2,500",
    overdue: {
      amount: "$2,500",
      days: 6,
      reminder:
        "Hi Jess,\n\nHope the holiday launch went well! A quick note that invoice #0142 ($2,500) was due on 22 October under our Net 30 terms. Could you check on its status? Happy to resend it if that helps.\n\nThanks,\nMaya",
    },
  },
];

export const posts: ScheduledPost[] = [
  { id: "p1", title: "Camera setup", platform: "Instagram Reel", status: "Caption and hashtags ready", when: "Today 6:30 pm" },
  { id: "p2", title: "Camera setup", platform: "YouTube Short", status: "Waiting for your approval", when: "Thu 12:00 pm" },
  { id: "p3", title: "Camera setup", platform: "TikTok", status: "Caption and hashtags ready", when: "Fri 7:00 pm" },
];

export const copilot: CopilotAnswer[] = [
  {
    question: "Who still owes me money?",
    keywords: ["owe", "money", "paid", "invoice", "payment"],
    answer:
      "Glossier owes you $2,500 for the Holiday edit (invoice #0142). It was due on 22 October, so it's 6 days late. A polite reminder is drafted; open Brand deals to send it.",
  },
  {
    question: "What's due this week?",
    keywords: ["due", "week", "deadline", "deliver"],
    answer:
      "Nike's Spring campaign is due Friday 30 October: 1 Reel and 2 Stories. Your camera setup Reel goes out today at 6:30 pm, and the Adidas contract review is on your list for Friday.",
  },
  {
    question: "Which deal is riskiest?",
    keywords: ["risk", "contract", "health", "adidas"],
    answer:
      "The Adidas contract (Deal Health 61). It has no payment terms, unlimited revisions and 90 days of usage rights with no extra fee. Ask for Net 30, two revision rounds and a usage fee before signing.",
  },
  {
    question: "What should I post next?",
    keywords: ["post", "idea", "make", "film", "content"],
    answer:
      "Film the 60-second “What camera do you use?” Short. 12 people asked in your comments this week, and your Shorts under 30 seconds get 2.3x your average views.",
  },
];
