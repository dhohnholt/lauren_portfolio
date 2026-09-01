"use client";

import { useState } from "react";

const projects = [
  { id: "01", title: "Project One", type: "Brand & visual story", description: "A featured case study ready for Lauren's first project, process notes, and final presentation." },
  { id: "02", title: "Project Two", type: "Research & strategy", description: "A flexible space for the problem, Lauren's approach, and the decisions behind the finished work." },
  { id: "03", title: "Project Three", type: "Digital experience", description: "A polished project preview designed to link to or embed a shared Canva presentation." },
  { id: "04", title: "Project Four", type: "Creative exploration", description: "A final showcase slot for an experiment, passion project, or collaborative piece." },
];

export function ProjectViewer() {
  const [active, setActive] = useState(0);
  const project = projects[active];
  return (
    <div className="project-stage">
      <div className="project-list" aria-label="Choose a project">
        {projects.map((item, index) => (
          <button className={`project-preview ${active === index ? "is-active" : ""}`} key={item.id} onClick={() => setActive(index)} type="button" aria-pressed={active === index}>
            <span>{item.id}</span><strong>{item.title}</strong><small>{item.type}</small>
          </button>
        ))}
      </div>
      <article className="viewer-panel" aria-live="polite">
        <div className="viewer-topline"><span>{project.id} / 04</span><span>Featured project</span></div>
        <div><p className="eyebrow">{project.type}</p><h3>{project.title}</h3><p>{project.description}</p></div>
        <div className="viewer-footer"><span>Canva presentation embed coming soon</span><span className="arrow" aria-hidden="true">↗</span></div>
      </article>
    </div>
  );
}
