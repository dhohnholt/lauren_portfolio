"use client";

import { useEffect, useState } from "react";
import { DEFAULT_PORTFOLIO_SETTINGS } from "@/lib/portfolio-settings";
import { supabase } from "@/lib/supabase/client";

export function SiteFooter() {
  const [tagline, setTagline] = useState(DEFAULT_PORTFOLIO_SETTINGS.footer_tagline);

  useEffect(() => {
    if (!supabase) return;
    void supabase.from("portfolio_settings").select("footer_tagline").eq("id", 1).maybeSingle().then(({ data }) => {
      if (data?.footer_tagline) setTagline(data.footer_tagline);
    });
  }, []);

  return <footer className="site-footer"><p>Lauren Hohnholt</p><p>{tagline}</p><p>© {new Date().getFullYear()}</p></footer>;
}
