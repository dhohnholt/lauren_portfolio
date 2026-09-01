import type { Metadata } from "next";

export const metadata: Metadata = { title: "Résumé", description: "Education and experience for Lauren Hohnholt." };

export default function ResumePage() {
  return <main className="inner-page resume-page"><div className="section-shell narrow-shell"><div className="page-intro"><p className="eyebrow">Résumé</p><h1>Experience, education, and skills.</h1><p>This page is ready for Lauren&apos;s résumé details or an embedded PDF.</p></div><div className="resume-grid"><section><h2>Experience</h2><div className="resume-item"><span>Role / Organization</span><small>Dates</small><p>Add a concise description of responsibilities, impact, and what Lauren learned.</p></div></section><aside><h2>Skills</h2><ul className="skill-list"><li>Creative direction</li><li>Visual communication</li><li>Research</li><li>Presentation design</li></ul><h2>Education</h2><p>School · Program<br /><span className="muted">Graduation year</span></p></aside></div></div></main>;
}
