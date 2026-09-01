"use client";

import { useEffect, useState } from "react";
import { DEFAULT_RESUME_CONTENT, normalizeResumeContent, type ResumeContent as ResumeContentType } from "@/lib/resume-content";
import { publicRestGet } from "@/lib/supabase/public-client";

function BulletList({ items }: { items: string[] }) {
  return <ul className="resume-bullets">{items.filter(Boolean).map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>;
}

export function ResumeContent() {
  const [content, setContent] = useState<ResumeContentType>(DEFAULT_RESUME_CONTENT);

  useEffect(() => {
    void publicRestGet<{ content: unknown }[]>("resume_content?select=content&id=eq.1&limit=1").then((rows) => {
      if (rows?.[0]?.content) setContent(normalizeResumeContent(rows[0].content));
    });
  }, []);

  return (
    <div className="section-shell resume-shell">
      <header className="resume-intro">
        <div><p className="eyebrow">{content.eyebrow}</p><h1>{content.title}</h1></div>
        <p>{content.summary}</p>
      </header>

      <div className="resume-layout">
        <div className="resume-main">
          <section className="resume-section">
            <div className="resume-section-heading"><h2>{content.sectionTitles.experience}</h2></div>
            {content.experience.map((entry, index) => <article className="resume-entry" key={`${index}-${entry.title}`}><div className="resume-entry-heading"><div><h3>{entry.title}</h3><p>{entry.organization}</p></div><time>{entry.date}</time></div><BulletList items={entry.bullets} /></article>)}
          </section>

          <section className="resume-section">
            <div className="resume-section-heading"><h2>{content.sectionTitles.leadership}</h2></div>
            {content.leadership.map((entry, index) => <article className="resume-entry" key={`${index}-${entry.title}`}><div className="resume-entry-heading"><div><h3>{entry.title}</h3><p>{entry.organization}</p></div>{entry.date && <time>{entry.date}</time>}</div><BulletList items={entry.bullets} /></article>)}
          </section>

          <section className="resume-section">
            <div className="resume-section-heading"><h2>{content.sectionTitles.projects}</h2></div>
            {content.projects.map((project, index) => <article className="resume-entry project-resume-entry" key={`${index}-${project.title}`}><div className="resume-entry-heading"><h3>{project.title}</h3><time>{project.date}</time></div><p>{project.description}</p></article>)}
          </section>
        </div>

        <aside className="resume-sidebar">
          <section><p className="eyebrow">Education</p><h2>{content.education.degree}</h2><p className="resume-school">{content.education.school}</p><dl className="resume-facts"><div><dt>Expected graduation</dt><dd>{content.education.graduation}</dd></div><div><dt>GPA</dt><dd>{content.education.gpa}</dd></div></dl></section>
          <section><p className="eyebrow">Technical skills</p><ul className="resume-skill-groups"><li><span>Programming</span>{content.skills.programming}</li><li><span>Engineering tools</span>{content.skills.tools}</li><li><span>Hardware</span>{content.skills.hardware}</li></ul></section>
          <section><p className="eyebrow">Contact</p><div className="resume-contact"><a href={`tel:${content.contact.phoneLink}`}><span>Telephone</span>{content.contact.phoneDisplay}</a><a href={`mailto:${content.contact.email}`}><span>Email</span>{content.contact.email}</a></div></section>
        </aside>
      </div>
    </div>
  );
}
