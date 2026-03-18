import type { Metadata, Viewport } from "next";
import { Header } from "@/components/layout/Header";
import { getSiteUrl, siteConfig } from "@/lib/site-config";
import { dmSans, spaceGrotesk } from "./fonts";
import "./globals.css";

const metadataBase = getSiteUrl();

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: `${siteConfig.name} | AI Deep Research`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [...siteConfig.keywords],
  referrer: "origin-when-cross-origin",
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: metadataBase,
    title: `${siteConfig.name} | AI Deep Research`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    locale: "en_US",
  },
  other: {
    "github:repo": siteConfig.githubUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | AI Deep Research`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
  appleWebApp: {
    capable: true,
    title: siteConfig.shortName,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: siteConfig.themeColor,
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${dmSans.variable} min-h-screen antialiased`}
      >
        <a
          href="#main-content"
          className="focus-ring sr-only fixed left-4 top-4 z-[60] rounded-md bg-bg-elevated px-3 py-2 text-sm text-text-primary focus:not-sr-only"
        >
          Skip to content
        </a>
        <Header />
        {children}
      </body>
    </html>
  );
}
