"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export const DEFAULT_HEADSHOT_URL = "https://images.unsplash.com/photo-1699899657680-421c2c2d5064?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export function Headshot() {
  const [url, setUrl] = useState(DEFAULT_HEADSHOT_URL);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    void supabase
      .from("site_settings")
      .select("value")
      .eq("key", "headshot_url")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setUrl(data.value);
      });
  }, []);

  if (failed) return <span className="headshot-fallback" aria-label="Lauren Hohnholt">LH</span>;

  return (
    <img
      className="headshot-image"
      src={url}
      alt="Lauren Hohnholt"
      fetchPriority="high"
      onError={() => setFailed(true)}
    />
  );
}
