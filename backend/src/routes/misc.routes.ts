import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as misc from "../controllers/misc.controller";
import { summary } from "../controllers/today.controller";
import { validate } from "../middleware/validate";
import { analyticsQuery, copilotBody, markAlertsReadBody } from "../schemas/misc";

export const alertsRouter = Router();

alertsRouter.get("/", misc.alerts);
alertsRouter.post("/read", validate({ body: markAlertsReadBody }), misc.readAlerts);

export const analyticsRouter = Router();

analyticsRouter.get("/", validate({ query: analyticsQuery }), misc.analytics);

export const summaryRouter = Router();

summaryRouter.get("/", summary);

// Copilot runs several queries per question, so it gets its own, tighter limit.
export const copilotRouter = Router();

copilotRouter.post(
  "/",
  rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false, message: { success: false, message: "Too many questions. Wait a minute and try again.", error: "RATE_LIMITED" } }),
  validate({ body: copilotBody }),
  misc.copilot,
);
