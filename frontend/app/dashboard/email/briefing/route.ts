import type { ApiSuccess, DealDto, IdeaDto, MessageDto, ProfileDto, TodoDto } from "@api-types";
import { NextResponse, type NextRequest } from "next/server";
import { serverSupabase } from "../../../../src/auth/supabase";
import { briefingEmail, type BriefingContent, type BriefingSection } from "../../../../src/email/briefing";
import { TODAY_ISO, dayLabel, dealScore } from "../../data";
import { toDeal, toIdea, toThread, toTodo } from "../../_shell/model";

const SECTIONS: BriefingSection[] = ["todo", "inbox", "ideas", "deals"];
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

// Preview of the morning briefing email, built from the signed-in creator's
// workspace: /dashboard/email/briefing?time=8:00&sections=todo,inbox&name=Maya[&format=text]
export async function GET(request: NextRequest) {
  const supabase = await serverSupabase();
  const { data } = supabase ? await supabase.auth.getClaims() : { data: null };
  const token = data?.claims ? (await supabase!.auth.getSession()).data.session?.access_token : undefined;
  if (!token) return NextResponse.redirect(new URL("/auth/signin", request.url), 303);

  const get = async <T,>(path: string) => {
    const response = await fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!response.ok) throw new Error(`${path}: ${response.status}`);
    return ((await response.json()) as ApiSuccess<T>).data;
  };
  let content: BriefingContent;
  let profile: ProfileDto;
  try {
    const [p, messages, deals, todos, ideas] = await Promise.all([
      get<ProfileDto>("/api/profile"),
      get<MessageDto[]>("/api/messages?limit=100"),
      get<DealDto[]>("/api/deals"),
      get<TodoDto[]>("/api/todos"),
      get<IdeaDto[]>("/api/ideas"),
    ]);
    profile = p;
    const threads = messages.map(toThread);
    const needYou = deals.map(toDeal).filter((d) => d.stage !== "Paid" && d.alert);
    const overdue = needYou.find((d) => d.overdue);
    const drafted = threads.filter((t) => t.drafts && t.draftReady && !t.approved && t.category !== "Spam" && t.id !== overdue?.replyId);
    content = {
      label: dayLabel(TODAY_ISO, false),
      summary: `${needYou.length} brand ${needYou.length === 1 ? "deal needs" : "deals need"} you and ${drafted.length + (overdue ? 1 : 0)} replies are drafted.`,
      messagesSorted: threads.length,
      counts: {
        collab: threads.filter((t) => t.category === "Collab").length,
        fan: threads.filter((t) => t.category === "Fan question").length,
        spam: threads.filter((t) => t.category === "Spam").length,
      },
      todos: todos.map(toTodo).filter((t) => !t.done),
      inbox: drafted.slice(0, 3).map((t) => ({ id: t.id, from: t.from, subject: t.subject })),
      ideas: ideas.map(toIdea),
      deals: needYou.map((d) => ({
        slug: d.slug,
        brand: d.brand,
        campaign: d.campaign,
        value: d.value,
        detail: d.note.split(" · ").slice(1).join(" · "),
        health: dealScore(d),
        overdue: d.overdue ? { amount: d.overdue.amount, days: d.overdue.days } : undefined,
      })),
    };
  } catch {
    return new NextResponse("Couldn't load your workspace for the preview. Try again in a moment.", { status: 502, headers: { "content-type": "text/plain; charset=utf-8" } });
  }

  const params = request.nextUrl.searchParams;
  const sections = (params.get("sections") ?? "").split(",").filter((s): s is BriefingSection => SECTIONS.includes(s as BriefingSection));
  const time = /^\d{1,2}:\d{2}$/.test(params.get("time") ?? "") ? params.get("time")! : profile.briefingTime;
  const name = params.get("name")?.trim().slice(0, 40) || profile.name.split(" ")[0] || undefined;
  const email = briefingEmail({ origin: request.nextUrl.origin, content, time, name, sections: sections.length ? sections : undefined });

  if (params.get("format") === "text") {
    return new NextResponse(`Subject: ${email.subject}\n\n${email.text}`, { headers: { "content-type": "text/plain; charset=utf-8" } });
  }
  return new NextResponse(email.html, { headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex" } });
}
