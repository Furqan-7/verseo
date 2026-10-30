import { z } from "zod";
import { cuid } from "./common";

export const markAlertsReadBody = z.object({ ids: z.array(cuid).min(1).max(100) }).strict();

export const analyticsQuery = z.object({
  range: z.enum(["7", "30", "90"]).default("30").transform(Number),
});

export const copilotBody = z.object({ question: z.string().trim().min(2).max(300) }).strict();

export type AnalyticsQuery = z.infer<typeof analyticsQuery>;
