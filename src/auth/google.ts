import type { NextRequest } from "next/server";

// Shared by app/auth/google (start) and app/auth/google/callback.
export const STATE_COOKIE = "creatoros_oauth_state";

// Must match an "Authorized redirect URI" in the Google Cloud console.
// APP_URL overrides the request origin behind a proxy.
export function callbackUrl(request: NextRequest) {
  return `${process.env.APP_URL ?? request.nextUrl.origin}/auth/google/callback`;
}
