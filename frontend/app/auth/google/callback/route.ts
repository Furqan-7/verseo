import { NextResponse, type NextRequest } from "next/server";
import { serverSupabase } from "../../../../src/auth/supabase";

// Supabase sends the visitor back here with ?code= after Google. Trading the
// code for a session sets the session cookies; the workspace then sends a
// first-time user on to onboarding.
export async function GET(request: NextRequest) {
  const fail = (reason: string) => NextResponse.redirect(new URL(`/auth/signin?notice=${reason}`, request.url), 303);
  const params = request.nextUrl.searchParams;
  if (params.get("error")) return fail(params.get("error") === "access_denied" ? "google-cancelled" : "google-failed");

  const code = params.get("code");
  const supabase = await serverSupabase();
  if (!supabase) return fail("auth-unavailable");
  if (!code) return fail("google-failed");

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return fail("google-failed");
  return NextResponse.redirect(new URL("/dashboard", request.url), 303);
}
