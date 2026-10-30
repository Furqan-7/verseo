import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { serverSupabase } from "../../../src/auth/supabase";

// Where Supabase's emails link to (sign-up confirmation, password reset).
// Handles both link styles: ?code= (PKCE, the default) and ?token_hash=&type=
// (a customised email template). Either way the visitor ends up signed in
// and is sent on to ?next=.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const requested = params.get("next") ?? "/dashboard";
  // Only same-site paths, so the link can't bounce people to another site.
  const next = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard";
  const expired = NextResponse.redirect(new URL("/auth/signin?notice=link-expired", request.url), 303);

  const supabase = await serverSupabase();
  if (!supabase) return NextResponse.redirect(new URL("/auth/signin?notice=auth-unavailable", request.url), 303);

  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("missing code") };
  if (error) return expired;
  return NextResponse.redirect(new URL(next, request.url), 303);
}
