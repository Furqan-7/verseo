import { prisma } from "db";
import type { ListPostsQuery, ScheduleClipInput, UpdateCaptionInput, UpdateClipInput } from "../schemas/publish";
import type { ClipDto, PostDto, PublishPlatform, VideoDto } from "../types/api";
import { badRequest, notFound } from "../utils/AppError";
import { fromIsoDate } from "../utils/dates";
import { clipInclude, toClipDto, toPostDto, toVideoDto, videoInclude } from "./mappers";

// Shortest clip worth posting, in seconds.
const MIN_CLIP_SEC = 5;

export async function listVideos(userId: string, page: number, limit: number) {
  const where = { profileId: userId };
  const [rows, total] = await prisma.$transaction([
    prisma.video.findMany({ where, include: videoInclude, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.video.count({ where }),
  ]);
  return { videos: rows.map(toVideoDto), total };
}

async function ownedClip(userId: string, id: string) {
  const clip = await prisma.clip.findFirst({ where: { id, video: { profileId: userId } }, include: { ...clipInclude, video: { select: { lengthSec: true } } } });
  if (!clip) throw notFound("Clip");
  return clip;
}

export async function updateClip(userId: string, id: string, input: UpdateClipInput): Promise<ClipDto> {
  const clip = await ownedClip(userId, id);
  const startSec = input.startSec ?? clip.startSec;
  const endSec = input.endSec ?? clip.endSec;
  if (endSec - startSec < MIN_CLIP_SEC) throw badRequest(`A clip must be at least ${MIN_CLIP_SEC} seconds long`, "CLIP_TOO_SHORT");
  if (endSec > clip.video.lengthSec) throw badRequest("A clip can't run past the end of the video", "CLIP_OUT_OF_RANGE");

  const updated = await prisma.clip.update({
    where: { id: clip.id },
    data: { startSec, endSec, skipped: input.skipped, hashtags: input.hashtags ? [...new Set(input.hashtags)] : undefined },
    include: clipInclude,
  });
  return toClipDto(updated);
}

export async function updateCaption(userId: string, id: string, platform: PublishPlatform, input: UpdateCaptionInput): Promise<ClipDto> {
  const clip = await ownedClip(userId, id);
  const caption = clip.captions.find((c) => c.platform === platform);
  if (!caption) throw notFound("Caption");
  await prisma.clipCaption.update({ where: { id: caption.id }, data: { variant: input.variant, text: input.text } });
  return toClipDto(await prisma.clip.findUniqueOrThrow({ where: { id: clip.id }, include: clipInclude }));
}

// Books the clip's posts. The caption saved with each post is the one
// showing at the time (the creator's edit, else the picked option) plus
// the clip's hashtags. Scheduling again moves the posts to the new times.
export async function scheduleClip(userId: string, id: string, input: ScheduleClipInput): Promise<ClipDto> {
  const clip = await ownedClip(userId, id);
  if (clip.skipped) throw badRequest("This clip is skipped. Keep it before scheduling.", "CLIP_SKIPPED");

  await prisma.$transaction(
    input.posts.map((post) => {
      const cap = clip.captions.find((c) => c.platform === post.platform);
      const chosen = cap ? (cap.text ?? cap.options[cap.variant % Math.max(1, cap.options.length)] ?? "") : "";
      const caption = [chosen, clip.hashtags.join(" ")].filter(Boolean).join("\n\n");
      const scheduledAt = new Date(fromIsoDate(post.date).getTime() + post.minutes * 60_000);
      return prisma.scheduledPost.upsert({
        where: { clipId_platform: { clipId: clip.id, platform: post.platform } },
        create: { clipId: clip.id, platform: post.platform, scheduledAt, why: post.why, caption },
        update: { scheduledAt, why: post.why, caption },
      });
    }),
  );
  return toClipDto(await prisma.clip.findUniqueOrThrow({ where: { id: clip.id }, include: clipInclude }));
}

export async function listPosts(userId: string, query: ListPostsQuery): Promise<PostDto[]> {
  const rows = await prisma.scheduledPost.findMany({
    where: {
      clip: { video: { profileId: userId } },
      scheduledAt: {
        gte: query.from ? fromIsoDate(query.from) : undefined,
        lt: query.to ? new Date(fromIsoDate(query.to).getTime() + 86_400_000) : undefined,
      },
    },
    orderBy: { scheduledAt: "asc" },
  });
  return rows.map(toPostDto);
}
