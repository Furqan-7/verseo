// Turns the terms read from a contract into a deal on the board, with the
// same rule-based Deal Health as the demo deals.

import { HEALTH_MAX, TODAY_ISO, dayLabel, parseIso, type BoardDeal, type DealStage } from "../../data";

export interface ContractTerms {
  brand: string;
  campaign: string;
  fee: number;
  deliverables: string;
  due: string; // ISO date
  usageDays: number;
  usagePaid: boolean;
  payment: "Net 15" | "Net 30" | "Net 45" | "Net 60" | "Missing";
  revisions: "1 round" | "2 rounds" | "Unlimited";
  stage: DealStage;
}

// What the demo "reads" from any uploaded contract; every field is editable
// before the deal is added.
export const SAMPLE_TERMS: ContractTerms = {
  brand: "Sony",
  campaign: "Alpha creator series",
  fee: 2800,
  deliverables: "1 YouTube video, 2 Shorts",
  due: "2026-11-27",
  usageDays: 90,
  usagePaid: false,
  payment: "Net 60",
  revisions: "Unlimited",
  stage: "New offer",
};

// The clauses the sample was read from, shown next to each term.
export const SAMPLE_CLAUSES: Partial<Record<keyof ContractTerms, string>> = {
  fee: "§5.1",
  deliverables: "§3",
  due: "§3.4",
  usageDays: "§8",
  payment: "§6",
  revisions: "§4.2",
};

export function assess(t: ContractTerms) {
  const daysLeft = Math.round((parseIso(t.due).getTime() - parseIso(TODAY_ISO).getTime()) / 86_400_000);
  const items = t.deliverables.split(/,|\band\b/).map((s) => s.trim()).filter(Boolean);
  const paymentPts = { "Net 15": 15, "Net 30": 15, "Net 45": 10, "Net 60": 6, Missing: 0 }[t.payment];
  const freeUsage = t.usageDays > 30 && !t.usagePaid;

  const health = {
    financial: Math.min(HEALTH_MAX.financial, (t.fee >= 2000 ? 10 : t.fee >= 1000 ? 7 : 4) + paymentPts),
    deadline: daysLeft >= 21 ? 25 : daysLeft >= 10 ? 18 : daysLeft >= 0 ? 10 : 4,
    contract: Math.max(0, HEALTH_MAX.contract - (t.revisions === "Unlimited" ? 10 : 0) - (freeUsage ? 8 : 0) - (t.payment === "Missing" ? 6 : 0)),
    scope: items.length <= 3 ? 17 : 12,
  };

  const risks: { title: string; fix: string }[] = [];
  if (t.payment === "Missing") risks.push({ title: "No payment terms", fix: "Ask for Net 30 in writing." });
  else if (t.payment === "Net 60" || t.payment === "Net 45") risks.push({ title: `${t.payment} payment`, fix: "Ask for Net 30." });
  if (t.revisions === "Unlimited") risks.push({ title: "Unlimited revisions", fix: "Cap at 2 rounds." });
  if (freeUsage) risks.push({ title: "Free usage rights", fix: `Add a fee for ${t.usageDays} days of paid use.` });
  if (daysLeft < 10) risks.push({ title: "Tight deadline", fix: "Ask for at least two weeks." });

  return { health, risks, items, daysLeft, score: health.financial + health.deadline + health.contract + health.scope };
}

export function toDeal(t: ContractTerms, file: string): BoardDeal {
  const { health, risks, items } = assess(t);
  const slug = `${t.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "deal"}-${Date.now().toString(36)}`;
  const due = dayLabel(t.due, false);
  const value = `$${t.fee.toLocaleString("en-US")}`;
  return {
    slug,
    brand: t.brand,
    initial: (t.brand.trim()[0] ?? "?").toUpperCase(),
    color: "#5a52c7",
    campaign: t.campaign,
    stage: t.stage,
    note: `${t.campaign} · due ${due.slice(4)}`,
    alert: risks.length ? { text: `${risks.length} ${risks.length === 1 ? "risk" : "risks"} to fix`, tone: "warn" } : undefined,
    value,
    amount: t.fee,
    due: `due ${due}`,
    summary: `${value} · ${t.deliverables} · due ${due}`,
    source: `from ${file}`,
    health,
    terms: [
      { label: "Fee", value, clause: SAMPLE_CLAUSES.fee },
      { label: "Deliverables", value: t.deliverables, clause: SAMPLE_CLAUSES.deliverables },
      { label: "Usage rights", value: `${t.usageDays} days${t.usagePaid ? ", paid" : ""}`, clause: SAMPLE_CLAUSES.usageDays },
      { label: "Payment terms", value: t.payment, clause: SAMPLE_CLAUSES.payment, missing: t.payment === "Missing" },
    ],
    risks,
    deliverables: items.map((title, i) => ({ id: `${slug}-${i}`, title, date: due, done: false })),
  };
}
