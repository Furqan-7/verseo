import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";

// Root layout for /dashboard only. The marketing pages are prerendered Framer
// HTML served by route handlers, so there is no app-wide app/layout.tsx.

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Today — CreatorOS",
  description: "Your daily creator briefing.",
  robots: { index: false },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
