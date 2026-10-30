import { NextResponse, type NextRequest } from "next/server";
import { authPage } from "../../../src/auth/pages";
import { EMAIL_PATTERN, appUrl, serverSupabase } from "../../../src/auth/supabase";

export async function GET() {
  return new Response(authPage("forgot"), { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

// Asks Supabase to email a reset link, and always answers the same way
// whether or not the email has an account, so the form can't be used to
// find out who has signed up.
export async function POST(request: NextRequest) {
  const email = String((await request.formData()).get("email") ?? "").trim();
  const back = new URL("/auth/forgot", request.url);
  if (!EMAIL_PATTERN.test(email)) {
    back.searchParams.set("error", "email");
  } else {
    const supabase = await serverSupabase();
    if (!supabase) {
      back.searchParams.set("notice", "auth-unavailable");
    } else {
      await supabase.auth.resetPasswordForEmail(email, { redirectTo: appUrl(request, "/auth/confirm?next=/auth/reset") });
      back.searchParams.set("sent", "1");
    }
  }
  if (email) back.searchParams.set("email", email);
  return NextResponse.redirect(back, 303);
}
