"use client";

import { createBrowserClient } from "@supabase/ssr";
import type {
  AccountStatus,
  AlertDto,
  AnalyticsDto,
  ApiFailure,
  ApiList,
  ApiSuccess,
  ClipDto,
  ContractTermsInput,
  CopilotAnswerDto,
  DealDto,
  DealStage,
  EventDto,
  EventType,
  IdeaDto,
  IdeaPlatform,
  MessageDto,
  PostDto,
  ProfileDto,
  Provider,
  PublishPlatform,
  SummaryDto,
  TodoDto,
  Tone,
  VideoDto,
} from "@api-types";

// Every call to the CreatorOS API goes through here. The Supabase session
// (kept in cookies by @supabase/ssr) supplies the access token; the API
// verifies it and works out the user from it, so no user id is ever sent.

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function supabaseBrowser() {
  if (!browserClient) {
    browserClient = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "");
  }
  return browserClient;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE", path: string, body?: unknown): Promise<T> {
  const { data } = await supabaseBrowser().auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    window.location.href = "/auth/signin";
    throw new ApiError(401, "UNAUTHORIZED", "Sign in to continue");
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(body !== undefined ? { "Content-Type": "application/json" } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Can't reach CreatorOS right now. Check your connection.");
  }

  if (response.status === 204) return undefined as T;
  const json = (await response.json().catch(() => null)) as ApiSuccess<unknown> | ApiFailure | null;
  if (response.status === 401) {
    window.location.href = "/auth/signin";
  }
  if (!response.ok || !json || !json.success) {
    const failure = json && !json.success ? json : null;
    throw new ApiError(response.status, failure?.error ?? "INTERNAL_ERROR", failure?.message ?? "Something went wrong. Try again.");
  }
  return json as T;
}

const get = <T>(path: string) => request<ApiSuccess<T>>("GET", path).then((r) => r.data);
const send = <T>(method: "POST" | "PATCH" | "PUT" | "DELETE", path: string, body?: unknown) =>
  request<ApiSuccess<T> | undefined>(method, path, body).then((r) => r?.data as T);

export const api = {
  profile: () => get<ProfileDto>("/api/profile"),
  updateProfile: (patch: Partial<Omit<ProfileDto, "id" | "email" | "accounts" | "onboarded" | "hasWorkspace">>) => send<ProfileDto>("PATCH", "/api/profile", patch),
  setAccount: (provider: Provider, status: AccountStatus) => send<ProfileDto>("PUT", `/api/profile/accounts/${provider}`, { status }),
  completeOnboarding: (body: { name?: string; niche: string; goals: string[]; briefingTime: string; accounts: Partial<Record<Provider, AccountStatus>>; sampleWorkspace: boolean }) =>
    send<ProfileDto>("POST", "/api/profile/onboarding", body),
  resetWorkspace: () => send<null>("DELETE", "/api/workspace"),

  summary: () => get<SummaryDto>("/api/summary"),

  messages: () => request<ApiList<MessageDto>>("GET", "/api/messages?limit=100").then((r) => r.data),
  updateMessage: (id: string, patch: { read?: boolean; archived?: boolean; tone?: Tone; draftRequested?: true; editedReply?: string | null }) =>
    send<MessageDto>("PATCH", `/api/messages/${id}`, patch),
  approveMessages: (items: { id: string; text: string }[]) => send<{ messages: MessageDto[]; summary: SummaryDto }>("POST", "/api/messages/approve", { items }),

  deals: () => get<DealDto[]>("/api/deals"),
  createDeal: (terms: ContractTermsInput) => send<DealDto>("POST", "/api/deals", terms),
  updateDeal: (slug: string, patch: { inCalendar?: boolean; stage?: DealStage }) => send<DealDto>("PATCH", `/api/deals/${slug}`, patch),
  setDeliverable: (slug: string, id: string, done: boolean) => send<DealDto>("PATCH", `/api/deals/${slug}/deliverables/${id}`, { done }),

  todos: () => get<TodoDto[]>("/api/todos"),
  createTodo: (body: { title: string; detail: string; dueDate: string; dueMinutes?: number | null; ideaId?: string }) => send<TodoDto>("POST", "/api/todos", body),
  updateTodo: (id: string, patch: { done?: boolean }) => send<TodoDto>("PATCH", `/api/todos/${id}`, patch),
  ideas: () => get<IdeaDto[]>("/api/ideas"),
  createIdea: (body: { title: string; why: string; platforms: IdeaPlatform[] }) => send<IdeaDto>("POST", "/api/ideas", body),

  events: () => get<EventDto[]>("/api/events"),
  createEvent: (body: { title: string; type: EventType; date: string; startMinutes: number | null; endMinutes: number | null; detail: string | null }) =>
    send<EventDto>("POST", "/api/events", body),
  updateEvent: (id: string, patch: { tentative?: boolean; done?: boolean }) => send<EventDto>("PATCH", `/api/events/${id}`, patch),
  deleteEvent: (id: string) => send<undefined>("DELETE", `/api/events/${id}`),

  latestVideo: () => request<ApiList<VideoDto>>("GET", "/api/videos?limit=1").then((r) => r.data[0] ?? null),
  updateClip: (id: string, patch: { startSec?: number; endSec?: number; skipped?: boolean; hashtags?: string[] }) => send<ClipDto>("PATCH", `/api/clips/${id}`, patch),
  updateCaption: (id: string, platform: PublishPlatform, patch: { variant?: number; text?: string | null }) =>
    send<ClipDto>("PATCH", `/api/clips/${id}/captions/${platform}`, patch),
  scheduleClip: (id: string, posts: { platform: PublishPlatform; date: string; minutes: number; why: string }[]) => send<ClipDto>("POST", `/api/clips/${id}/schedule`, { posts }),
  posts: () => get<PostDto[]>("/api/posts"),

  alerts: () => get<AlertDto[]>("/api/alerts"),
  markAlertsRead: (ids: string[]) => send<AlertDto[]>("POST", "/api/alerts/read", { ids }),

  analytics: (range: number) => get<AnalyticsDto>(`/api/analytics?range=${range}`),
  askCopilot: (question: string) => send<CopilotAnswerDto>("POST", "/api/copilot", { question }),
};
