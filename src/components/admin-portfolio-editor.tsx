"use client";

/* eslint-disable @next/next/no-img-element */
import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { DEFAULT_HEADSHOT_URL } from "@/components/headshot";
import { applyTheme, COLOR_FIELDS, DEFAULT_PORTFOLIO_SETTINGS, type PortfolioSettings } from "@/lib/portfolio-settings";
import { supabase } from "@/lib/supabase/client";

type Section = "content" | "brand" | "projects";
type AdminProject = { id: number; title: string; category: string; summary: string; canva_url: string | null; thumbnail_url: string | null; sort_order: number };

const colorLabels: Record<(typeof COLOR_FIELDS)[number], string> = {
  color_olive: "Olive accent", color_berry: "Berry accent", color_sand: "Warm sand", color_ink: "Deep ink", color_mist: "Soft mist", color_paper: "Paper",
};

function validHttpsUrl(value: string) {
  if (!value.trim()) return true;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

export function AdminPortfolioEditor() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [section, setSection] = useState<Section>("content");
  const [settings, setSettings] = useState<PortfolioSettings>(DEFAULT_PORTFOLIO_SETTINGS);
  const [headshotUrl, setHeadshotUrl] = useState(DEFAULT_HEADSHOT_URL);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [message, setMessage] = useState(supabase ? "Checking your session…" : "Supabase environment variables are not configured.");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => { setUser(data.user ?? null); setMessage(data.user ? "" : "Sign in with Lauren's admin account."); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !supabase) return;
    void Promise.all([
      supabase.from("portfolio_settings").select("*").eq("id", 1).single(),
      supabase.from("site_settings").select("value").eq("key", "headshot_url").single(),
      supabase.from("projects").select("id, title, category, summary, canva_url, thumbnail_url, sort_order").order("sort_order"),
    ]).then(([contentResult, headshotResult, projectResult]) => {
      const firstError = contentResult.error || headshotResult.error || projectResult.error;
      if (contentResult.data) setSettings(contentResult.data as PortfolioSettings);
      if (headshotResult.data?.value) setHeadshotUrl(headshotResult.data.value);
      if (projectResult.data) setProjects(projectResult.data);
      setMessage(firstError ? firstError.message : "");
    });
  }, [user]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMessage(error ? error.message : "Signed in."); setBusy(false);
  }

  async function saveContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !user) return;
    setBusy(true); setMessage("");
    const { error } = await supabase.from("portfolio_settings").update({ ...settings, updated_at: new Date().toISOString(), updated_by: user.id }).eq("id", 1).select("id").single();
    setMessage(error ? error.message : "Homepage copy saved."); setBusy(false);
  }

  async function saveBrand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !user) return;
    if (!validHttpsUrl(headshotUrl)) { setMessage("Enter a complete HTTPS headshot URL."); return; }
    setBusy(true); setMessage("");
    const colorValues = Object.fromEntries(COLOR_FIELDS.map((field) => [field, settings[field]]));
    const [themeResult, headshotResult] = await Promise.all([
      supabase.from("portfolio_settings").update({ ...colorValues, updated_at: new Date().toISOString(), updated_by: user.id }).eq("id", 1).select("id").single(),
      supabase.from("site_settings").update({ value: headshotUrl, updated_at: new Date().toISOString(), updated_by: user.id }).eq("key", "headshot_url").select("key").single(),
    ]);
    const error = themeResult.error || headshotResult.error;
    setMessage(error ? error.message : "Brand colors and headshot saved."); setBusy(false);
  }

  async function saveProjects(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !user) return;
    for (const project of projects) {
      if (!validHttpsUrl(project.canva_url ?? "") || !validHttpsUrl(project.thumbnail_url ?? "")) { setMessage(`${project.title} has an incomplete or non-HTTPS URL.`); return; }
    }
    setBusy(true); setMessage("");
    for (const project of projects) {
      const { error } = await supabase.from("projects").update({ title: project.title, category: project.category, summary: project.summary, canva_url: project.canva_url?.trim() || null, thumbnail_url: project.thumbnail_url?.trim() || null, updated_at: new Date().toISOString() }).eq("id", project.id).select("id").single();
      if (error) { setMessage(error.message); setBusy(false); return; }
    }
    setMessage("Projects, presentations, and preview images saved."); setBusy(false);
  }

  function updateSetting<K extends keyof PortfolioSettings>(field: K, value: PortfolioSettings[K]) { setSettings((current) => ({ ...current, [field]: value })); }
  function updateProject(index: number, values: Partial<AdminProject>) { setProjects((current) => current.map((project, itemIndex) => itemIndex === index ? { ...project, ...values } : project)); }

  if (!user) return <form className="admin-card admin-form admin-login" onSubmit={signIn}><p className="eyebrow">Secure access</p><h2>Admin sign in</h2><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label><button className="button button-primary" disabled={busy} type="submit">{busy ? "Signing in…" : "Sign in"}</button><p className="form-message" role="status">{message}</p></form>;

  return (
    <div className="admin-studio">
      <div className="admin-toolbar"><div><p className="eyebrow">Signed in as</p><strong>{user.email}</strong></div><div className="admin-toolbar-actions"><a className="text-button" href="/" target="_blank" rel="noreferrer">View site ↗</a><button className="text-button" type="button" onClick={() => supabase?.auth.signOut()}>Sign out</button></div></div>
      <div className="admin-tabs" role="tablist" aria-label="Portfolio settings">
        {(["content", "brand", "projects"] as Section[]).map((item) => <button key={item} type="button" role="tab" aria-selected={section === item} className={section === item ? "is-active" : ""} onClick={() => { setSection(item); setMessage(""); }}>{item === "content" ? "Homepage copy" : item === "brand" ? "Brand & images" : "Projects"}</button>)}
      </div>

      {section === "content" && <form className="admin-panel admin-form" onSubmit={saveContent}><div className="panel-heading"><div><p className="eyebrow">Homepage</p><h2>Copy & calls to action</h2></div><span>Changes appear after save</span></div><div className="field-section"><h3>Introduction</h3><label>Eyebrow<input value={settings.hero_eyebrow} onChange={(e) => updateSetting("hero_eyebrow", e.target.value)} required /></label><label>Main headline<input value={settings.hero_title} onChange={(e) => updateSetting("hero_title", e.target.value)} required /></label><label>About copy<textarea rows={5} value={settings.hero_body} onChange={(e) => updateSetting("hero_body", e.target.value)} required /></label><div className="field-pair"><label>Primary button<input value={settings.primary_cta_label} onChange={(e) => updateSetting("primary_cta_label", e.target.value)} required /></label><label>Secondary button<input value={settings.secondary_cta_label} onChange={(e) => updateSetting("secondary_cta_label", e.target.value)} required /></label></div></div><div className="field-section"><h3>Projects section</h3><label>Eyebrow<input value={settings.projects_eyebrow} onChange={(e) => updateSetting("projects_eyebrow", e.target.value)} required /></label><label>Section headline<textarea rows={2} value={settings.projects_title} onChange={(e) => updateSetting("projects_title", e.target.value)} required /></label></div><div className="field-section"><h3>Experience section</h3><label>Eyebrow<input value={settings.experience_eyebrow} onChange={(e) => updateSetting("experience_eyebrow", e.target.value)} required /></label><label>Section headline<input value={settings.experience_title} onChange={(e) => updateSetting("experience_title", e.target.value)} required /></label><label>Experience copy<textarea rows={5} value={settings.experience_body} onChange={(e) => updateSetting("experience_body", e.target.value)} required /></label><div className="field-pair"><label>Résumé link label<input value={settings.experience_link_label} onChange={(e) => updateSetting("experience_link_label", e.target.value)} required /></label><label>Footer tagline<input value={settings.footer_tagline} onChange={(e) => updateSetting("footer_tagline", e.target.value)} required /></label></div></div><button className="button button-primary" disabled={busy} type="submit">{busy ? "Saving…" : "Save homepage copy"}</button></form>}

      {section === "brand" && <form className="admin-panel admin-form" onSubmit={saveBrand}><div className="panel-heading"><div><p className="eyebrow">Visual identity</p><h2>Colors & headshot</h2></div><button className="text-button" type="button" onClick={() => { setSettings((current) => ({ ...current, ...Object.fromEntries(COLOR_FIELDS.map((field) => [field, DEFAULT_PORTFOLIO_SETTINGS[field]])) })); applyTheme(DEFAULT_PORTFOLIO_SETTINGS); }}>Reset preview</button></div><p className="panel-note">Color changes preview live on this page. Save when the combination feels right.</p><div className="color-grid">{COLOR_FIELDS.map((field) => <label className="color-field" key={field}><span><input type="color" value={settings[field]} onChange={(e) => { const next = { ...settings, [field]: e.target.value }; setSettings(next); applyTheme(next); }} /><strong>{colorLabels[field]}</strong></span><input className="hex-input" value={settings[field]} pattern="#[0-9A-Fa-f]{6}" onChange={(e) => { const value = e.target.value; updateSetting(field, value); if (/^#[0-9A-Fa-f]{6}$/.test(value)) applyTheme({ ...settings, [field]: value }); }} required /></label>)}</div><div className="field-section"><h3>Profile image</h3><div className="image-url-layout"><div className="admin-headshot-preview"><img src={headshotUrl || DEFAULT_HEADSHOT_URL} alt="Headshot preview" /></div><label>Headshot URL<input type="url" value={headshotUrl} onChange={(e) => setHeadshotUrl(e.target.value)} required /></label></div></div><button className="button button-primary" disabled={busy} type="submit">{busy ? "Saving…" : "Save brand settings"}</button></form>}

      {section === "projects" && <form className="admin-panel admin-form" onSubmit={saveProjects}><div className="panel-heading"><div><p className="eyebrow">Portfolio work</p><h2>Projects & media</h2></div><span>{projects.length} projects</span></div><p className="panel-note">Use Canva&apos;s embed-compatible URL for the presentation viewer and a direct HTTPS image URL for each preview pane.</p><div className="project-editor-list">{projects.map((project, index) => <fieldset className="project-editor" key={project.id}><legend><span>{String(index + 1).padStart(2, "0")}</span>{project.title || `Project ${index + 1}`}</legend><div className="project-editor-grid"><div className="project-copy-fields"><label>Project title<input value={project.title} onChange={(e) => updateProject(index, { title: e.target.value })} required /></label><label>Category<input value={project.category} onChange={(e) => updateProject(index, { category: e.target.value })} required /></label><label>Summary<textarea rows={4} value={project.summary} onChange={(e) => updateProject(index, { summary: e.target.value })} required /></label><label>Presentation URL<input type="url" value={project.canva_url ?? ""} onChange={(e) => updateProject(index, { canva_url: e.target.value })} placeholder="https://www.canva.com/design/.../view?embed" /></label><label>Preview image URL<input type="url" value={project.thumbnail_url ?? ""} onChange={(e) => updateProject(index, { thumbnail_url: e.target.value })} placeholder="https://images.example.com/project.jpg" /></label></div><div className="project-image-preview">{project.thumbnail_url ? <img src={project.thumbnail_url} alt={`${project.title} preview`} /> : <span>Preview image</span>}</div></div></fieldset>)}</div><button className="button button-primary" disabled={busy || projects.length === 0} type="submit">{busy ? "Saving…" : "Save all projects"}</button></form>}

      <div className="admin-status" role="status"><span className={message ? "status-dot is-active" : "status-dot"} />{message || "All changes saved locally in this view."}</div>
    </div>
  );
}
