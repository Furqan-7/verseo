import { prisma, type Prisma } from "db";
import type { Tone } from "../types/api";
import { addDays, fromIsoDate } from "../utils/dates";
import { conflict } from "../utils/AppError";
import {
  sampleAlerts,
  sampleChannelDays,
  sampleDeals,
  sampleEvents,
  sampleIdeas,
  sampleMessages,
  sampleTodos,
  sampleTopContent,
  sampleVideo,
} from "./sample.data";

type Tx = Prisma.TransactionClient;

const TONES: Tone[] = ["friendly", "professional", "shorter"];

// What a brand-new profile's settings are; reset puts them back.
export const DEFAULT_SETTINGS = {
  name: "",
  channel: "",
  niche: "",
  goals: [],
  briefingTime: "8:00",
  briefingEmail: true,
  briefingSections: ["todo", "inbox", "ideas", "deals"],
  tone: "friendly",
  signOff: "",
  autoDraft: ["brand_deal", "collab", "fan_question"],
  notifications: ["overdue", "new_deal", "deadline"],
} satisfies Prisma.ProfileUpdateInput;

export async function hasWorkspace(userId: string, db: Tx | typeof prisma = prisma): Promise<boolean> {
  const [messages, deals, videos] = await Promise.all([
    db.message.count({ where: { profileId: userId } }),
    db.deal.count({ where: { profileId: userId } }),
    db.video.count({ where: { profileId: userId } }),
  ]);
  return messages + deals + videos > 0;
}

