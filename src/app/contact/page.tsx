import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = { title: "Contact", description: "Connect with Lauren Hohnholt about internship opportunities." };

export default function ContactPage() {
  return <main className="inner-page contact-page"><div className="section-shell contact-grid"><div className="page-intro"><p className="eyebrow">Internship opportunities</p><h1>Let&apos;s build something meaningful together.</h1><p>Lauren is currently seeking internship opportunities where she can contribute her creativity, strengthen her skills, and learn alongside an experienced team. If you think she could be a great fit for your organization, she&apos;d love to hear from you.</p></div><ContactForm /></div></main>;
}
