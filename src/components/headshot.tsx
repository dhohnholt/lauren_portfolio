"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export const DEFAULT_HEADSHOT_URL = "https://images.unsplash.com/photo-1699899657680-421c2c2d5064?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export function Headshot() {
  const [url, setUrl] = useState(DEFAULT_HEADSHOT_URL);
  const [zoom, setZoom] = useState(100);
  const [shiftX, setShiftX] = useState(0);
  const [shiftY, setShiftY] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    void supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["headshot_url", "headshot_zoom", "headshot_shift_x", "headshot_shift_y"])
      .then(({ data }) => {
        for (const setting of data ?? []) {
          if (setting.key === "headshot_url" && setting.value) setUrl(setting.value);
          if (setting.key === "headshot_zoom") setZoom(Math.min(200, Math.max(100, Number(setting.value) || 100)));
          if (setting.key === "headshot_shift_x") setShiftX(Math.min(30, Math.max(-30, Number(setting.value) || 0)));
          if (setting.key === "headshot_shift_y") setShiftY(Math.min(30, Math.max(-30, Number(setting.value) || 0)));
        }
      });
  }, []);

  if (failed) return <span className="headshot-crop"><span className="headshot-fallback" aria-label="Lauren Hohnholt">LH</span></span>;

  return (
    <span className="headshot-crop">
      <img
        className="headshot-image"
        src={url}
        alt="Lauren Hohnholt"
        fetchPriority="high"
        style={{ transform: `translate(${shiftX}%, ${shiftY}%) scale(${zoom / 100})` }}
        onError={() => setFailed(true)}
      />
    </span>
  );
}