// Writes the sample creator's workspace into this user's rows. Refuses if
// the workspace already has data, so it can never duplicate or overwrite.
export async function seedSampleWorkspace(userId: string, tx: Tx) {
  if (await hasWorkspace(userId, tx)) {
    throw conflict("Your workspace already has data", "WORKSPACE_NOT_EMPTY");
  }

  const dealIds = new Map<string, string>();
  for (const d of sampleDeals) {
    const deal = await tx.deal.create({
      data: {
        profileId: userId,
        slug: d.slug,
        brand: d.brand,
        color: d.color,
        campaign: d.campaign,
        stage: d.stage,
        amount: d.amount,
        dueDate: fromIsoDate(d.dueDate),
        source: d.source,
        alertText: d.alert?.text,
        alertTone: d.alert?.tone,
        healthFinancial: d.health.financial,
        healthDeadline: d.health.deadline,
        healthContract: d.health.contract,
        healthScope: d.health.scope,
        invoiceNumber: d.invoice?.number,
        invoiceDueDate: d.invoice ? fromIsoDate(d.invoice.dueDate) : undefined,
        paidAt: d.paidAt ? fromIsoDate(d.paidAt) : undefined,
        reminderDraft: d.reminderDraft,
        terms: { create: d.terms.map((t, position) => ({ position, label: t.label, value: t.value, clause: t.clause, missing: t.missing ?? false })) },
        risks: { create: d.risks.map((r, position) => ({ position, title: r.title, fix: r.fix })) },
        deliverables: { create: d.deliverables.map((item, position) => ({ position, title: item.title, dueDate: fromIsoDate(item.dueDate), done: item.done })) },
      },
      select: { id: true },
    });
    dealIds.set(d.slug, deal.id);
  }

  const messageIds = new Map<string, string>();
  for (const m of sampleMessages) {
    const message = await tx.message.create({
      data: {
        profileId: userId,
        dealId: m.dealSlug ? dealIds.get(m.dealSlug) : undefined,
        source: m.source,
        category: m.category,
        fromName: m.fromName,
        fromAddress: m.fromAddress,
        avatarInitial: m.avatarInitial,
        avatarColor: m.avatarColor,
        subject: m.subject,
        preview: m.preview,
        body: m.body,
        senderSignOff: m.senderSignOff,
        summary: m.summary,
        receivedAt: new Date(m.receivedAt),
        readAt: m.read ? new Date(m.receivedAt) : undefined,
        draftReady: m.draftReady,
        minutesSaved: m.minutesSaved,
        drafts: m.drafts ? { create: TONES.map((tone) => ({ tone, text: m.drafts![tone] })) } : undefined,
      },
      select: { id: true },
    });
    messageIds.set(m.key, message.id);
  }

  const ideaRows = await tx.idea.createManyAndReturn({
    data: sampleIdeas.map((idea) => ({ profileId: userId, ...idea })),
    select: { id: true },
  });

  await tx.todo.createMany({
    data: sampleTodos.map((t) => ({ profileId: userId, title: t.title, detail: t.detail, dueDate: fromIsoDate(t.dueDate), dueMinutes: t.dueMinutes, done: t.done })),
  });

  await tx.calendarEvent.createMany({
    data: sampleEvents.map((e) => {
      const link =
        !e.link ? null
        : "deal" in e.link ? { href: `/dashboard/deals?deal=${e.link.deal}`, label: "Open deal" }
        : "message" in e.link ? { href: `/dashboard/inbox?m=${messageIds.get(e.link.message)}`, label: "Open message" }
        : { href: "/dashboard/publish", label: "Open in Publish" };
      return {
        profileId: userId,
        title: e.title,
        type: e.type,
        date: fromIsoDate(e.date),
        startMinutes: e.start,
        endMinutes: e.end,
        detail: e.detail,
        linkHref: link?.href,
        linkLabel: link?.label,
        tentative: e.tentative ?? false,
        done: e.done ?? false,
      };
    }),
  });

  await tx.alert.createMany({
    data: sampleAlerts.map((a) => ({
      profileId: userId,
      dealId: a.dealSlug ? dealIds.get(a.dealSlug) : undefined,
      kind: a.kind,
      title: a.title,
      detail: a.detail,
      href: a.href,
      createdAt: new Date(a.createdAt),
      readAt: a.read ? new Date(a.createdAt) : undefined,
    })),
  });

  await tx.video.create({
    data: {
      profileId: userId,
      fileName: sampleVideo.fileName,
      lengthSec: sampleVideo.lengthSec,
      quality: sampleVideo.quality,
      transcript: { create: sampleVideo.transcript },
      clips: {
        create: sampleVideo.clips.map((c, position) => ({
          position,
          short: c.short,
          title: c.title,
          quote: c.quote,
          startSec: c.startSec,
          endSec: c.endSec,
          suggestedStartSec: c.startSec,
          suggestedEndSec: c.endSec,
          why: c.why,
          hook: c.hook,
          color: c.color,
          hashtags: c.hashtags,
          captions: { create: (["reel", "short", "tiktok"] as const).map((platform) => ({ platform, options: c.captions[platform] })) },
        })),
      },
    },
  });

  await tx.channelDay.createMany({
    data: sampleChannelDays(addDays).map((d) => ({ profileId: userId, channel: d.channel, date: fromIsoDate(d.date), views: d.views, followers: d.followers, watchMinutes: d.watchMinutes })),
  });

  await tx.contentPost.createMany({
    data: sampleTopContent.map((p) => ({ profileId: userId, ...p, postedAt: fromIsoDate(p.postedAt) })),
  });

  return { ideas: ideaRows.length };
}

// Deletes everything in the workspace and sends the account back through
// onboarding with default settings. The profile row (the Supabase user's
// id and email) stays.
export async function resetWorkspace(userId: string) {
  await prisma.$transaction([
    prisma.message.deleteMany({ where: { profileId: userId } }),
    prisma.alert.deleteMany({ where: { profileId: userId } }),
    prisma.todo.deleteMany({ where: { profileId: userId } }),
    prisma.idea.deleteMany({ where: { profileId: userId } }),
    prisma.deal.deleteMany({ where: { profileId: userId } }),
    prisma.calendarEvent.deleteMany({ where: { profileId: userId } }),
    prisma.video.deleteMany({ where: { profileId: userId } }),
    prisma.channelDay.deleteMany({ where: { profileId: userId } }),
    prisma.contentPost.deleteMany({ where: { profileId: userId } }),
    prisma.connectedAccount.deleteMany({ where: { profileId: userId } }),
    prisma.profile.updateMany({ where: { id: userId }, data: { ...DEFAULT_SETTINGS, onboardedAt: null } }),
  ]);
}
