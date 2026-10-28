import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "../../../src/auth/demo";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/auth/signin", request.url), 303);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
