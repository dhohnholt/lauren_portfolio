import type { Metadata } from "next";
import { ResumeContent } from "@/components/resume-content";

export const metadata: Metadata = {
  title: "Résumé",
  description: "Electrical engineering education, technical skills, leadership, and experience for Lauren Hohnholt.",
};

export default function ResumePage() {
  return <main className="inner-page resume-page"><ResumeContent /></main>;
}
