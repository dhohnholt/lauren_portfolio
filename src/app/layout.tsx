import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeLoader } from "@/components/theme-loader";
import "./globals.css";

export const metadata: Metadata = { title: { default: "Lauren Hohnholt | Portfolio", template: "%s | Lauren Hohnholt" }, description: "Lauren Hohnholt's portfolio of creative projects, experience, and work." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ThemeLoader /><SiteHeader />{children}<SiteFooter /></body></html>;
}
