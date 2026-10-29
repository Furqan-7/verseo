import { NextResponse, type NextRequest } from "next/server";
import { ONBOARDED_COOKIE, SESSION_COOKIE, SESSION_COOKIE_OPTIONS, SESSION_VALUE, isDemoLogin, landingPath } from "../../../src/auth/demo";

// The sign-in form posts here. 303 makes the browser follow the redirect with
// a GET; redirect() would answer 307 and repeat the POST.
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");

  if (!isDemoLogin(email, password)) {
    const back = new URL("/auth/signin", request.url);
    back.searchParams.set("error", "1");
    if (email) back.searchParams.set("email", email);
    return NextResponse.redirect(back, 303);
  }

  const response = NextResponse.redirect(new URL(landingPath(request.cookies.has(ONBOARDED_COOKIE)), request.url), 303);
  response.cookies.set(SESSION_COOKIE, SESSION_VALUE, SESSION_COOKIE_OPTIONS);
  return response;
}
