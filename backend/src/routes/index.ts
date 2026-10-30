import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { dealsRouter } from "./deals.routes";
import { eventsRouter } from "./events.routes";
import { messagesRouter } from "./messages.routes";
import { alertsRouter, analyticsRouter, copilotRouter, summaryRouter } from "./misc.routes";
import { profileRouter, workspaceRouter } from "./profile.routes";
import { clipsRouter, postsRouter, videosRouter } from "./publish.routes";
import { ideasRouter, todosRouter } from "./today.routes";

// Everything under /api needs a signed-in Supabase user.
export const apiRouter = Router();

apiRouter.use(requireAuth);
apiRouter.use("/profile", profileRouter);
apiRouter.use("/workspace", workspaceRouter);
apiRouter.use("/summary", summaryRouter);
apiRouter.use("/messages", messagesRouter);
apiRouter.use("/deals", dealsRouter);
apiRouter.use("/todos", todosRouter);
apiRouter.use("/ideas", ideasRouter);
apiRouter.use("/events", eventsRouter);
apiRouter.use("/videos", videosRouter);
apiRouter.use("/clips", clipsRouter);
apiRouter.use("/posts", postsRouter);
apiRouter.use("/alerts", alertsRouter);
apiRouter.use("/analytics", analyticsRouter);
apiRouter.use("/copilot", copilotRouter);
