import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Pin the workspace root to this folder. Next infers it from the nearest
  // lockfile, so unzipping this project inside an existing repo makes it
  // compile that repo's files instead of its own and the build fails on
  // imports that were never yours.
  turbopack: { root: here },
  outputFileTracingRoot: here,
  // .rendered/ is written by the prebuild step and read by the route handlers
  // at build time. It has to be traced into the deployment, or the build
  // cannot read it on a platform that ships only what it can see imported.
  outputFileTracingIncludes: {
    "/**": [".rendered/**"],
  },
};

export default nextConfig;
