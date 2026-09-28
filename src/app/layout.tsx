import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import "../styles/globals.css";
import "../styles/lightbox.css";
import Providers from "./providers";
import TopNavbar from "@/components/ui/layout/TopNavbar";
import BottomNavbar from "@/components/ui/layout/BottomNavbar";
import Sidebar from "@/components/ui/layout/Sidebar";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { IS_PRODUCTION } from "@/utils/constants";
import dynamic from "next/dynamic";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";
const Disclaimer = dynamic(() => import("@/components/ui/overlay/Disclaimer"));
const AdShield = dynamic(() => import("@/components/ui/other/AdShield"));

export const metadata: Metadata = {
  title: siteConfig.name,
  applicationName: siteConfig.name,
  description: siteConfig.description,
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/snapflix.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/snapflix.png",
    apple: "/apple-touch-icon.png",
  },
  twitter: {
    card: "summary",
    title: {
      default: siteConfig.name,
      template: siteConfig.name,
    },
    description: siteConfig.description,
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: {
      default: siteConfig.name,
      template: siteConfig.name,
    },
    description: siteConfig.description,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#141414" },
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html suppressHydrationWarning lang="en" className="dark">
      {/* Ranade (Indian Type Foundry) is served by Fontshare */}
      <link rel="preconnect" href="https://api.fontshare.com" />
      <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        precedence="default"
        href="https://api.fontshare.com/v2/css?f[]=ranade@400,500,700&display=swap"
      />
      <body
        suppressHydrationWarning
        className="bg-background min-h-dvh overflow-x-hidden text-foreground antialiased select-none"
      >
        <Suspense>
          <NuqsAdapter>
            <Providers>
              <AdShield />
              {IS_PRODUCTION && <Disclaimer />}
              <TopNavbar />
              {/* Floating panel shell: ambient backdrop + rail + glass panel */}
              <Sidebar>{children}</Sidebar>
              <BottomNavbar />
            </Providers>
          </NuqsAdapter>
        </Suspense>
        <SpeedInsights debug={false} />
        <Analytics debug={false} />
      </body>
    </html>
  );
}
