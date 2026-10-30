import { prisma, type Prisma } from "db";
import type { ApproveMessagesInput, ListMessagesQuery, UpdateMessageInput } from "../schemas/messages";
import type { MessageDto } from "../types/api";
import { badRequest, notFound } from "../utils/AppError";
import { messageInclude, toMessageDto } from "./mappers";

export async function listMessages(userId: string, query: ListMessagesQuery) {
  const where: Prisma.MessageWhereInput = {
    profileId: userId,
    archivedAt: query.archived ? { not: null } : null,
    category: query.category,
    ...(query.q
      ? {
          OR: [
            { fromName: { contains: query.q, mode: "insensitive" } },
            { subject: { contains: query.q, mode: "insensitive" } },
            { preview: { contains: query.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [rows, total] = await prisma.$transaction([
    prisma.message.findMany({
      where,
      include: messageInclude,
      orderBy: { receivedAt: "desc" },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.message.count({ where }),
  ]);
  return { messages: rows.map(toMessageDto), total };
}

export async function updateMessage(userId: string, id: string, input: UpdateMessageInput): Promise<MessageDto> {
  const now = new Date();
  const data: Prisma.MessageUpdateInput = {};
  if (input.read !== undefined) data.readAt = input.read ? now : null;
  if (input.archived !== undefined) data.archivedAt = input.archived ? now : null;
  if (input.tone !== undefined) data.tone = input.tone;
  if (input.draftRequested) data.draftRequested = true;
  if (input.editedReply !== undefined) data.editedReply = input.editedReply;

  // Scoping the update by profileId makes another user's message a 404.
  const message = await prisma.message.update({ where: { id, profileId: userId }, data, include: messageInclude });
  return toMessageDto(message);
}

// Approves replies (saving the text the creator approved). Already-approved
// messages are left as they were, so approving twice is harmless.
export async function approveMessages(userId: string, input: ApproveMessagesInput): Promise<MessageDto[]> {
  const ids = [...new Set(input.items.map((item) => item.id))];
  const owned = await prisma.message.findMany({ where: { id: { in: ids }, profileId: userId }, select: { id: true, category: true, approvedAt: true } });
  if (owned.length !== ids.length) throw notFound("Message");
  if (owned.some((m) => m.category === "spam")) throw badRequest("Spam doesn't need a reply", "SPAM_REPLY");

  const pending = new Set(owned.filter((m) => m.approvedAt === null).map((m) => m.id));
  const now = new Date();
  await prisma.$transaction(
    input.items
      .filter((item) => pending.has(item.id))
      .map((item) =>
        prisma.message.update({
          where: { id: item.id, profileId: userId },
          data: { approvedAt: now, approvedReply: item.text, readAt: now },
        }),
      ),
  );
  const rows = await prisma.message.findMany({ where: { id: { in: ids }, profileId: userId }, include: messageInclude });
  return rows.map(toMessageDto);
}
