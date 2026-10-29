import { goals, niches, type Category, type Tone } from "../data";

// The creator's preferences. Until there is a backend they are kept in this
// browser (localStorage), so onboarding and Settings share them and they
// survive a reload. Reads and writes never throw: private windows and
// blocked storage fall back to the defaults.

export type AccountId = "gmail" | "calendar" | "youtube" | "instagram" | "tiktok";
export type AccountState = "connected" | "disconnected" | "imported" | "soon";
export type BriefingSection = "todo" | "inbox" | "ideas" | "deals";
export type NotificationId = "overdue" | "newDeal" | "deadline" | "weekly";

export interface Settings {
  name: string;
  channel: string;
  niche: string;
  goals: string[];
  accounts: Record<AccountId, AccountState>;
  briefingTime: string;
  briefingEmail: boolean;
  briefingSections: Record<BriefingSection, boolean>;
  tone: Tone;
  signOff: string;
  autoDraft: Record<Exclude<Category, "Spam">, boolean>;
  notifications: Record<NotificationId, boolean>;
}

export const DEFAULT_SETTINGS: Settings = {
  name: "Maya Lopez",
  channel: "@mayalopez · YouTube",
  niche: niches[0],
  goals: [goals[0]],
  accounts: { gmail: "connected", calendar: "connected", youtube: "connected", instagram: "imported", tiktok: "soon" },
  briefingTime: "8:00",
  briefingEmail: true,
  briefingSections: { todo: true, inbox: true, ideas: true, deals: true },
  tone: "Friendly",
  signOff: "Best,\nMaya",
  autoDraft: { "Brand deal": true, Collab: true, "Fan question": true },
  notifications: { overdue: true, newDeal: true, deadline: true, weekly: false },
};

const KEY = "creatoros_settings";

export function loadSettings(): Settings {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const saved = JSON.parse(raw) as Partial<Settings>;
    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      accounts: { ...DEFAULT_SETTINGS.accounts, ...saved.accounts },
      briefingSections: { ...DEFAULT_SETTINGS.briefingSections, ...saved.briefingSections },
      autoDraft: { ...DEFAULT_SETTINGS.autoDraft, ...saved.autoDraft },
      notifications: { ...DEFAULT_SETTINGS.notifications, ...saved.notifications },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Storage is unavailable; the change still applies for this visit.
  }
}

export function clearSettings() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}

export const ACCOUNT_META: Record<AccountId, { name: string; mark: string; color: string; detail: string }> = {
  gmail: { name: "Gmail", mark: "M", color: "#ea4335", detail: "Sorts brand emails and drafts replies" },
  calendar: { name: "Google Calendar", mark: "31", color: "#4285f4", detail: "Deadlines, posting times and filming blocks" },
  youtube: { name: "YouTube", mark: "▶", color: "#ff0033", detail: "Comments, views and your best formats" },
  instagram: { name: "Instagram", mark: "IG", color: "linear-gradient(45deg,#f9a825,#e91e63,#7b1fa2)", detail: "Metrics from a CSV import" },
  tiktok: { name: "TikTok", mark: "♪", color: "#181818", detail: "Coming soon" },
};

// Swap a drafted email's closing paragraph for the creator's sign-off.
// Short replies (comments, DMs) have no sign-off and are left alone.
export function withSignOff(draft: string, signOff: string) {
  const parts = draft.split("\n\n");
  if (parts.length < 3 || !signOff.trim()) return draft;
  return [...parts.slice(0, -1), signOff.trim()].join("\n\n");
}
