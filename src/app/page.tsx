import Link from "next/link";
import { Headshot } from "@/components/headshot";
import { ProjectViewer } from "@/components/project-viewer";

export default function Home() {
  return (
    <main>
      <section className="hero section-shell" id="about">
        <div className="portrait-mark"><Headshot /></div>
        <div className="hero-copy">
          <p className="eyebrow">Designer · Creator · Problem solver</p>
          <h1>Hi, I&apos;m Lauren.</h1>
          <p className="lede">I turn thoughtful ideas into clear, memorable work. This portfolio is a growing collection of projects that show how I think, create, and bring a concept to life.</p>
          <div className="button-row">
            <Link className="button button-primary" href="/projects">Explore my work</Link>
            <Link className="button button-quiet" href="/contact">Let&apos;s connect</Link>
          </div>
        </div>
      </section>
      <section className="projects-section" id="projects">
        <div className="section-shell">
          <div className="section-heading light-heading"><p className="eyebrow">Selected work</p><h2>Four projects, one creative point of view.</h2></div>
          <ProjectViewer />
        </div>
      </section>
      <section className="experience-section" id="experience">
        <div className="section-shell experience-grid">
          <div><p className="eyebrow">Experience</p><h2>Learning by making.</h2></div>
          <div className="experience-copy">
            <p>Lauren&apos;s résumé, education, and experience will live here as her portfolio grows. The structure is ready for real milestones, roles, and accomplishments.</p>
            <Link className="text-link" href="/resume">View résumé <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
