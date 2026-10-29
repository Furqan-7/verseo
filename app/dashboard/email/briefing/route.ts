import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, SESSION_VALUE } from "../../../../src/auth/demo";
import { briefingEmail, type BriefingSection } from "../../../../src/email/briefing";

const SECTIONS: BriefingSection[] = ["todo", "inbox", "ideas", "deals"];

// Preview of the morning briefing email: /dashboard/email/briefing
// ?time=8:00&sections=todo,inbox&name=Maya[&format=text]
export async function GET(request: NextRequest) {
  const session = (await cookies()).get(SESSION_COOKIE);
  if (session?.value !== SESSION_VALUE) return NextResponse.redirect(new URL("/auth/signin", request.url), 303);

  const params = request.nextUrl.searchParams;
  const sections = (params.get("sections") ?? "").split(",").filter((s): s is BriefingSection => SECTIONS.includes(s as BriefingSection));
  const time = /^\d{1,2}:\d{2}$/.test(params.get("time") ?? "") ? params.get("time")! : undefined;
  const name = params.get("name")?.trim().slice(0, 40) || undefined;
  const email = briefingEmail({ origin: request.nextUrl.origin, time, name, sections: sections.length ? sections : undefined });

  if (params.get("format") === "text") {
    return new NextResponse(`Subject: ${email.subject}\n\n${email.text}`, { headers: { "content-type": "text/plain; charset=utf-8" } });
  }
  return new NextResponse(email.html, { headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex" } });
}
