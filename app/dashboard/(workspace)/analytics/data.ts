// Demo analytics for Maya's channels. Generated from fixed formulas (no
// randomness at load) so the server and the browser render the same numbers.

import { TODAY_ISO, addDays } from "../../data";

export const RANGES = [7, 30, 90] as const;
export type Range = (typeof RANGES)[number];

export type Channel = "youtube" | "instagram" | "tiktok";

// Categorical slots 1–3 of the validated palette, in fixed order. A channel
// keeps its colour when others are filtered out.
export const CHANNELS: { id: Channel; label: string; color: string }[] = [
  { id: "youtube", label: "YouTube", color: "#2a78d6" },
  { id: "instagram", label: "Instagram", color: "#eb6834" },
  { id: "tiktok", label: "TikTok", color: "#1baf7a" },
];

export interface DayStat {
  date: string;
  views: Record<Channel, number>;
  followers: Record<Channel, number>;
  watchMinutes: number;
}

// Small deterministic noise in [0, 1).
function noise(n: number) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const BASE: Record<Channel, number> = { youtube: 11000, instagram: 7000, tiktok: 8500 };
const GROWTH: Record<Channel, number> = { youtube: 0.0016, instagram: 0.0011, tiktok: 0.0022 };
// Days (counted back from today) when a post took off.
const SPIKES: Record<Channel, number[]> = {
  youtube: [3, 17, 40, 66, 101, 140],
  instagram: [9, 24, 52, 88, 130],
  tiktok: [6, 13, 31, 58, 95, 122, 160],
};

// 180 days, oldest first, ending today.
export const daily: DayStat[] = Array.from({ length: 180 }, (_, i) => {
  const back = 179 - i;
  const date = addDays(TODAY_ISO, -back);
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  const weekend = weekday === 0 || weekday === 6 ? 1.12 : 1;
  const views = {} as Record<Channel, number>;
  const followers = {} as Record<Channel, number>;
  CHANNELS.forEach(({ id }, c) => {
    const trend = BASE[id] * (1 + GROWTH[id] * i);
    const spike = SPIKES[id].reduce((sum, d) => sum + (back <= d && back > d - 4 ? 2.6 / (d - back + 1) : 0), 0);
    const v = trend * weekend * (0.82 + noise(i * 3 + c) * 0.36) * (1 + spike);
    views[id] = Math.round(v / 10) * 10;
    followers[id] = Math.round(v * (id === "tiktok" ? 0.0052 : id === "instagram" ? 0.0061 : 0.0041));
  });
  return { date, views, followers, watchMinutes: Math.round(views.youtube * 2.9) };
});

export const formats: { label: string; avgViews: number; videos: number }[] = [
  { label: "Shorts under 30s", avgViews: 84000, videos: 14 },
  { label: "Shorts 30–60s", avgViews: 52000, videos: 9 },
  { label: "Gear reviews", avgViews: 41000, videos: 6 },
  { label: "Studio tours", avgViews: 38000, videos: 2 },
  { label: "Editing tutorials", avgViews: 27000, videos: 5 },
  { label: "Vlogs", avgViews: 22000, videos: 8 },
];
export const AVERAGE_VIEWS = 36500;

export const HEAT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const HEAT_SLOTS = ["6–9 am", "9–12", "12–3 pm", "3–6 pm", "6–9 pm", "9–12 am"];
// Average engagement per post, as an index where 100 = your typical post.
export const heat: number[][] = [
  [38, 52, 71, 64, 96, 58],
  [41, 55, 74, 66, 101, 61],
  [44, 58, 79, 70, 142, 66],
  [40, 61, 131, 72, 108, 63],
  [36, 50, 77, 81, 126, 92],
  [52, 84, 98, 88, 104, 79],
  [57, 89, 93, 80, 97, 54],
];

export const revenue: { month: string; paid: number; owed: number }[] = [
  { month: "May", paid: 2400, owed: 0 },
  { month: "Jun", paid: 3100, owed: 0 },
  { month: "Jul", paid: 4600, owed: 0 },
  { month: "Aug", paid: 2800, owed: 0 },
  { month: "Sep", paid: 5200, owed: 0 },
  { month: "Oct", paid: 3300, owed: 2500 },
];

export const topContent: { id: string; title: string; channel: Channel; format: string; views: number; engagement: number; posted: string }[] = [
  { id: "t1", title: "What camera do you use?", channel: "youtube", format: "Short", views: 212000, engagement: 9.8, posted: "Sat 3 Oct" },
  { id: "t2", title: "Studio tour 2026: before and after", channel: "youtube", format: "Video", views: 96000, engagement: 7.1, posted: "Sun 20 Sep" },
  { id: "t3", title: "Night walk, filmed on a phone", channel: "instagram", format: "Reel", views: 88000, engagement: 8.4, posted: "Fri 16 Oct" },
  { id: "t4", title: "$40 light vs my old setup", channel: "tiktok", format: "TikTok", views: 74000, engagement: 11.2, posted: "Thu 22 Oct" },
  { id: "t5", title: "My editing setup in 60 seconds", channel: "tiktok", format: "TikTok", views: 61000, engagement: 10.4, posted: "Tue 15 Sep" },
  { id: "t6", title: "3 mics under $100", channel: "youtube", format: "Video", views: 41000, engagement: 6.3, posted: "Wed 30 Sep" },
];
