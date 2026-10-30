import { Router } from "express";
import * as publish from "../controllers/publish.controller";
import { validate } from "../middleware/validate";
import { idParam } from "../schemas/common";
import { captionParams, listPostsQuery, listVideosQuery, scheduleClipBody, updateCaptionBody, updateClipBody } from "../schemas/publish";

export const videosRouter = Router();

videosRouter.get("/", validate({ query: listVideosQuery }), publish.listVideos);

export const clipsRouter = Router();

clipsRouter.patch("/:id", validate({ params: idParam, body: updateClipBody }), publish.updateClip);
clipsRouter.patch("/:id/captions/:platform", validate({ params: captionParams, body: updateCaptionBody }), publish.updateCaption);
clipsRouter.post("/:id/schedule", validate({ params: idParam, body: scheduleClipBody }), publish.scheduleClip);

export const postsRouter = Router();

postsRouter.get("/", validate({ query: listPostsQuery }), publish.listPosts);
