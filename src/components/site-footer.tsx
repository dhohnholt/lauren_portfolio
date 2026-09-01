"use client";

import { usePortfolioSettings } from "@/components/portfolio-settings-provider";

export function SiteFooter() {
  const settings = usePortfolioSettings();
  return <footer className="site-footer"><p>Lauren Hohnholt</p><p>{settings.footer_tagline}</p><p>© {new Date().getFullYear()}</p></footer>;
}
