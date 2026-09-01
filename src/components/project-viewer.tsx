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

export function ProjectViewer() {
  const [projects, setProjects] = useState(fallbackProjects);
  const [active, setActive] = useState(0);
  const project = projects[active] ?? projects[0];
  const previousIndex = (active - 1 + projects.length) % projects.length;
  const nextIndex = (active + 1) % projects.length;
  const previous = projects[previousIndex];
  const next = projects[nextIndex];

  useEffect(() => {
    if (!supabase) return;
    void supabase.from("projects").select("id, title, category, summary, canva_url, thumbnail_url").eq("is_published", true).order("sort_order").then(({ data }) => {
      if (data?.length) { setProjects(data); setActive(0); }
    });
  }, []);

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
        {project.canva_url ? <iframe key={project.id} className="presentation-frame" src={project.canva_url} title={`${project.title} presentation`} loading="lazy" allow="fullscreen" allowFullScreen /> : <div className="viewer-empty"><p className="eyebrow">Featured project</p><h3>{project.title}</h3><p>{project.summary}</p></div>}
        <div className="viewer-footer"><div><strong>{project.title}</strong><span>{project.canva_url ? "Embedded presentation" : "Presentation coming soon"}</span></div>{project.canva_url && <a href={project.canva_url} target="_blank" rel="noreferrer" aria-label={`Open ${project.title} presentation in a new tab`}><span className="arrow" aria-hidden="true">↗</span></a>}</div>
      </article>

      <button className="side-preview is-right" type="button" onClick={() => setActive(nextIndex)} aria-label={`Show next project: ${next.title}`}>
        {next.thumbnail_url ? <img src={next.thumbnail_url} alt="" /> : <span className="side-placeholder">Preview</span>}
        <span className="side-copy"><small>{next.category}</small><strong>{next.title}</strong></span>
        <span className="carousel-arrow" aria-hidden="true">›</span>
      </button>

      <div className="carousel-dots" aria-label="Choose a project">
        {projects.map((item, index) => <button key={item.id} className={index === active ? "is-active" : ""} type="button" onClick={() => setActive(index)} aria-label={`Show ${item.title}`} aria-current={index === active ? "true" : undefined} />)}
      </div>
    </div>
  );
}
