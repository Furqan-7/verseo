import type { Metadata } from "next";
import { requireSession } from "../_shell/session";
import Onboarding from "./Onboarding";

export const metadata: Metadata = { title: "Get started" };

// First-run setup, shown after the first sign-in. It sits outside the
// (workspace) group, so it has no sidebar.
export default async function OnboardingPage() {
  await requireSession();
  return <Onboarding />;
}
