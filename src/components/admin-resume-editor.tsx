"use client";

import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { DEFAULT_RESUME_CONTENT, normalizeResumeContent, type ResumeContent, type ResumeExperience, type ResumeProject } from "@/lib/resume-content";
import { supabase } from "@/lib/supabase/client";

type Props = {
  user: User;
  onStatus: (message: string) => void;
};

const toLines = (items: string[]) => items.join("\n");
const fromLines = (value: string) => value.split("\n");

export function AdminResumeEditor({ user, onStatus }: Props) {
  const [content, setContent] = useState<ResumeContent>(DEFAULT_RESUME_CONTENT);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    void supabase.from("resume_content").select("content").eq("id", 1).maybeSingle().then(({ data, error }) => {
      if (data?.content) setContent(normalizeResumeContent(data.content));
      if (error) onStatus("Run the editable résumé migration before using this workspace.");
    });
  }, [onStatus]);

  function updateExperience(index: number, values: Partial<ResumeExperience>) {
    setContent((current) => ({ ...current, experience: current.experience.map((entry, entryIndex) => entryIndex === index ? { ...entry, ...values } : entry) }));
  }

  function updateProject(index: number, values: Partial<ResumeProject>) {
    setContent((current) => ({ ...current, projects: current.projects.map((project, projectIndex) => projectIndex === index ? { ...project, ...values } : project) }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); onStatus("");
    const { error } = await supabase.from("resume_content").update({ content, updated_at: new Date().toISOString(), updated_by: user.id }).eq("id", 1).select("id").single();
    onStatus(error ? error.message : "Résumé copy saved.");
    setBusy(false);
  }

  return (
    <form className="admin-panel admin-form" onSubmit={save}>
      <div className="panel-heading"><div><p className="eyebrow">Public résumé</p><h2>Résumé copy</h2></div><a className="text-button" href="/resume" target="_blank" rel="noreferrer">Preview résumé ↗</a></div>
      <p className="panel-note">Edit the language shown on Lauren&apos;s résumé page. Enter one bullet per line in bullet-list fields.</p>

      <div className="field-section"><h3>Introduction</h3><label>Eyebrow<input value={content.eyebrow} onChange={(event) => setContent({ ...content, eyebrow: event.target.value })} required /></label><label>Headline<input value={content.title} onChange={(event) => setContent({ ...content, title: event.target.value })} required /></label><label>Professional summary<textarea rows={6} value={content.summary} onChange={(event) => setContent({ ...content, summary: event.target.value })} required /></label></div>

      <div className="field-section"><h3>Experience</h3><label>Public section title<input value={content.sectionTitles.experience} onChange={(event) => setContent({ ...content, sectionTitles: { ...content.sectionTitles, experience: event.target.value } })} required /></label>{content.experience.map((entry, index) => <fieldset className="resume-admin-entry" key={index}><legend>Role {index + 1}</legend><div className="field-pair"><label>Role title<input value={entry.title} onChange={(event) => updateExperience(index, { title: event.target.value })} required /></label><label>Organization<input value={entry.organization} onChange={(event) => updateExperience(index, { organization: event.target.value })} required /></label></div><label>Date range<input value={entry.date} onChange={(event) => updateExperience(index, { date: event.target.value })} required /></label><label>Bullet points<textarea rows={5} value={toLines(entry.bullets)} onChange={(event) => updateExperience(index, { bullets: fromLines(event.target.value) })} required /></label></fieldset>)}</div>

      <div className="field-section"><h3>Leadership</h3><label>Public section title<input value={content.sectionTitles.leadership} onChange={(event) => setContent({ ...content, sectionTitles: { ...content.sectionTitles, leadership: event.target.value } })} required /></label><div className="field-pair"><label>Position<input value={content.leadership.title} onChange={(event) => setContent({ ...content, leadership: { ...content.leadership, title: event.target.value } })} required /></label><label>Organization<input value={content.leadership.organization} onChange={(event) => setContent({ ...content, leadership: { ...content.leadership, organization: event.target.value } })} required /></label></div><label>Bullet points<textarea rows={5} value={toLines(content.leadership.bullets)} onChange={(event) => setContent({ ...content, leadership: { ...content.leadership, bullets: fromLines(event.target.value) } })} required /></label></div>

      <div className="field-section"><h3>Academic projects</h3><label>Public section title<input value={content.sectionTitles.projects} onChange={(event) => setContent({ ...content, sectionTitles: { ...content.sectionTitles, projects: event.target.value } })} required /></label>{content.projects.map((project, index) => <fieldset className="resume-admin-entry" key={index}><legend>Project {index + 1}</legend><div className="field-pair"><label>Project title<input value={project.title} onChange={(event) => updateProject(index, { title: event.target.value })} required /></label><label>Date<input value={project.date} onChange={(event) => updateProject(index, { date: event.target.value })} required /></label></div><label>Description<textarea rows={5} value={project.description} onChange={(event) => updateProject(index, { description: event.target.value })} required /></label></fieldset>)}</div>

      <div className="field-section"><h3>Education</h3><label>Degree<input value={content.education.degree} onChange={(event) => setContent({ ...content, education: { ...content.education, degree: event.target.value } })} required /></label><label>School<input value={content.education.school} onChange={(event) => setContent({ ...content, education: { ...content.education, school: event.target.value } })} required /></label><div className="field-pair"><label>Expected graduation<input value={content.education.graduation} onChange={(event) => setContent({ ...content, education: { ...content.education, graduation: event.target.value } })} required /></label><label>GPA<input value={content.education.gpa} onChange={(event) => setContent({ ...content, education: { ...content.education, gpa: event.target.value } })} required /></label></div></div>

      <div className="field-section"><h3>Technical skills</h3><label>Programming<input value={content.skills.programming} onChange={(event) => setContent({ ...content, skills: { ...content.skills, programming: event.target.value } })} required /></label><label>Engineering tools<input value={content.skills.tools} onChange={(event) => setContent({ ...content, skills: { ...content.skills, tools: event.target.value } })} required /></label><label>Hardware<input value={content.skills.hardware} onChange={(event) => setContent({ ...content, skills: { ...content.skills, hardware: event.target.value } })} required /></label></div>

      <div className="field-section"><h3>Contact information</h3><div className="field-pair"><label>Displayed phone<input value={content.contact.phoneDisplay} onChange={(event) => setContent({ ...content, contact: { ...content.contact, phoneDisplay: event.target.value } })} required /></label><label>Phone link<input value={content.contact.phoneLink} onChange={(event) => setContent({ ...content, contact: { ...content.contact, phoneLink: event.target.value } })} placeholder="+19155551212" required /></label></div><label>Email<input type="email" value={content.contact.email} onChange={(event) => setContent({ ...content, contact: { ...content.contact, email: event.target.value } })} required /></label></div>

      <button className="button button-primary" disabled={busy} type="submit">{busy ? "Saving…" : "Save résumé copy"}</button>
    </form>
  );
}
