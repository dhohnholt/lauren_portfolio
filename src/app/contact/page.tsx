import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact", description: "Get in touch with Lauren Hohnholt." };

export default function ContactPage() {
  return <main className="inner-page contact-page"><div className="section-shell contact-grid"><div className="page-intro"><p className="eyebrow">Contact</p><h1>Have something in mind? Let&apos;s talk.</h1><p>The form is ready to connect to Supabase once the contact-message table and access policy are created.</p></div><form className="contact-form"><label>Name<input name="name" type="text" placeholder="Your name" /></label><label>Email<input name="email" type="email" placeholder="you@example.com" /></label><label>Message<textarea name="message" rows={5} placeholder="Tell Lauren a little about your project..." /></label><button className="button button-primary" type="button">Send message</button><small>Form submission will be enabled after the Supabase table is approved.</small></form></div></main>;
}
