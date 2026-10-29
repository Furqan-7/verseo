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
