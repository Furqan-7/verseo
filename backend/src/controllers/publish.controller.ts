import type { Request, Response } from "express";
import type { ListPostsQuery, ScheduleClipInput, UpdateCaptionInput, UpdateClipInput } from "../schemas/publish";
import * as publishService from "../services/publish.service";
import type { PublishPlatform } from "../types/api";
import { paginate, sendList, sendSuccess } from "../utils/response";

export async function listVideos(req: Request, res: Response) {
  const { page, limit } = res.locals.query as { page: number; limit: number };
  const { videos, total } = await publishService.listVideos(res.locals.userId, page, limit);
  sendList(res, videos, paginate(page, limit, total), "Videos fetched");
}

export async function updateClip(req: Request, res: Response) {
  sendSuccess(res, await publishService.updateClip(res.locals.userId, req.params.id as string, req.body as UpdateClipInput), "Clip updated");
}

export async function updateCaption(req: Request, res: Response) {
  const { id, platform } = req.params as { id: string; platform: PublishPlatform };
  sendSuccess(res, await publishService.updateCaption(res.locals.userId, id, platform, req.body as UpdateCaptionInput), "Caption updated");
}

export async function scheduleClip(req: Request, res: Response) {
  sendSuccess(res, await publishService.scheduleClip(res.locals.userId, req.params.id as string, req.body as ScheduleClipInput), "Clip scheduled", 201);
}

export async function listPosts(req: Request, res: Response) {
  sendSuccess(res, await publishService.listPosts(res.locals.userId, res.locals.query as ListPostsQuery), "Posts fetched");
}
