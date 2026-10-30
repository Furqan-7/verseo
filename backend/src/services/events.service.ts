import { prisma } from "db";
import type { CreateEventInput, ListEventsQuery, UpdateEventInput } from "../schemas/events";
import type { EventDto } from "../types/api";
import { fromIsoDate } from "../utils/dates";
import { toEventDto } from "./mappers";

export async function listEvents(userId: string, query: ListEventsQuery): Promise<EventDto[]> {
  const rows = await prisma.calendarEvent.findMany({
    where: {
      profileId: userId,
      date: { gte: query.from ? fromIsoDate(query.from) : undefined, lte: query.to ? fromIsoDate(query.to) : undefined },
    },
    orderBy: [{ date: "asc" }, { startMinutes: { sort: "asc", nulls: "first" } }],
  });
  return rows.map(toEventDto);
}

export async function createEvent(userId: string, input: CreateEventInput): Promise<EventDto> {
  const event = await prisma.calendarEvent.create({
    data: {
      profileId: userId,
      title: input.title,
      type: input.type,
      date: fromIsoDate(input.date),
      startMinutes: input.startMinutes,
      endMinutes: input.endMinutes,
      detail: input.detail,
      tentative: input.tentative,
    },
  });
  return toEventDto(event);
}

export async function updateEvent(userId: string, id: string, input: UpdateEventInput): Promise<EventDto> {
  const event = await prisma.calendarEvent.update({ where: { id, profileId: userId }, data: input });
  return toEventDto(event);
}

export async function deleteEvent(userId: string, id: string) {
  await prisma.calendarEvent.delete({ where: { id, profileId: userId } });
}
