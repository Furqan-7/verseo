import { prisma } from "db";
import type { CopilotAnswerDto } from "../types/api";
import { addDays, daysBetween, fromIsoDate, toIsoDate } from "../utils/dates";
import { WORKSPACE_TODAY } from "./sample.data";

// Copilot answers the four questions the drawer suggests by reading the
// creator's own deals, deadlines and ideas. It matches the question to an
// intent by keyword; anything else gets a pointer to what it can answer.

type Intent = "money" | "due" | "risk" | "next";

const INTENTS: { intent: Intent; keywords: string[] }[] = [
  { intent: "money", keywords: ["owe", "money", "paid", "invoice", "payment"] },
  { intent: "due", keywords: ["due", "week", "deadline", "deliver"] },
  { intent: "risk", keywords: ["risk", "contract", "health"] },
  { intent: "next", keywords: ["post", "idea", "make", "film", "content"] },
];

const money = (n: number) => `$${n.toLocaleString("en-US")}`;
const DAY = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const dayName = (d: Date) => DAY.format(d).replace(",", "");
const list = (items: string[]) => (items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`);

async function moneyOwed(userId: string) {
  const unpaid = await prisma.deal.findMany({
    where: { profileId: userId, stage: "invoiced", paidAt: null },
    orderBy: { invoiceDueDate: "asc" },
  });
  if (unpaid.length === 0) return "Nobody owes you money right now. Every invoiced deal is paid.";
  return unpaid
    .map((d) => {
      const late = d.invoiceDueDate ? daysBetween(toIsoDate(d.invoiceDueDate), WORKSPACE_TODAY) : 0;
      const when = !d.invoiceDueDate ? "" : late > 0 ? ` It was due on ${dayName(d.invoiceDueDate)}, so it's ${late} ${late === 1 ? "day" : "days"} late.` : ` It's due on ${dayName(d.invoiceDueDate)}.`;
      const reminder = d.reminderDraft ? " A polite reminder is drafted; open Brand deals to send it." : "";
      return `${d.brand} owes you ${money(d.amount)} for the ${d.campaign}${d.invoiceNumber ? ` (invoice ${d.invoiceNumber})` : ""}.${when}${reminder}`;
    })
    .join(" ");
}

async function dueThisWeek(userId: string) {
  const from = fromIsoDate(WORKSPACE_TODAY);
  const to = fromIsoDate(addDays(WORKSPACE_TODAY, 6));
  const [deliverables, events] = await Promise.all([
    prisma.deliverable.findMany({
      where: { done: false, dueDate: { gte: from, lte: to }, deal: { profileId: userId, stage: { not: "paid" } } },
      include: { deal: { select: { brand: true, campaign: true } } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.calendarEvent.findMany({ where: { profileId: userId, done: false, date: { gte: from, lte: to } }, orderBy: { date: "asc" } }),
  ]);
  if (deliverables.length === 0 && events.length === 0) return "Nothing is due in the next seven days.";
  const parts: string[] = [];
  if (deliverables.length) parts.push(`Deliverables: ${list(deliverables.map((d) => `${d.deal.brand} ${d.title} (${dayName(d.dueDate)})`))}.`);
  if (events.length) parts.push(`On your calendar: ${list(events.map((e) => `${e.title} (${dayName(e.date)})`))}.`);
  return parts.join(" ");
}

async function riskiestDeal(userId: string) {
  const deals = await prisma.deal.findMany({
    where: { profileId: userId, stage: { in: ["new_offer", "negotiating", "in_production"] } },
    include: { risks: { orderBy: { position: "asc" } } },
  });
  if (deals.length === 0) return "You have no open deals to check.";
  const score = (d: (typeof deals)[number]) => d.healthFinancial + d.healthDeadline + d.healthContract + d.healthScope;
  const worst = deals.reduce((a, b) => (score(b) < score(a) ? b : a));
  if (worst.risks.length === 0) return `Your open deals all look healthy. The lowest is ${worst.brand} at Deal Health ${score(worst)}, with no risks flagged.`;
  return `The ${worst.brand} ${worst.campaign} deal (Deal Health ${score(worst)}). ${worst.risks.length === 1 ? "Its risk" : "Its risks"}: ${list(worst.risks.map((r) => r.title.toLowerCase()))}. To fix: ${worst.risks.map((r) => r.fix).join(" ")}`;
}

async function postNext(userId: string) {
  const idea = await prisma.idea.findFirst({ where: { profileId: userId, todo: null }, orderBy: { createdAt: "asc" } });
  if (!idea) return "Every idea is already on your to-do list. New ones arrive as your audience asks for them.";
  return `Next up: ${idea.title}. ${idea.why}, so it's the strongest idea on your list. Add it to today from the Ideas card.`;
}

export async function askCopilot(userId: string, question: string): Promise<CopilotAnswerDto> {
  const q = question.toLowerCase();
  const intent = INTENTS.find((i) => i.keywords.some((k) => q.includes(k)))?.intent;
  const answer =
    intent === "money" ? await moneyOwed(userId)
    : intent === "due" ? await dueThisWeek(userId)
    : intent === "risk" ? await riskiestDeal(userId)
    : intent === "next" ? await postNext(userId)
    : "I can answer questions about money you're owed, what's due this week, your riskiest deal and what to post next. Try one of the suggestions below.";
  return { question, answer };
}
