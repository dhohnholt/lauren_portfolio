import type { Metadata } from "next";
import { AdminPortfolioEditor } from "@/components/admin-portfolio-editor";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default function AdminPage() {
  return (
    <main className="inner-page admin-page">
      <div className="section-shell admin-grid">
        <div className="page-intro"><p className="eyebrow">Portfolio studio</p><h1>Shape every part of the story.</h1><p>Manage homepage copy, brand colors, project details, presentations, and imagery from one place.</p></div>
        <AdminPortfolioEditor />
      </div>
    </main>
  );
}
