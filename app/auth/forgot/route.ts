import { NextResponse, type NextRequest } from "next/server";
import { authPage } from "../../../src/auth/pages";

export async function GET() {
  return new Response(authPage("forgot"), { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

// Always answers the same way, whether or not the email has an account, so
// the form can't be used to find out who has signed up.
export async function POST(request: NextRequest) {
  const email = String((await request.formData()).get("email") ?? "").trim();
  const back = new URL("/auth/forgot", request.url);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    back.searchParams.set("error", "email");
  } else {
    back.searchParams.set("sent", "1");
  }
  if (email) back.searchParams.set("email", email);
  return NextResponse.redirect(back, 303);
}
