import { authPage } from "../../../src/auth/pages";

export const dynamic = "force-static";

export async function GET() {
  return new Response(authPage("signin"), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
