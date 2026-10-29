import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_VALUE } from "../../../src/auth/demo";

// Sends visitors without the demo session back to sign-in.
export async function requireSession() {
  const session = (await cookies()).get(SESSION_COOKIE);
  if (session?.value !== SESSION_VALUE) redirect("/auth/signin");
}
