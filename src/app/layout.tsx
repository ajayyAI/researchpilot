import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/error-boundary";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { dmSans, spaceGrotesk } from "./fonts";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://researchpilot.dev";

export const metadata: Metadata = {
  title: {
    default: "ResearchPilot - AI-Powered Deep Research Assistant",
    template: "%s | ResearchPilot",
  },
  description:
    "Perform iterative, deep research on any topic using AI-powered recursive web search and analysis. Get comprehensive reports backed by verified sources.",
  keywords: [
    "AI research",
    "deep research",
    "research assistant",
    "web search",
    "AI analysis",
  ],
  authors: [{ name: "ResearchPilot" }],
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ResearchPilot",
    title: "ResearchPilot - AI-Powered Deep Research Assistant",
    description:
      "Perform iterative, deep research on any topic using AI-powered recursive web search and analysis.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResearchPilot - AI-Powered Deep Research Assistant",
    description:
      "Perform iterative, deep research on any topic using AI-powered recursive web search and analysis.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${spaceGrotesk.variable} ${dmSans.variable} antialiased flex flex-col min-h-screen bg-bg-primary text-text-primary selection:bg-electric-blue/20 selection:text-electric-blue font-sans`}
      >
        <Header />
        <main className="flex-1 flex flex-col pt-20">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
        <Footer />
      </body>
    </html>
  );
}
