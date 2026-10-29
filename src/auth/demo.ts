// Hackathon demo login. Every visitor signs in with the same account until a
// real auth provider is connected; replace these checks when it is.

export const DEMO_EMAIL = "user@gmail.com";
export const DEMO_PASSWORD = "user12345";

export const SESSION_COOKIE = "creatoros_session";
export const SESSION_VALUE = "demo";

// Set once onboarding is finished or skipped, so sign-in goes straight to
// /dashboard after the first time.
export const ONBOARDED_COOKIE = "creatoros_onboarded";

export function isDemoLogin(email: string, password: string): boolean {
  return email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;
}

// Where a signed-in visitor lands: onboarding the first time, then Today.
export function landingPath(onboarded: boolean, name?: string) {
  if (onboarded) return "/dashboard";
  return name ? `/dashboard/onboarding?name=${encodeURIComponent(name)}` : "/dashboard/onboarding";
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

// Google sign-in is live only when both are set (see app/auth/google).
export function googleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}
