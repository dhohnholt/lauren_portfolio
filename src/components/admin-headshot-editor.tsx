"use client";

/* eslint-disable @next/next/no-img-element */
import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { DEFAULT_HEADSHOT_URL } from "@/components/headshot";
import { supabase } from "@/lib/supabase/client";

type AdminProject = {
  id: number;
  title: string;
  canva_url: string | null;
  thumbnail_url: string | null;
  sort_order: number;
};

export function AdminHeadshotEditor() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState(DEFAULT_HEADSHOT_URL);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [message, setMessage] = useState(supabase ? "Checking your session…" : "Supabase environment variables are not configured.");
  const [projectMessage, setProjectMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setMessage(data.user ? "" : "Sign in with Lauren's admin account.");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !supabase) return;
    void supabase.from("site_settings").select("value").eq("key", "headshot_url").single().then(({ data, error }) => {
      if (data?.value) setUrl(data.value);
      if (error) setMessage(error.message);
    });
    void supabase.from("projects").select("id, title, canva_url, thumbnail_url, sort_order").order("sort_order").then(({ data, error }) => {
      if (data) setProjects(data);
      if (error) setProjectMessage(error.message);
    });
  }, [user]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMessage(error ? error.message : "Signed in.");
    setBusy(false);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !user) return;

    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") throw new Error();
    } catch {
      setMessage("Enter a complete HTTPS image URL.");
      return;
    }

    setBusy(true);
    setMessage("");
    const { error } = await supabase
      .from("site_settings")
      .update({ value: url, updated_at: new Date().toISOString(), updated_by: user.id })
      .eq("key", "headshot_url")
      .select("value")
      .single();
    setMessage(error ? error.message : "Headshot updated. Refresh the homepage to see it.");
    setBusy(false);
  }

  async function saveProjectUrls(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !user) return;

    for (const project of projects) {
      const urls = [
        { label: "presentation", value: project.canva_url?.trim() ?? "" },
        { label: "preview image", value: project.thumbnail_url?.trim() ?? "" },
      ];
      for (const field of urls) {
        if (!field.value) continue;
        try {
          const parsed = new URL(field.value);
          if (parsed.protocol !== "https:") throw new Error();
        } catch {
          setProjectMessage(`${project.title} needs a complete HTTPS ${field.label} URL.`);
          return;
        }
      }
    }

    setBusy(true);
    setProjectMessage("");

    for (const project of projects) {
      const { error } = await supabase
        .from("projects")
        .update({ canva_url: project.canva_url?.trim() || null, thumbnail_url: project.thumbnail_url?.trim() || null, updated_at: new Date().toISOString() })
        .eq("id", project.id)
        .select("id")
        .single();

      if (error) {
        setProjectMessage(error.message);
        setBusy(false);
        return;
      }
    }

    setProjectMessage("Presentation URLs updated.");
    setBusy(false);
  }

  if (!user) {
    return (
      <form className="admin-card admin-form" onSubmit={signIn}>
        <h2>Admin sign in</h2>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>
        <button className="button button-primary" disabled={busy} type="submit">{busy ? "Signing in…" : "Sign in"}</button>
        <p className="form-message" role="status">{message}</p>
      </form>
    );
  }

  return (
    <div className="admin-stack">
      <div className="admin-card">
        <div className="admin-card-header"><div><p className="eyebrow">Signed in</p><h2>Update headshot</h2></div><button className="text-button" type="button" onClick={() => supabase?.auth.signOut()}>Sign out</button></div>
        <div className="admin-preview"><img src={url || DEFAULT_HEADSHOT_URL} alt="Current headshot preview" /></div>
        <form className="admin-form" onSubmit={save}>
          <label>Headshot image URL<input type="url" value={url} onChange={(event) => setUrl(event.target.value)} required /></label>
          <button className="button button-primary" disabled={busy} type="submit">{busy ? "Saving…" : "Save headshot"}</button>
          <p className="form-message" role="status">{message}</p>
        </form>
      </div>
      <div className="admin-card">
        <div className="admin-card-header"><div><p className="eyebrow">Projects</p><h2>Presentation URLs</h2></div></div>
        <form className="admin-form" onSubmit={saveProjectUrls}>
          {projects.map((project, index) => (
            <fieldset className="project-url-group" key={project.id}>
              <legend>{project.title}</legend>
              <label>Presentation URL<input type="url" inputMode="url" placeholder="https://www.canva.com/design/..." value={project.canva_url ?? ""} onChange={(event) => setProjects((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, canva_url: event.target.value } : item))} /></label>
              <label>Preview image URL<input type="url" inputMode="url" placeholder="https://images.example.com/project-preview.jpg" value={project.thumbnail_url ?? ""} onChange={(event) => setProjects((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, thumbnail_url: event.target.value } : item))} /></label>
            </fieldset>
          ))}
          <button className="button button-primary" disabled={busy || projects.length === 0} type="submit">{busy ? "Saving…" : "Save presentation URLs"}</button>
          <p className="form-message" role="status">{projectMessage}</p>
        </form>
      </div>
    </div>
  );
}
