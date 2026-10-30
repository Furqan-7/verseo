import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

// Supabase Auth for the auth route handlers and server components. The
// session lives in Supabase's own cookies (written by @supabase/ssr), which
// the browser client also reads to get the access token it sends to the API.

export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

// A client bound to this request's cookies. In route handlers it can also
// set cookies (sign-in, sign-out, code exchange); in server components the
// write is skipped, and proxy.ts refreshes the session instead.
export async function serverSupabase() {
  const env = supabaseEnv();
  if (!env) return null;
  const store = await cookies();
  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a server component; proxy.ts keeps the cookies fresh.
        }
      },
    },
  });
}

// Where Supabase sends people back to (email links and Google). APP_URL
// overrides the request origin behind a proxy; every value must be listed
// under Authentication › URL Configuration › Redirect URLs in Supabase.
export function appUrl(request: NextRequest, path: string) {
  return `${process.env.APP_URL ?? request.nextUrl.origin}${path}`;
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
