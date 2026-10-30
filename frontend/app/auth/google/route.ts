import { NextResponse, type NextRequest } from "next/server";
import { appUrl, serverSupabase } from "../../../src/auth/supabase";

// Starts Google sign-in through Supabase (PKCE). Supabase keeps the code
// verifier in a cookie and sends the visitor to Google, then back to
// /auth/google/callback. Google must be enabled under Authentication ›
// Providers in Supabase.
export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from") === "signup" ? "/auth/signup" : "/auth/signin";
  const supabase = await serverSupabase();
  if (!supabase) return NextResponse.redirect(new URL(`${from}?notice=auth-unavailable`, request.url), 303);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: appUrl(request, "/auth/google/callback"), skipBrowserRedirect: true, queryParams: { prompt: "select_account" } },
  });
  if (error || !data.url) return NextResponse.redirect(new URL(`${from}?notice=google-failed`, request.url), 303);
  return NextResponse.redirect(data.url, 303);
}
