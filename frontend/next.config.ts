import type { NextConfig } from "next";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
// The pnpm workspace root (frontend/, backend/, db/). pnpm keeps packages in
// its node_modules, linked from frontend/node_modules, so the bundler and
// file tracing have to see the whole workspace.
const workspace = join(here, "..");

const nextConfig: NextConfig = {
  turbopack: { root: workspace },
  outputFileTracingRoot: workspace,
  // .rendered/ is written by the prebuild step and read by the route handlers
  // at build time. It has to be traced into the deployment, or the build
  // cannot read it on a platform that ships only what it can see imported.
  outputFileTracingIncludes: {
    "/**": [".rendered/**"],
  },
};

export default nextConfig;
