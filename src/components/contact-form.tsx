"use client";

import { FormEvent, useState } from "react";
import { invokePublicFunction } from "@/lib/supabase/public-client";

type NotifyContactResult = {
  success?: boolean;
  saved?: boolean;
  notificationSent?: boolean;
};

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (company) { setStatus("Thank you. Your message has been sent."); return; }

    setBusy(true); setStatus("");
    const { data, error } = await invokePublicFunction<NotifyContactResult>("notify-contact", { name: name.trim(), email: email.trim(), message: message.trim(), company });

    if (error || !data?.success) {
      setStatus("We couldn't send your message. Please check the form and try again.");
    } else if (data.saved && !data.notificationSent) {
      setName(""); setEmail(""); setMessage("");
      setStatus("Your message was saved in Lauren's private inbox, but the email notification could not be confirmed.");
    } else {
      setName(""); setEmail(""); setMessage("");
      setStatus("Thank you—your message has been sent to Lauren.");
    }
    setBusy(false);
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <label>Name<input name="name" type="text" placeholder="Your name" value={name} onChange={(event) => setName(event.target.value)} minLength={1} maxLength={100} required /></label>
      <label>Email<input name="email" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required /></label>
      <label>Message<textarea name="message" rows={5} placeholder="Share a little about the role, team, or internship opportunity..." value={message} onChange={(event) => setMessage(event.target.value)} minLength={10} maxLength={3000} required /></label>
      <label className="form-honeypot" aria-hidden="true">Company website<input name="company" type="text" value={company} onChange={(event) => setCompany(event.target.value)} tabIndex={-1} autoComplete="off" /></label>
      <button className="button button-primary" disabled={busy} type="submit">{busy ? "Sending…" : "Connect with Lauren"}</button>
      <small className="contact-status" role="status">{status || "Lauren will receive your message in her private portfolio inbox."}</small>
    </form>
  );
}
