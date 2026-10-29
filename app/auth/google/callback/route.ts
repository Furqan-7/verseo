import { NextResponse, type NextRequest } from "next/server";
import { ONBOARDED_COOKIE, SESSION_COOKIE, SESSION_COOKIE_OPTIONS, SESSION_VALUE, googleConfig, landingPath } from "../../../../src/auth/demo";
import { STATE_COOKIE, callbackUrl } from "../../../../src/auth/google";

// Google sends the visitor back here with ?code=&state=. We check the state,
// trade the code for an ID token, and open the workspace for a verified
// Google email. (The ID token comes straight from Google over TLS, so its
// claims can be read without verifying the signature.)
export async function GET(request: NextRequest) {
  const fail = (reason: string) => NextResponse.redirect(new URL(`/auth/signin?notice=${reason}`, request.url), 303);
  const config = googleConfig();
  if (!config) return fail("google");

  const params = request.nextUrl.searchParams;
  const state = request.cookies.get(STATE_COOKIE)?.value;
  if (params.get("error")) return fail("google-cancelled");
  if (!state || state !== params.get("state") || !params.get("code")) return fail("google-failed");

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: params.get("code")!,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: callbackUrl(request),
      grant_type: "authorization_code",
    }),
  });
  if (!tokenResponse.ok) return fail("google-failed");

  const { id_token: idToken } = (await tokenResponse.json()) as { id_token?: string };
  const payload = idToken?.split(".")[1];
  const claims = payload ? (JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email?: string; email_verified?: boolean; given_name?: string }) : null;
  if (!claims?.email || !claims.email_verified) return fail("google-failed");

  const response = NextResponse.redirect(new URL(landingPath(request.cookies.has(ONBOARDED_COOKIE), claims.given_name), request.url), 303);
  response.cookies.set(SESSION_COOKIE, SESSION_VALUE, SESSION_COOKIE_OPTIONS);
  response.cookies.delete({ name: STATE_COOKIE, path: "/auth/google" });
  return response;
}
