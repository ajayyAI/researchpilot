import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { spaceGrotesk, dmSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deep Research - AI-Powered Research Assistant",
  description:
    "Perform iterative, deep research on any topic using AI-powered web search and analysis.",
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
        <main className="flex-1 flex flex-col pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
