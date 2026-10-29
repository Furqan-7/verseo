import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS, SESSION_VALUE, landingPath } from "../../../src/auth/demo";

// The sign-up form posts here. Until real accounts exist, a valid sign-up
// opens the shared demo workspace (the page says so) and starts onboarding
// with the name the visitor typed. Nothing is stored.
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim().slice(0, 60);
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");

  const error = !name ? "name" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "email" : password.length < 8 ? "password" : null;
  if (error) {
    const back = new URL("/auth/signup", request.url);
    back.searchParams.set("error", error);
    if (name) back.searchParams.set("name", name);
    if (email) back.searchParams.set("email", email);
    return NextResponse.redirect(back, 303);
  }

  const response = NextResponse.redirect(new URL(landingPath(false, name.split(" ")[0]), request.url), 303);
  response.cookies.set(SESSION_COOKIE, SESSION_VALUE, SESSION_COOKIE_OPTIONS);
  return response;
}
