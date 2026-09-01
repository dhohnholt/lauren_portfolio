"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [ready, setReady] = useState(false);
  const [complete, setComplete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(supabase ? "Verifying your recovery link…" : "Supabase environment variables are not configured.");

  useEffect(() => {
    if (!supabase) return;

    void supabase.auth.getUser().then(({ data, error }) => {
      setReady(Boolean(data.user));
      if (error || !data.user) setMessage("Open the valid recovery link from your email to continue.");
      else setMessage("");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session?.user) {
        setReady(true);
        setMessage("");
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !ready) return;
    if (password.length < 8) { setMessage("Use at least 8 characters for the new password."); return; }
    if (password !== confirmation) { setMessage("The passwords do not match."); return; }

    setBusy(true); setMessage("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setMessage(error.message);
    else { setComplete(true); setMessage("Password updated successfully."); }
    setBusy(false);
  }

  if (complete) return <div className="admin-card reset-card"><p className="eyebrow">All set</p><h2>Password updated</h2><p>Your new password is ready. Continue to the portfolio studio.</p><a className="button button-primary" href="/admin">Open admin</a></div>;

  return (
    <form className="admin-card admin-form reset-card" onSubmit={updatePassword}>
      <p className="eyebrow">Account recovery</p><h2>Choose a new password</h2>
      <label>New password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required autoComplete="new-password" disabled={!ready} /></label>
      <label>Confirm password<input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={8} required autoComplete="new-password" disabled={!ready} /></label>
      <button className="button button-primary" disabled={busy || !ready} type="submit">{busy ? "Updating…" : "Update password"}</button>
      <p className="form-message" role="status">{message}</p>
    </form>
  );
}
