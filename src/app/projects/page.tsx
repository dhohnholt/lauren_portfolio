import type { Metadata } from "next";
import { ProjectViewer } from "@/components/project-viewer";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected creative work by Lauren Hohnholt.",
};

export default function ProjectsPage() {
  return (
    <main className="inner-page projects-page">
      <div className="section-shell">
        <div className="page-intro light-heading">
          <p className="eyebrow">The work</p>
          <h1>Selected projects.</h1>
        </div>
        <ProjectViewer />
      </div>
    </main>
  );
}
