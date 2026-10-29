import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { googleConfig } from "../../../src/auth/demo";
import { STATE_COOKIE, callbackUrl } from "../../../src/auth/google";

// Starts Google sign-in (OAuth 2.0 authorization code flow). Without
// GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET it sends the visitor back with
// a notice that Google sign-in isn't connected yet.
export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from") === "signup" ? "/auth/signup" : "/auth/signin";
  const config = googleConfig();
  if (!config) return NextResponse.redirect(new URL(`${from}?notice=google`, request.url), 303);

  const state = randomBytes(16).toString("hex");
  const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  auth.search = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: callbackUrl(request),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  }).toString();

  const response = NextResponse.redirect(auth, 303);
  response.cookies.set(STATE_COOKIE, state, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/auth/google", maxAge: 600 });
  return response;
}
