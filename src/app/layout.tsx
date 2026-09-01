import type { Metadata } from "next";
import { AdminKeyboardShortcut } from "@/components/admin-keyboard-shortcut";
import { PortfolioSettingsProvider } from "@/components/portfolio-settings-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = { title: { default: "Lauren Hohnholt | Portfolio", template: "%s | Lauren Hohnholt" }, description: "Lauren Hohnholt's portfolio of creative projects, experience, and work." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><PortfolioSettingsProvider><AdminKeyboardShortcut /><SiteHeader />{children}<SiteFooter /></PortfolioSettingsProvider></body></html>;
}
