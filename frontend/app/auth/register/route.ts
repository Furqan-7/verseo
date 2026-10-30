import { NextResponse, type NextRequest } from "next/server";
import { EMAIL_PATTERN, appUrl, serverSupabase } from "../../../src/auth/supabase";

// The sign-up form posts here and creates the Supabase account. With email
// confirmation on (Supabase's default) the visitor confirms first and then
// signs in; with it off they go straight to onboarding.
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim().slice(0, 60);
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const back = (key: "error" | "notice", value: string) => {
    const url = new URL("/auth/signup", request.url);
    url.searchParams.set(key, value);
    if (name) url.searchParams.set("name", name);
    if (email) url.searchParams.set("email", email);
    return NextResponse.redirect(url, 303);
  };

  const invalid = !name ? "name" : !EMAIL_PATTERN.test(email) ? "email" : password.length < 8 ? "password" : null;
  if (invalid) return back("error", invalid);

  const supabase = await serverSupabase();
  if (!supabase) return back("notice", "auth-unavailable");

  const firstName = name.split(" ")[0];
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name }, emailRedirectTo: appUrl(request, `/auth/confirm?next=${encodeURIComponent(`/dashboard/onboarding?name=${firstName}`)}`) },
  });
  if (error) {
    return back("error", error.code === "user_already_exists" ? "exists" : error.code === "weak_password" ? "password" : "failed");
  }
  if (!data.session) {
    const url = new URL("/auth/signin", request.url);
    url.searchParams.set("notice", "confirm");
    url.searchParams.set("email", email);
    return NextResponse.redirect(url, 303);
  }
  return NextResponse.redirect(new URL(`/dashboard/onboarding?name=${encodeURIComponent(firstName)}`, request.url), 303);
}
