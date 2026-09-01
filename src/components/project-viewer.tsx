"use client";

/* eslint-disable @next/next/no-img-element */
import { KeyboardEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Project = { id: number; title: string; category: string; summary: string; canva_url: string | null; thumbnail_url: string | null };

const fallbackProjects: Project[] = [
  { id: 1, title: "Project One", category: "Brand & visual story", summary: "A featured case study ready for Lauren's first project, process notes, and final presentation.", canva_url: null, thumbnail_url: null },
  { id: 2, title: "Project Two", category: "Research & strategy", summary: "A flexible space for the problem, Lauren's approach, and the decisions behind the finished work.", canva_url: null, thumbnail_url: null },
  { id: 3, title: "Project Three", category: "Digital experience", summary: "A polished project preview designed to link to or embed a shared Canva presentation.", canva_url: null, thumbnail_url: null },
  { id: 4, title: "Project Four", category: "Creative exploration", summary: "A final showcase slot for an experiment, passion project, or collaborative piece.", canva_url: null, thumbnail_url: null },
];

function presentationEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    const isCanvaView = (url.hostname === "canva.com" || url.hostname === "www.canva.com") && url.pathname.endsWith("/view");

    return isCanvaView ? `${url.origin}${url.pathname}?embed` : value;
  } catch {
    return value;
  }
}

export function ProjectViewer() {
  const [projects, setProjects] = useState(fallbackProjects);
  const [active, setActive] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const project = projects[active] ?? projects[0];
  const previousIndex = (active - 1 + projects.length) % projects.length;
  const nextIndex = (active + 1) % projects.length;
  const previous = projects[previousIndex];
  const next = projects[nextIndex];
  const embedUrl = project.canva_url ? presentationEmbedUrl(project.canva_url) : null;

  useEffect(() => {
    if (!supabase) return;
    void supabase.from("projects").select("id, title, category, summary, canva_url, thumbnail_url").eq("is_published", true).order("sort_order").then(({ data }) => {
      if (data?.length) { setProjects(data); setActive(0); }
    });
  }, []);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setIsLightboxOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isLightboxOpen]);

  function handleKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") { event.preventDefault(); setActive(previousIndex); }
    if (event.key === "ArrowRight") { event.preventDefault(); setActive(nextIndex); }
  }

  return (
    <div className="project-carousel" tabIndex={0} onKeyDown={handleKeys} aria-label="Project presentation carousel. Use the left and right arrow keys to navigate.">
      <button className="side-preview is-left" type="button" onClick={() => setActive(previousIndex)} aria-label={`Show previous project: ${previous.title}`}>
        {previous.thumbnail_url ? <img src={previous.thumbnail_url} alt="" /> : <span className="side-placeholder">Preview</span>}
        <span className="side-copy"><small>{previous.category}</small><strong>{previous.title}</strong></span>
        <span className="carousel-arrow" aria-hidden="true">‹</span>
      </button>

      <article className="viewer-panel" aria-live="polite">
        <div className="viewer-topline"><span>{String(active + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span><span>{project.category}</span></div>
        {embedUrl ? <iframe key={project.id} className="presentation-frame" src={embedUrl} title={`${project.title} presentation`} loading="lazy" allow="fullscreen" allowFullScreen /> : <div className="viewer-empty"><p className="eyebrow">Featured project</p><h3>{project.title}</h3><p>{project.summary}</p></div>}
        <div className="viewer-footer"><div><strong>{project.title}</strong><span>{project.canva_url ? "Embedded presentation" : "Presentation coming soon"}</span></div>{embedUrl && <button className="lightbox-open" type="button" onClick={() => setIsLightboxOpen(true)} aria-label={`View ${project.title} fullscreen`}><span aria-hidden="true">⛶</span><small>Fullscreen</small></button>}</div>
      </article>

      <button className="side-preview is-right" type="button" onClick={() => setActive(nextIndex)} aria-label={`Show next project: ${next.title}`}>
        {next.thumbnail_url ? <img src={next.thumbnail_url} alt="" /> : <span className="side-placeholder">Preview</span>}
        <span className="side-copy"><small>{next.category}</small><strong>{next.title}</strong></span>
        <span className="carousel-arrow" aria-hidden="true">›</span>
      </button>

      <div className="carousel-dots" aria-label="Choose a project">
        {projects.map((item, index) => <button key={item.id} className={index === active ? "is-active" : ""} type="button" onClick={() => setActive(index)} aria-label={`Show ${item.title}`} aria-current={index === active ? "true" : undefined} />)}
      </div>

      {isLightboxOpen && embedUrl && <div className="presentation-lightbox" role="dialog" aria-modal="true" aria-label={`${project.title} fullscreen presentation`} onMouseDown={(event) => { if (event.target === event.currentTarget) setIsLightboxOpen(false); }}>
        <div className="lightbox-shell">
          <div className="lightbox-header"><div><small>{project.category}</small><strong>{project.title}</strong></div><button type="button" autoFocus onClick={() => setIsLightboxOpen(false)} aria-label="Close fullscreen presentation"><span aria-hidden="true">×</span><small>Close</small></button></div>
          <iframe className="lightbox-frame" src={embedUrl} title={`${project.title} fullscreen presentation`} allow="fullscreen" allowFullScreen />
        </div>
      </div>}
    </div>
  );
}
