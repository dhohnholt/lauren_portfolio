import type { Metadata } from "next";
import { AdminKeyboardShortcut } from "@/components/admin-keyboard-shortcut";
import { PortfolioSettingsProvider } from "@/components/portfolio-settings-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const siteDescription = "Lauren Hohnholt's portfolio of electrical engineering projects, experience, and creative work.";

export const metadata: Metadata = {
  metadataBase: new URL("https://laurenhohnholt.com"),
  title: { default: "Lauren Hohnholt | Portfolio", template: "%s | Lauren Hohnholt" },
  description: siteDescription,
  openGraph: {
    title: "Lauren Hohnholt | Electrical Engineering Portfolio",
    description: siteDescription,
    url: "/",
    siteName: "Lauren Hohnholt",
    images: [{ url: "/lauren-hohnholt-social-card.jpg", width: 1200, height: 630, alt: "Lauren Hohnholt and an introduction to her electrical engineering portfolio" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lauren Hohnholt | Electrical Engineering Portfolio",
    description: siteDescription,
    images: [{ url: "/lauren-hohnholt-social-card.jpg", alt: "Lauren Hohnholt and an introduction to her electrical engineering portfolio" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><PortfolioSettingsProvider><AdminKeyboardShortcut /><SiteHeader />{children}<SiteFooter /></PortfolioSettingsProvider></body></html>;
}
