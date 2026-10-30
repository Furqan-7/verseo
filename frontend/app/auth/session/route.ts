import { NextResponse, type NextRequest } from "next/server";
import { serverSupabase } from "../../../src/auth/supabase";

// The sign-in form posts here. 303 makes the browser follow the redirect with
// a GET; redirect() would answer 307 and repeat the POST. The workspace sends
// first-time users on to onboarding.
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const back = (params: Record<string, string>) => {
    const url = new URL("/auth/signin", request.url);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    if (email) url.searchParams.set("email", email);
    return NextResponse.redirect(url, 303);
  };

  const supabase = await serverSupabase();
  if (!supabase) return back({ notice: "auth-unavailable" });

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return back(error.code === "email_not_confirmed" ? { notice: "confirm" } : { error: "1" });
  return NextResponse.redirect(new URL("/dashboard", request.url), 303);
}
