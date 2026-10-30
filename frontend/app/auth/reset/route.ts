import { NextResponse, type NextRequest } from "next/server";
import { authPage } from "../../../src/auth/pages";
import { serverSupabase } from "../../../src/auth/supabase";

// The "choose a new password" page. The reset email's link signs the
// visitor in (see /auth/confirm) and lands here.
export async function GET() {
  return new Response(authPage("reset"), { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function POST(request: NextRequest) {
  const password = String((await request.formData()).get("password") ?? "");
  const back = (error: string) => NextResponse.redirect(new URL(`/auth/reset?error=${error}`, request.url), 303);
  if (password.length < 8) return back("password");

  const supabase = await serverSupabase();
  if (!supabase) return back("failed");
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.redirect(new URL("/auth/signin?notice=link-expired", request.url), 303);

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return back(error.code === "same_password" ? "same" : error.code === "weak_password" ? "password" : "failed");
  return NextResponse.redirect(new URL("/dashboard?notice=password-updated", request.url), 303);
}
