"use client";

/* eslint-disable @next/next/no-img-element */
import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AdminResumeEditor } from "@/components/admin-resume-editor";
import { DEFAULT_HEADSHOT_URL } from "@/components/headshot";
import { applyTheme, COLOR_FIELDS, DEFAULT_PORTFOLIO_SETTINGS, type PortfolioSettings } from "@/lib/portfolio-settings";
import { supabase } from "@/lib/supabase/client";

type Section = "content" | "resume" | "brand" | "projects" | "messages";
type AdminProject = { id: number; title: string; category: string; summary: string; canva_url: string | null; thumbnail_url: string | null; sort_order: number };
type ContactMessage = { id: number; name: string; email: string; message: string; created_at: string };

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
  const [headshotZoom, setHeadshotZoom] = useState(100);
  const [headshotShiftX, setHeadshotShiftX] = useState(0);
  const [headshotShiftY, setHeadshotShiftY] = useState(0);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
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
      supabase.from("site_settings").select("key, value").in("key", ["headshot_url", "headshot_zoom", "headshot_shift_x", "headshot_shift_y"]),
      supabase.from("projects").select("id, title, category, summary, canva_url, thumbnail_url, sort_order").order("sort_order"),
      supabase.from("contact_messages").select("id, name, email, message, created_at").order("created_at", { ascending: false }),
    ]).then(([contentResult, headshotResult, projectResult, messageResult]) => {
      const firstError = contentResult.error || headshotResult.error || projectResult.error || messageResult.error;
      if (contentResult.data) setSettings(contentResult.data as PortfolioSettings);
      for (const setting of headshotResult.data ?? []) {
        if (setting.key === "headshot_url" && setting.value) setHeadshotUrl(setting.value);
        if (setting.key === "headshot_zoom") setHeadshotZoom(Math.min(200, Math.max(100, Number(setting.value) || 100)));
        if (setting.key === "headshot_shift_x") setHeadshotShiftX(Math.min(30, Math.max(-30, Number(setting.value) || 0)));
        if (setting.key === "headshot_shift_y") setHeadshotShiftY(Math.min(30, Math.max(-30, Number(setting.value) || 0)));
      }
      if (projectResult.data) setProjects(projectResult.data);
      if (messageResult.data) setContactMessages(messageResult.data);
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

  async function sendPasswordReset() {
    if (!supabase) return;
    if (!email.trim()) { setMessage("Enter Lauren's email address first."); return; }
    setBusy(true); setMessage("");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/admin/reset-password` });
    setMessage(error ? error.message : "If that account exists, a password-reset email is on its way.");
    setBusy(false);
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
    const updatedAt = new Date().toISOString();
    const [themeResult, ...headshotResults] = await Promise.all([
      supabase.from("portfolio_settings").update({ ...colorValues, updated_at: new Date().toISOString(), updated_by: user.id }).eq("id", 1).select("id").single(),
      supabase.from("site_settings").update({ value: headshotUrl, updated_at: updatedAt, updated_by: user.id }).eq("key", "headshot_url").select("key"),
      supabase.from("site_settings").update({ value: String(headshotZoom), updated_at: updatedAt, updated_by: user.id }).eq("key", "headshot_zoom").select("key"),
      supabase.from("site_settings").update({ value: String(headshotShiftX), updated_at: updatedAt, updated_by: user.id }).eq("key", "headshot_shift_x").select("key"),
      supabase.from("site_settings").update({ value: String(headshotShiftY), updated_at: updatedAt, updated_by: user.id }).eq("key", "headshot_shift_y").select("key"),
    ]);
    const error = themeResult.error || headshotResults.find((result) => result.error)?.error;
    const allHeadshotSettingsSaved = headshotResults.every((result) => result.data?.length === 1);
    setMessage(error ? error.message : allHeadshotSettingsSaved ? "Brand colors and headshot saved." : "The image settings could not all be saved. Run the latest Supabase migration and try again."); setBusy(false);
  }

  async function saveProjects(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !user) return;
    for (const project of projects) {
      if (!validHttpsUrl(project.canva_url ?? "") || !validHttpsUrl(project.thumbnail_url ?? "")) { setMessage(`${project.title} has an incomplete or non-HTTPS URL.`); return; }
    }
    setBusy(true); setMessage("");
    const savedProjects = [...projects];
    for (const [index, project] of projects.entries()) {
      const values = { title: project.title, category: project.category, summary: project.summary, canva_url: project.canva_url?.trim() || null, thumbnail_url: project.thumbnail_url?.trim() || null, updated_at: new Date().toISOString() };
      const result = project.id < 0
        ? await supabase.from("projects").insert({ ...values, sort_order: project.sort_order, is_published: true }).select("id, title, category, summary, canva_url, thumbnail_url, sort_order").single()
        : await supabase.from("projects").update(values).eq("id", project.id).select("id, title, category, summary, canva_url, thumbnail_url, sort_order").single();
      const { data, error } = result;
      if (error) { setMessage(error.message); setBusy(false); return; }
      if (data) savedProjects[index] = data;
    }
    setProjects(savedProjects);
    setMessage("Projects, presentations, and preview images saved."); setBusy(false);
  }

  function updateSetting<K extends keyof PortfolioSettings>(field: K, value: PortfolioSettings[K]) { setSettings((current) => ({ ...current, [field]: value })); }
  function updateProject(index: number, values: Partial<AdminProject>) { setProjects((current) => current.map((project, itemIndex) => itemIndex === index ? { ...project, ...values } : project)); }
  function addProject() {
    const nextSortOrder = Math.max(0, ...projects.map((project) => project.sort_order)) + 1;
    setProjects((current) => [...current, { id: -Date.now(), title: "", category: "", summary: "", canva_url: null, thumbnail_url: null, sort_order: nextSortOrder }]);
  }
  function removeProjectDraft(id: number) { setProjects((current) => current.filter((project) => project.id !== id)); }

  if (!user) return <form className="admin-card admin-form admin-login" onSubmit={signIn}><p className="eyebrow">Secure access</p><h2>Admin sign in</h2><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label><div className="login-actions"><button className="button button-primary" disabled={busy} type="submit">{busy ? "Please wait…" : "Sign in"}</button><button className="text-button" disabled={busy} type="button" onClick={sendPasswordReset}>Forgot password?</button></div><p className="form-message" role="status">{message}</p></form>;

  return (
    <div className="admin-studio">
      <div className="admin-toolbar"><div><p className="eyebrow">Signed in as</p><strong>{user.email}</strong></div><div className="admin-toolbar-actions"><a className="text-button" href="/" target="_blank" rel="noreferrer">View site ↗</a><button className="text-button" type="button" onClick={() => supabase?.auth.signOut()}>Sign out</button></div></div>
      <div className="admin-tabs" role="tablist" aria-label="Portfolio settings">
        {(["content", "resume", "brand", "projects", "messages"] as Section[]).map((item) => <button key={item} type="button" role="tab" aria-selected={section === item} className={section === item ? "is-active" : ""} onClick={() => { setSection(item); setMessage(""); }}>{item === "content" ? "Homepage copy" : item === "resume" ? "Résumé" : item === "brand" ? "Brand & images" : item === "projects" ? "Projects" : `Messages (${contactMessages.length})`}</button>)}
      </div>

      {section === "content" && <form className="admin-panel admin-form" onSubmit={saveContent}><div className="panel-heading"><div><p className="eyebrow">Homepage</p><h2>Copy & calls to action</h2></div><span>Changes appear after save</span></div><div className="field-section"><h3>Introduction</h3><label>Eyebrow<input value={settings.hero_eyebrow} onChange={(e) => updateSetting("hero_eyebrow", e.target.value)} required /></label><label>Main headline<input value={settings.hero_title} onChange={(e) => updateSetting("hero_title", e.target.value)} required /></label><label>About copy<textarea rows={5} value={settings.hero_body} onChange={(e) => updateSetting("hero_body", e.target.value)} required /></label><div className="field-pair"><label>Primary button<input value={settings.primary_cta_label} onChange={(e) => updateSetting("primary_cta_label", e.target.value)} required /></label><label>Secondary button<input value={settings.secondary_cta_label} onChange={(e) => updateSetting("secondary_cta_label", e.target.value)} required /></label></div></div><div className="field-section"><h3>Projects section</h3><label>Eyebrow<input value={settings.projects_eyebrow} onChange={(e) => updateSetting("projects_eyebrow", e.target.value)} required /></label><label>Section headline<textarea rows={2} value={settings.projects_title} onChange={(e) => updateSetting("projects_title", e.target.value)} required /></label></div><div className="field-section"><h3>Experience section</h3><label>Eyebrow<input value={settings.experience_eyebrow} onChange={(e) => updateSetting("experience_eyebrow", e.target.value)} required /></label><label>Section headline<input value={settings.experience_title} onChange={(e) => updateSetting("experience_title", e.target.value)} required /></label><label>Experience copy<textarea rows={5} value={settings.experience_body} onChange={(e) => updateSetting("experience_body", e.target.value)} required /></label><div className="field-pair"><label>Résumé link label<input value={settings.experience_link_label} onChange={(e) => updateSetting("experience_link_label", e.target.value)} required /></label><label>Footer tagline<input value={settings.footer_tagline} onChange={(e) => updateSetting("footer_tagline", e.target.value)} required /></label></div></div><button className="button button-primary" disabled={busy} type="submit">{busy ? "Saving…" : "Save homepage copy"}</button></form>}

      {section === "resume" && <AdminResumeEditor user={user} onStatus={setMessage} />}

      {section === "brand" && <form className="admin-panel admin-form" onSubmit={saveBrand}><div className="panel-heading"><div><p className="eyebrow">Visual identity</p><h2>Colors & headshot</h2></div><button className="text-button" type="button" onClick={() => { setSettings((current) => ({ ...current, ...Object.fromEntries(COLOR_FIELDS.map((field) => [field, DEFAULT_PORTFOLIO_SETTINGS[field]])) })); applyTheme(DEFAULT_PORTFOLIO_SETTINGS); }}>Reset preview</button></div><p className="panel-note">Color and image framing changes preview live on this page. Save when the combination feels right.</p><div className="color-grid">{COLOR_FIELDS.map((field) => <label className="color-field" key={field}><span><input type="color" value={settings[field]} onChange={(e) => { const next = { ...settings, [field]: e.target.value }; setSettings(next); applyTheme(next); }} /><strong>{colorLabels[field]}</strong></span><input className="hex-input" value={settings[field]} pattern="#[0-9A-Fa-f]{6}" onChange={(e) => { const value = e.target.value; updateSetting(field, value); if (/^#[0-9A-Fa-f]{6}$/.test(value)) applyTheme({ ...settings, [field]: value }); }} required /></label>)}</div><div className="field-section"><h3>Profile image</h3><div className="image-url-layout"><div className="admin-headshot-preview"><img src={headshotUrl || DEFAULT_HEADSHOT_URL} alt="Headshot preview" style={{ transform: `translate(${headshotShiftX}%, ${headshotShiftY}%) scale(${headshotZoom / 100})` }} /></div><div className="headshot-controls"><label>Headshot URL<input type="url" value={headshotUrl} onChange={(e) => setHeadshotUrl(e.target.value)} required /></label><div className="image-range-grid"><label><span>Zoom <output>{headshotZoom}%</output></span><input type="range" min="100" max="200" step="1" value={headshotZoom} onChange={(e) => setHeadshotZoom(Number(e.target.value))} /></label><label><span>Shift left or right <output>{headshotShiftX === 0 ? "Centered" : `${Math.abs(headshotShiftX)}% ${headshotShiftX < 0 ? "left" : "right"}`}</output></span><input type="range" min="-30" max="30" step="1" value={headshotShiftX} onChange={(e) => setHeadshotShiftX(Number(e.target.value))} /></label><label><span>Shift up or down <output>{headshotShiftY === 0 ? "Centered" : `${Math.abs(headshotShiftY)}% ${headshotShiftY < 0 ? "up" : "down"}`}</output></span><input type="range" min="-30" max="30" step="1" value={headshotShiftY} onChange={(e) => setHeadshotShiftY(Number(e.target.value))} /></label></div><button className="text-button framing-reset" type="button" onClick={() => { setHeadshotZoom(100); setHeadshotShiftX(0); setHeadshotShiftY(0); }}>Reset image framing</button></div></div></div><button className="button button-primary" disabled={busy} type="submit">{busy ? "Saving…" : "Save brand settings"}</button></form>}

      {section === "projects" && <form className="admin-panel admin-form" onSubmit={saveProjects}><div className="panel-heading"><div><p className="eyebrow">Portfolio work</p><h2>Projects & media</h2></div><span>{projects.length} projects</span></div><p className="panel-note">Paste Canva&apos;s public view link; the portfolio automatically converts it to embed mode. Use a direct HTTPS image URL for each preview pane.</p><div className="project-editor-list">{projects.map((project, index) => <fieldset className="project-editor" key={project.id}><legend><span>{String(index + 1).padStart(2, "0")}</span>{project.title || `New project ${index + 1}`}</legend>{project.id < 0 && <button className="text-button project-draft-remove" type="button" onClick={() => removeProjectDraft(project.id)}>Remove draft</button>}<div className="project-editor-grid"><div className="project-copy-fields"><label>Project title<input value={project.title} onChange={(e) => updateProject(index, { title: e.target.value })} required /></label><label>Category<input value={project.category} onChange={(e) => updateProject(index, { category: e.target.value })} required /></label><label>Summary<textarea rows={4} value={project.summary} onChange={(e) => updateProject(index, { summary: e.target.value })} required /></label><label>Presentation URL<input type="url" value={project.canva_url ?? ""} onChange={(e) => updateProject(index, { canva_url: e.target.value })} placeholder="https://www.canva.com/design/.../view" /></label><label>Preview image URL<input type="url" value={project.thumbnail_url ?? ""} onChange={(e) => updateProject(index, { thumbnail_url: e.target.value })} placeholder="https://images.example.com/project.jpg" /></label></div><div className="project-image-preview">{project.thumbnail_url ? <img src={project.thumbnail_url} alt={`${project.title} preview`} /> : <span>Preview image</span>}</div></div></fieldset>)}</div><div className="admin-save-actions"><button className="button button-quiet" type="button" onClick={addProject}>+ Add project</button><button className="button button-primary" disabled={busy || projects.length === 0} type="submit">{busy ? "Saving…" : "Save all projects"}</button></div></form>}

      {section === "messages" && <section className="admin-panel"><div className="panel-heading"><div><p className="eyebrow">Private inbox</p><h2>Contact messages</h2></div><span>{contactMessages.length} received</span></div><p className="panel-note">Messages submitted through the public Contact page are visible only to Lauren&apos;s allowlisted admin account.</p>{contactMessages.length === 0 ? <div className="inbox-empty"><span>✦</span><h3>No messages yet</h3><p>New internship inquiries will appear here.</p></div> : <div className="message-list">{contactMessages.map((item) => <article className="message-card" key={item.id}><div className="message-meta"><div><strong>{item.name}</strong><a href={`mailto:${item.email}`}>{item.email}</a></div><time dateTime={item.created_at}>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.created_at))}</time></div><p>{item.message}</p><a className="button message-reply" href={`mailto:${item.email}?subject=${encodeURIComponent("Re: Your message to Lauren Hohnholt")}`}>Reply by email</a></article>)}</div>}</section>}

      <div className="admin-status" role="status"><span className={message ? "status-dot is-active" : "status-dot"} />{message || "All changes saved locally in this view."}</div>
    </div>
  );
}
