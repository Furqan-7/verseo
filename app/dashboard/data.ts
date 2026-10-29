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
  slug: string;
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
  { id: "d1", slug: "nike", brand: "Nike", campaign: "Spring campaign", detail: "1 Reel, 2 Stories · due Fri 30 Oct", health: 78, value: "$4,000" },
  {
    id: "d2",
    slug: "glossier",
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

// ── Inbox screen ────────────────────────────────────────────────────────────
// Drafts mark key points with ==double equals==; the reading pane highlights
// them. Thread ids match the Today screen (m1–m3) and the Glossier deal (d2),
// so a draft approved on one screen shows as approved on the other.

export type Tone = "Friendly" | "Professional" | "Shorter";

export interface InboxThread {
  id: string;
  from: string;
  email: string;
  initial: string;
  color: string;
  category: Category;
  source: "Gmail" | "YouTube" | "Instagram";
  time: string;
  unread: boolean;
  subject: string;
  preview: string;
  body: string[];
  signOff: string;
  summary?: string;
  dealSlug?: string;
  drafts?: Record<Tone, string>;
  draftReady: boolean;
  minutesSaved: number;
}

export const inboxThreads: InboxThread[] = [
  {
    id: "m1",
    from: "Alex · Nike Partnerships",
    email: "alex@nike-partners.com",
    initial: "N",
    color: "#181818",
    category: "Brand deal",
    source: "Gmail",
    time: "9:02",
    unread: true,
    subject: "Re: Spring campaign brief",
    preview: "Thanks Maya! Can you confirm the delivery dates and the deliverables before we send the contract?",
    body: [
      "Hi Maya, thanks for the quick reply on the brief! Can you confirm you can deliver the Reel and two Stories by **Friday 30 October**? Once confirmed, we'll send the contract over for signature.",
    ],
    signOff: "Alex",
    summary: "Nike wants confirmation of 3 deliverables by Fri 30 Oct. Fee $4,000. Contract not signed yet; payment terms missing.",
    dealSlug: "nike",
    drafts: {
      Friendly:
        "Hi Alex,\n\nThanks for the brief! The Reel and two Stories work for me, and I can deliver by ==Friday 30 October==. Before I sign, can we confirm ==Net 30 payment terms== and ==two revision rounds==?\n\nBest,\nMaya",
      Professional:
        "Hi Alex,\n\nThank you for sending the brief. I can confirm delivery of one Reel and two Stories by ==Friday 30 October==. Before signing, I'd like the contract to include ==Net 30 payment terms== and a limit of ==two revision rounds==.\n\nKind regards,\nMaya Lopez",
      Shorter:
        "Hi Alex,\n\nConfirmed: Reel and two Stories by ==Friday 30 October==. Can the contract add ==Net 30 payment terms== and ==two revision rounds==?\n\nThanks,\nMaya",
    },
    draftReady: true,
    minutesSaved: 8,
  },
  {
    id: "d2",
    from: "Jess · Glossier",
    email: "jess@glossier-partners.com",
    initial: "G",
    color: "#d64535",
    category: "Brand deal",
    source: "Gmail",
    time: "Yesterday",
    unread: false,
    subject: "Invoice #0142",
    preview: "Following up on the holiday edit payment. Finance asked me to check one detail on the invoice...",
    body: [
      "Hi Maya, following up on the holiday edit payment. Finance asked me to check the invoice number on our side before they release it. Is it **#0142**?",
    ],
    signOff: "Jess",
    summary: "Glossier owes $2,500 for the Holiday edit. Invoice #0142 was due 22 Oct and is 6 days overdue.",
    dealSlug: "glossier",
    drafts: {
      Friendly:
        "Hi Jess,\n\nThanks for checking! Yes, it's ==invoice #0142== for ==$2,500==. It was due on ==22 October== under our Net 30 terms, so I'd be grateful if finance could release it this week. Happy to resend it if that helps.\n\nThanks,\nMaya",
      Professional:
        "Hi Jess,\n\nThank you for following up. I can confirm the reference is ==invoice #0142== for ==$2,500==, which fell due on ==22 October== under our Net 30 terms. Please let me know if finance needs anything else to process the payment.\n\nKind regards,\nMaya Lopez",
      Shorter:
        "Hi Jess,\n\nYes, ==invoice #0142==, ==$2,500==, due ==22 October==. Could finance release it this week?\n\nThanks,\nMaya",
    },
    draftReady: true,
    minutesSaved: 10,
  },
  {
    id: "m2",
    from: "Leo Films",
    email: "hello@leofilms.co",
    initial: "L",
    color: "#3d7a35",
    category: "Collab",
    source: "Gmail",
    time: "8:41",
    unread: true,
    subject: "Gear swap video next week?",
    preview: "Hey! Want to shoot a gear swap video next week? I'll bring my cinema kit, you bring your vlog setup...",
    body: [
      "Hey! Want to shoot a gear swap video next week? I'll bring my cinema kit, you bring your vlog setup, and we each film a day with the other's gear. I'm free **Tuesday or Wednesday afternoon**.",
    ],
    signOff: "Leo",
    summary: "A collab video with Leo Films (64k subscribers). He's free Tue or Wed afternoon; both are open in your calendar.",
    drafts: {
      Friendly:
        "Hey Leo,\n\nLove this idea! ==Tuesday or Wednesday afternoon== both work for me. Want to film at ==my studio==? I'll send a calendar invite once you pick a slot.\n\nMaya",
      Professional:
        "Hi Leo,\n\nThanks for reaching out, a gear swap sounds great. I'm available ==Tuesday or Wednesday afternoon== and can host at ==my studio==. Let me know which suits you and I'll send an invite.\n\nBest,\nMaya",
      Shorter:
        "Hey Leo, I'm in! ==Tue or Wed afternoon== at ==my studio==? Pick one and I'll send an invite.\n\nMaya",
    },
    draftReady: true,
    minutesSaved: 5,
  },
  {
    id: "m4",
    from: "Priya · Studio Sana",
    email: "priya@studiosana.fm",
    initial: "P",
    color: "#7b77e8",
    category: "Collab",
    source: "Gmail",
    time: "8:15",
    unread: true,
    subject: "Podcast guest spot",
    preview: "We'd love to have you on episode 42 to talk about building a one-person studio...",
    body: [
      "Hi Maya, we'd love to have you on **episode 42** of Studio Sana to talk about building a one-person studio. Recording is remote and takes about 45 minutes. Would any day in the **week of 9 November** work?",
    ],
    signOff: "Priya",
    summary: "A podcast invite for episode 42, recorded remotely in the week of 9 Nov. No fee mentioned. CreatorOS didn't draft a reply because it needs your decision.",
    drafts: {
      Friendly:
        "Hi Priya,\n\nThanks so much for thinking of me! I'd love to join ==episode 42==. ==Tuesday 10 November== or ==Thursday 12 November== work best for me. Could you share the topics ahead of time?\n\nMaya",
      Professional:
        "Hi Priya,\n\nThank you for the invitation. I'd be happy to join ==episode 42==. I'm available ==Tuesday 10 November== or ==Thursday 12 November==. Could you send an outline of the topics beforehand?\n\nBest regards,\nMaya Lopez",
      Shorter:
        "Hi Priya, I'd love to! ==Tue 10== or ==Thu 12 November==? Topics in advance would help.\n\nMaya",
    },
    draftReady: false,
    minutesSaved: 6,
  },
  {
    id: "m3",
    from: "@sam.creates",
    email: "YouTube comment · Camera setup vlog",
    initial: "S",
    color: "#c99a00",
    category: "Fan question",
    source: "YouTube",
    time: "7:58",
    unread: true,
    subject: "What mic do you use?",
    preview: "Your vlogs sound so clean, what mic is that? I've tried three and none sound like yours.",
    body: ["Your vlogs sound so clean, what mic is that? I've tried three and none sound like yours."],
    signOff: "Sam",
    summary: "A fan question. 12 people asked about your gear this week, so it's also on today's ideas list.",
    drafts: {
      Friendly:
        "Hey Sam! I use a ==small wireless clip-on mic== for vlogs and a ==shotgun mic== in the studio. Full list is ==linked in my bio==. Thanks for watching!",
      Professional:
        "Thanks Sam! I record vlogs with a ==wireless clip-on mic== and studio videos with a ==shotgun mic==. The full kit list is ==linked in my bio==.",
      Shorter: "Thanks Sam! ==Wireless clip-on== for vlogs, ==shotgun mic== in the studio. Full list ==in my bio==.",
    },
    draftReady: true,
    minutesSaved: 3,
  },
  {
    id: "m5",
    from: "@ana.films",
    email: "Instagram DM",
    initial: "A",
    color: "#c99a00",
    category: "Fan question",
    source: "Instagram",
    time: "7:30",
    unread: false,
    subject: "Camera settings for low light?",
    preview: "Loved the night walk video! What ISO and shutter speed did you use for the street shots?",
    body: ["Loved the night walk video! What ISO and shutter speed did you use for the street shots?"],
    signOff: "Ana",
    summary: "A fan question about your night walk video settings.",
    drafts: {
      Friendly:
        "Thank you Ana! For the street shots I was at ==ISO 3200==, ==1/50 shutter== and ==f/1.8==. A cheap ND filter helps once the shop lights get bright!",
      Professional:
        "Thanks Ana! The street shots were filmed at ==ISO 3200==, ==1/50 shutter== and ==f/1.8==.",
      Shorter: "Thanks Ana! ==ISO 3200==, ==1/50==, ==f/1.8==.",
    },
    draftReady: false,
    minutesSaved: 2,
  },
  {
    id: "m6",
    from: "Growth Boost Team",
    email: "promo@growthboost.biz",
    initial: "G",
    color: "#9a9a9a",
    category: "Spam",
    source: "Gmail",
    time: "6:12",
    unread: false,
    subject: "Get 10k followers in 7 days 🚀",
    preview: "Exclusive creator offer: real followers, guaranteed results...",
    body: ["Exclusive creator offer: real followers, guaranteed results. Reply YES to claim your spot."],
    signOff: "The Growth Boost Team",
    summary: "Marked as spam: a paid-followers offer from an unknown sender. No reply needed.",
    draftReady: false,
    minutesSaved: 0,
  },
];

// ── Publish screen ──────────────────────────────────────────────────────────

export type PublishPlatform = "reel" | "short" | "tiktok";

export const publishPlatforms: { id: PublishPlatform; label: string; swatch: string; limit: number }[] = [
  { id: "reel", label: "Instagram Reel", swatch: "linear-gradient(90deg,#f9a825,#e91e63,#7b1fa2)", limit: 2200 },
  { id: "short", label: "YouTube Short", swatch: "#ff0033", limit: 5000 },
  { id: "tiktok", label: "TikTok", swatch: "#181818", limit: 2200 },
];

export interface Clip {
  id: string;
  title: string;
  quote: string;
  start: string;
  end: string;
  startSec: number;
  endSec: number;
  why: string;
  hook: number;
  color: string;
  captions: Record<PublishPlatform, string[]>;
  hashtags: string[];
}

export const video = {
  file: "vlog_tuesday.mp4",
  length: "14:32",
  lengthSec: 872,
  quality: "1080p",
  minutesSavedPerClip: 25,
};

export const clips: Clip[] = [
  {
    id: "c1",
    title: "“Here's the setup I use for every video”",
    quote: "The camera setup I use for every video",
    start: "0:52",
    end: "1:19",
    startSec: 52,
    endSec: 79,
    why: "strong hook, answers 12 comments",
    hook: 92,
    color: "#7b77e8",
    captions: {
      reel: [
        "The camera setup I use for every video, in 30 seconds. 🎥 Lens, mic and lights are linked in my bio. Save this for your next shoot and tell me what you want to see next!",
        "You asked, so here it is: my whole camera setup in 30 seconds. 🎥 Everything is linked in my bio. Which piece should I review next?",
      ],
      short: [
        "My entire camera setup in 30 seconds 🎥 #shorts",
        "The setup behind every video I make, in 30 seconds 🎥 #shorts",
      ],
      tiktok: [
        "the camera setup I use for every single video 🎥 links in bio",
        "pov: you finally see the whole setup 🎥 everything's in my bio",
      ],
    },
    hashtags: ["#creatorsetup", "#filmmaking", "#youtubetips", "#camerasetup", "#contentcreator"],
  },
  {
    id: "c2",
    title: "The $40 light that changed everything",
    quote: "This $40 light changed everything",
    start: "5:31",
    end: "6:12",
    startSec: 331,
    endSec: 372,
    why: "surprising, shareable",
    hook: 87,
    color: "#56c25a",
    captions: {
      reel: [
        "This $40 light did more for my videos than my last camera upgrade. 💡 Before and after in the video. Link in bio.",
        "Stop buying lenses, buy this $40 light. 💡 Before and after inside. Link in bio.",
      ],
      short: ["The $40 light that changed my videos 💡 #shorts", "$40 light vs. my old setup 💡 #shorts"],
      tiktok: ["this $40 light changed everything 💡", "the cheapest upgrade I've ever made 💡"],
    },
    hashtags: ["#lightingtips", "#budgetgear", "#videotips", "#filmmaking", "#creatorsetup"],
  },
  {
    id: "c3",
    title: "Mic test: before and after",
    quote: "Mic test: before and after",
    start: "10:18",
    end: "10:44",
    startSec: 618,
    endSec: 644,
    why: "quick payoff",
    hook: 81,
    color: "#e2a400",
    captions: {
      reel: [
        "Same room, same voice, different mic. 🎙️ Turn your sound on for the before and after.",
        "Sound on: the mic test you asked for. 🎙️ Which one would you pick?",
      ],
      short: ["Mic test: before and after 🎙️ #shorts", "Can you hear the difference? 🎙️ #shorts"],
      tiktok: ["sound on 🎙️ before vs after", "the mic test you asked for 🎙️"],
    },
    hashtags: ["#mictest", "#audiotips", "#youtubetips", "#vlogging", "#contentcreator"],
  },
];

export const bestTimes: { platform: PublishPlatform; label: string; when: string; why: string }[] = [
  { platform: "reel", label: "Reel", when: "Today 6:30 pm", why: "Your followers peak 6–8 pm" },
  { platform: "short", label: "Short", when: "Thu 12:00 pm", why: "Lunch views are 1.8x" },
  { platform: "tiktok", label: "TikTok", when: "Fri 7:00 pm", why: "Weekend reach starts Friday" },
];

// ── Deals screen ────────────────────────────────────────────────────────────

export type DealStage = "New offer" | "Negotiating" | "In production" | "Invoiced";

export const dealStages: { stage: DealStage; color: string }[] = [
  { stage: "New offer", color: "#aeabff" },
  { stage: "Negotiating", color: "#f4c430" },
  { stage: "In production", color: "#56c25a" },
  { stage: "Invoiced", color: "#7b77e8" },
];

export interface BoardDeal {
  slug: string;
  brand: string;
  initial: string;
  color: string;
  campaign: string;
  stage: DealStage;
  note: string;
  alert?: { text: string; tone: "warn" | "bad" };
  value: string;
  amount: number;
  due: string;
  summary: string;
  source: string;
  health: { financial: number; deadline: number; contract: number; scope: number };
  terms: { label: string; value: string; clause?: string; missing?: boolean }[];
  risks: { title: string; fix: string }[];
  deliverables: { id: string; title: string; date: string; done: boolean }[];
  // The inbox thread (or reminder) the main action drafts a reply for.
  replyId?: string;
}

export const HEALTH_MAX = { financial: 25, deadline: 25, contract: 30, scope: 20 } as const;

export const boardDeals: BoardDeal[] = [
  {
    slug: "adidas",
    brand: "Adidas",
    initial: "A",
    color: "#181818",
    campaign: "Run club series",
    stage: "New offer",
    note: "Run club series · via Inbox",
    value: "$3,200",
    amount: 3200,
    due: "due Fri 20 Nov",
    summary: "$3,200 · 3 Reels · due Fri 20 Nov",
    source: "from contract.pdf",
    health: { financial: 15, deadline: 20, contract: 12, scope: 14 },
    terms: [
      { label: "Fee", value: "$3,200" },
      { label: "Deliverables", value: "3 Reels", clause: "§3.2" },
      { label: "Usage rights", value: "90 days", clause: "§8.1" },
      { label: "Payment terms", value: "Missing", clause: "§5", missing: true },
    ],
    risks: [
      { title: "No payment terms", fix: "Ask for Net 30 in writing." },
      { title: "Unlimited revisions", fix: "Cap at 2 rounds (§4.4)." },
      { title: "90 days of free usage", fix: "Add a fee for paid usage." },
    ],
    deliverables: [
      { id: "a1", title: "Reel #1: club run", date: "Fri 6 Nov", done: false },
      { id: "a2", title: "Reel #2: gear check", date: "Fri 13 Nov", done: false },
      { id: "a3", title: "Reel #3: race day", date: "Fri 20 Nov", done: false },
    ],
  },
  {
    slug: "spotify",
    brand: "Spotify",
    initial: "S",
    color: "#1db954",
    campaign: "Wrapped teaser",
    stage: "New offer",
    note: "Wrapped teaser · via Inbox",
    value: "$1,800",
    amount: 1800,
    due: "due Tue 1 Dec",
    summary: "$1,800 · 1 Short · due Tue 1 Dec",
    source: "from email",
    health: { financial: 22, deadline: 22, contract: 24, scope: 16 },
    terms: [
      { label: "Fee", value: "$1,800" },
      { label: "Deliverables", value: "1 Short", clause: "brief" },
      { label: "Usage rights", value: "30 days", clause: "brief" },
      { label: "Payment terms", value: "Net 30", clause: "brief" },
    ],
    risks: [{ title: "No contract yet", fix: "Ask for the contract before you film." }],
    deliverables: [{ id: "s1", title: "Short: Wrapped teaser", date: "Tue 1 Dec", done: false }],
  },
  {
    slug: "nike",
    brand: "Nike",
    initial: "N",
    color: "#181818",
    campaign: "Spring campaign",
    stage: "Negotiating",
    note: "Spring campaign · due Fri 30 Oct",
    alert: { text: "Waiting on payment terms", tone: "warn" },
    value: "$4,000",
    amount: 4000,
    due: "due Fri 30 Oct",
    summary: "$4,000 · 1 Reel, 2 Stories · due Fri 30 Oct",
    source: "from contract.pdf",
    health: { financial: 17, deadline: 25, contract: 19, scope: 17 },
    terms: [
      { label: "Fee", value: "$4,000" },
      { label: "Deliverables", value: "1 Reel, 2 Stories", clause: "§4.1" },
      { label: "Usage rights", value: "60 days", clause: "§7.1" },
      { label: "Payment terms", value: "Missing", clause: "§6", missing: true },
    ],
    risks: [
      { title: "No payment terms", fix: "Ask for Net 30 in writing." },
      { title: "Unlimited revisions", fix: "Cap at 2 rounds (§5.2)." },
      { title: "Free usage rights", fix: "Add a fee for 60 days of paid use." },
    ],
    deliverables: [
      { id: "n1", title: "Reel: concept and script", date: "Mon 26 Oct", done: true },
      { id: "n2", title: "Story #1: launch day", date: "Thu 29 Oct", done: false },
      { id: "n3", title: "Story #2: recap", date: "Fri 30 Oct", done: false },
    ],
    replyId: "m1",
  },
  {
    slug: "canon",
    brand: "Canon",
    initial: "C",
    color: "#e60012",
    campaign: "Low-light review",
    stage: "In production",
    note: "Low-light review · due 6 Nov",
    value: "$2,400",
    amount: 2400,
    due: "due Fri 6 Nov",
    summary: "$2,400 · 1 YouTube video · due Fri 6 Nov",
    source: "from contract.pdf",
    health: { financial: 23, deadline: 24, contract: 27, scope: 17 },
    terms: [
      { label: "Fee", value: "$2,400" },
      { label: "Deliverables", value: "1 YouTube video", clause: "§2.1" },
      { label: "Usage rights", value: "30 days", clause: "§6.3" },
      { label: "Payment terms", value: "Net 30", clause: "§5" },
    ],
    risks: [],
    deliverables: [
      { id: "c1", title: "Script approved", date: "Mon 26 Oct", done: true },
      { id: "c2", title: "Night shoot", date: "Mon 2 Nov", done: false },
      { id: "c3", title: "Video goes live", date: "Fri 6 Nov", done: false },
    ],
  },
  {
    slug: "audible",
    brand: "Audible",
    initial: "A",
    color: "#f7991c",
    campaign: "Book of the month",
    stage: "In production",
    note: "Book of the month · due 12 Nov",
    value: "$900",
    amount: 900,
    due: "due Thu 12 Nov",
    summary: "$900 · 60s ad read · due Thu 12 Nov",
    source: "from contract.pdf",
    health: { financial: 20, deadline: 23, contract: 28, scope: 17 },
    terms: [
      { label: "Fee", value: "$900" },
      { label: "Deliverables", value: "60s ad read", clause: "§2" },
      { label: "Usage rights", value: "In video only", clause: "§4" },
      { label: "Payment terms", value: "Net 45", clause: "§3" },
    ],
    risks: [{ title: "Net 45 payment", fix: "Ask for Net 30 next time." }],
    deliverables: [
      { id: "u1", title: "Ad read recorded", date: "Mon 9 Nov", done: false },
      { id: "u2", title: "Video with ad goes live", date: "Thu 12 Nov", done: false },
    ],
  },
  {
    slug: "glossier",
    brand: "Glossier",
    initial: "G",
    color: "#d64535",
    campaign: "Holiday edit",
    stage: "Invoiced",
    note: "Holiday edit · invoice #0142",
    alert: { text: "6 days overdue · reminder drafted", tone: "bad" },
    value: "$2,500",
    amount: 2500,
    due: "paid by 22 Oct",
    summary: "$2,500 · invoice #0142 · due 22 Oct",
    source: "from invoice #0142",
    health: { financial: 24, deadline: 25, contract: 27, scope: 16 },
    terms: [
      { label: "Fee", value: "$2,500" },
      { label: "Deliverables", value: "1 Reel, 1 TikTok", clause: "§3" },
      { label: "Usage rights", value: "30 days", clause: "§6" },
      { label: "Payment terms", value: "Net 30 · 6 days late", clause: "§5", missing: true },
    ],
    risks: [{ title: "Payment overdue", fix: "Send the drafted reminder today." }],
    deliverables: [
      { id: "g1", title: "Reel: holiday edit", date: "Mon 14 Sep", done: true },
      { id: "g2", title: "TikTok: gift guide", date: "Tue 22 Sep", done: true },
    ],
    replyId: "d2",
  },
];

// ── Onboarding ──────────────────────────────────────────────────────────────

export const onboardingAccounts: {
  id: string;
  name: string;
  detail: string;
  mark: string;
  color: string;
  action: "connected" | "connect" | "csv" | "soon";
}[] = [
  { id: "gmail", name: "Gmail", detail: "Sort brand emails and draft replies", mark: "M", color: "#ea4335", action: "connected" },
  { id: "calendar", name: "Google Calendar", detail: "Add deadlines and posting times", mark: "31", color: "#4285f4", action: "connected" },
  { id: "youtube", name: "YouTube", detail: "Comments, views and your best formats", mark: "▶", color: "#ff0033", action: "connect" },
  { id: "instagram", name: "Instagram", detail: "Import your metrics as a CSV for now", mark: "IG", color: "linear-gradient(45deg,#f9a825,#e91e63,#7b1fa2)", action: "csv" },
  { id: "tiktok", name: "TikTok", detail: "Coming soon", mark: "♪", color: "#181818", action: "soon" },
];

export const niches = ["Tech & gear", "Lifestyle", "Beauty", "Fitness", "Education"];
export const goals = ["Land more brand deals", "Post more often", "Save time"];
