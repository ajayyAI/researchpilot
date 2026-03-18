import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/error-boundary";
import { Header } from "@/components/layout/Header";
import { dmSans, spaceGrotesk } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResearchPilot - AI Deep Research",
  description:
    "AI-powered recursive web research. Get comprehensive reports backed by verified sources.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://researchpilot.dev",
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${dmSans.variable} antialiased min-h-screen`}
      >
        <Header />
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
