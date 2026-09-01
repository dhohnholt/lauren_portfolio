import type { Metadata } from "next";
import { AdminHeadshotEditor } from "@/components/admin-headshot-editor";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default function AdminPage() {
  return (
    <main className="inner-page admin-page">
      <div className="section-shell admin-grid">
        <div className="page-intro"><p className="eyebrow">Portfolio admin</p><h1>Keep Lauren&apos;s profile current.</h1><p>Sign in to replace the homepage headshot with any secure image URL.</p></div>
        <AdminHeadshotEditor />
      </div>
    </main>
  );
}
