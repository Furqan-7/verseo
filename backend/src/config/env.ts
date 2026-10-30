import { config } from "dotenv";
import { resolve } from "path";
import { z } from "zod";

config({ path: resolve(__dirname, "../../.env") });

// Every variable the API needs, checked once at start-up so a missing
// value fails loudly instead of on the first request.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  // Comma-separated list of origins allowed to call the API.
  CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN is required"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  SUPABASE_URL: z.url("SUPABASE_URL must be a URL"),
  SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY is required"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const problems = parsed.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
  console.error(`Invalid environment variables:\n${problems}`);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean),
  isProduction: parsed.data.NODE_ENV === "production",
};
