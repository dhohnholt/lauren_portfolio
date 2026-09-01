"use client";

/* eslint-disable @next/next/no-img-element */
import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { DEFAULT_HEADSHOT_URL } from "@/components/headshot";
import { supabase } from "@/lib/supabase/client";

export function AdminHeadshotEditor() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState(DEFAULT_HEADSHOT_URL);
  const [message, setMessage] = useState(supabase ? "Checking your session…" : "Supabase environment variables are not configured.");
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
    <div className="admin-card">
      <div className="admin-card-header"><div><p className="eyebrow">Signed in</p><h2>Update headshot</h2></div><button className="text-button" type="button" onClick={() => supabase?.auth.signOut()}>Sign out</button></div>
      <div className="admin-preview"><img src={url || DEFAULT_HEADSHOT_URL} alt="Current headshot preview" /></div>
      <form className="admin-form" onSubmit={save}>
        <label>Headshot image URL<input type="url" value={url} onChange={(event) => setUrl(event.target.value)} required /></label>
        <button className="button button-primary" disabled={busy} type="submit">{busy ? "Saving…" : "Save headshot"}</button>
        <p className="form-message" role="status">{message}</p>
      </form>
    </div>
  );
}
