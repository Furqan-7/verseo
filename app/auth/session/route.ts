import { NextResponse, type NextRequest } from "next/server";
import { ONBOARDED_COOKIE, SESSION_COOKIE, SESSION_VALUE, isDemoLogin } from "../../../src/auth/demo";

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

  const next = request.cookies.has(ONBOARDED_COOKIE) ? "/dashboard" : "/dashboard/onboarding";
  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
