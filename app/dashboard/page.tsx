import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_VALUE } from "../../src/auth/demo";
import Dashboard from "./Dashboard";

export default async function DashboardPage() {
  const session = (await cookies()).get(SESSION_COOKIE);
  if (session?.value !== SESSION_VALUE) redirect("/auth/signin");
  return <Dashboard />;
}
