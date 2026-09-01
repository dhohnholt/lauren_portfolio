"use client";

import { useEffect } from "react";
import { applyTheme, type PortfolioSettings } from "@/lib/portfolio-settings";
import { supabase } from "@/lib/supabase/client";

export function ThemeLoader() {
  useEffect(() => {
    if (!supabase) return;
    void supabase.from("portfolio_settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => {
      if (data) applyTheme(data as PortfolioSettings);
    });
  }, []);
  return null;
}
