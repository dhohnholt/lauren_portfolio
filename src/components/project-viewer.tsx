"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Project = {
  id: number;
  title: string;
  category: string;
  summary: string;
  canva_url: string | null;
  thumbnail_url: string | null;
};

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

  useEffect(() => {
    if (!supabase) return;
    void supabase
      .from("projects")
      .select("id, title, category, summary, canva_url, thumbnail_url")
      .eq("is_published", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data?.length) {
          setProjects(data);
          setActive(0);
        }
      });
  }, []);

  return (
    <div className="project-stage">
      <div className="project-list" aria-label="Choose a project">
        {projects.map((item, index) => (
          <button className={`project-preview ${active === index ? "is-active" : ""}`} key={item.id} onClick={() => setActive(index)} type="button" aria-pressed={active === index}>
            <div className="preview-image">
              {item.thumbnail_url ? <img src={item.thumbnail_url} alt={`Preview of ${item.title}`} /> : <em>Preview image</em>}
            </div>
            <span>{String(index + 1).padStart(2, "0")}</span><strong>{item.title}</strong><small>{item.category}</small>
          </button>
        ))}
      </div>
      <article className="viewer-panel" aria-live="polite">
        <div className="viewer-topline"><span>{String(active + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span><span>Featured project</span></div>
        {project.canva_url ? (
          <iframe className="presentation-frame" src={project.canva_url} title={`${project.title} presentation`} loading="lazy" allow="fullscreen" allowFullScreen />
        ) : (
          <div><p className="eyebrow">{project.category}</p><h3>{project.title}</h3><p>{project.summary}</p></div>
        )}
        <div className="viewer-footer"><span>{project.canva_url ? "Embedded presentation" : "Presentation URL coming soon"}</span>{project.canva_url ? <a href={project.canva_url} target="_blank" rel="noreferrer" aria-label={`Open ${project.title} presentation in a new tab`}><span className="arrow" aria-hidden="true">↗</span></a> : <span className="arrow" aria-hidden="true">↗</span>}</div>
      </article>
    </div>
  );
}
