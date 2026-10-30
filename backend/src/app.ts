import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { apiRouter } from "./routes";

export const app = express();

// Behind one proxy (Render, Railway, Fly), so rate limits see the real IP.
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigins,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"],
    maxAge: 600,
  }),
);
app.use(express.json({ limit: "100kb" }));

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "ok", data: { status: "ok", timestamp: new Date().toISOString() } });
});

// A loose per-IP ceiling against floods and token guessing; opening the app
// makes about ten calls, and offices or campuses share one IP.
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3000,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Try again in a few minutes.", error: "RATE_LIMITED" },
  }),
  apiRouter,
);

app.use(notFoundHandler);
app.use(errorHandler);
