"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { applyTheme, DEFAULT_PORTFOLIO_SETTINGS, type PortfolioSettings } from "@/lib/portfolio-settings";
import { publicRestGet } from "@/lib/supabase/public-client";

const PortfolioSettingsContext = createContext<PortfolioSettings>(DEFAULT_PORTFOLIO_SETTINGS);

export function PortfolioSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState(DEFAULT_PORTFOLIO_SETTINGS);

  useEffect(() => {
    void publicRestGet<PortfolioSettings[]>("portfolio_settings?select=*&id=eq.1&limit=1").then((rows) => {
      const next = rows?.[0];
      if (!next) return;
      setSettings(next);
      applyTheme(next);
    });
  }, []);

  return <PortfolioSettingsContext.Provider value={settings}>{children}</PortfolioSettingsContext.Provider>;
}

export function usePortfolioSettings() {
  return useContext(PortfolioSettingsContext);
}
