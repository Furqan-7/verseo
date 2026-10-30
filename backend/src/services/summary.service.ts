import { prisma } from "db";
import type { SummaryDto } from "../types/api";
import { startOfWeek } from "../utils/dates";

// Each clip cut, captioned and scheduled for the creator.
const MINUTES_PER_SCHEDULED_CLIP = 25;

export async function getSummary(userId: string): Promise<SummaryDto> {
  const since = startOfWeek(new Date());
  const [replies, clips] = await Promise.all([
    prisma.message.aggregate({ where: { profileId: userId, approvedAt: { gte: since } }, _sum: { minutesSaved: true } }),
    prisma.clip.count({ where: { video: { profileId: userId }, posts: { some: { createdAt: { gte: since } } } } }),
  ]);
  return { minutesSavedThisWeek: (replies._sum.minutesSaved ?? 0) + clips * MINUTES_PER_SCHEDULED_CLIP };
}
