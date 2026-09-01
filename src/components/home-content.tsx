"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Headshot } from "@/components/headshot";
import { ProjectViewer } from "@/components/project-viewer";
import { DEFAULT_PORTFOLIO_SETTINGS, type PortfolioSettings } from "@/lib/portfolio-settings";
import { supabase } from "@/lib/supabase/client";

export function HomeContent() {
  const [content, setContent] = useState<PortfolioSettings>(DEFAULT_PORTFOLIO_SETTINGS);

  useEffect(() => {
    if (!supabase) return;
    void supabase.from("portfolio_settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => {
      if (data) setContent(data as PortfolioSettings);
    });
  }, []);

  return (
    <main>
      <section className="hero section-shell" id="about">
        <div className="portrait-mark"><Headshot /></div>
        <div className="hero-copy"><p className="eyebrow">{content.hero_eyebrow}</p><h1>{content.hero_title}</h1><p className="lede">{content.hero_body}</p><div className="button-row"><Link className="button button-primary" href="/projects">{content.primary_cta_label}</Link><Link className="button button-quiet" href="/contact">{content.secondary_cta_label}</Link></div></div>
      </section>
      <section className="projects-section" id="projects"><div className="section-shell"><div className="section-heading light-heading"><p className="eyebrow">{content.projects_eyebrow}</p><h2>{content.projects_title}</h2></div><ProjectViewer /></div></section>
      <section className="experience-section" id="experience"><div className="section-shell experience-grid"><div><p className="eyebrow">{content.experience_eyebrow}</p><h2>{content.experience_title}</h2></div><div className="experience-copy"><p>{content.experience_body}</p><Link className="text-link" href="/resume">{content.experience_link_label} <span aria-hidden="true">↗</span></Link></div></div></section>
    </main>
  );
}
