"use client";

/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { useEffect, useState } from "react";
import { canOptimizeImage } from "@/lib/image-hosts";
import { publicRestGet } from "@/lib/supabase/public-client";

export const DEFAULT_HEADSHOT_URL = "https://i.postimg.cc/vBgbXmzW/Ruidoso-05.jpg";

export function Headshot() {
  const [url, setUrl] = useState(DEFAULT_HEADSHOT_URL);
  const [zoom, setZoom] = useState(100);
  const [shiftX, setShiftX] = useState(0);
  const [shiftY, setShiftY] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const keys = "headshot_url,headshot_zoom,headshot_shift_x,headshot_shift_y";
    void publicRestGet<{ key: string; value: string }[]>(`site_settings?select=key,value&key=in.(${keys})`).then((data) => {
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
      {canOptimizeImage(url) ? <Image
        className="headshot-image"
        src={url}
        alt="Lauren Hohnholt"
        fill
        sizes="(max-width: 800px) 82vw, 390px"
        quality={78}
        style={{ transform: `translate(${shiftX}%, ${shiftY}%) scale(${zoom / 100})` }}
        onError={() => setFailed(true)}
      /> : <img className="headshot-image" src={url} alt="Lauren Hohnholt" fetchPriority="high" style={{ transform: `translate(${shiftX}%, ${shiftY}%) scale(${zoom / 100})` }} onError={() => setFailed(true)} />}
    </span>
  );
}
