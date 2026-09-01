import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Résumé",
  description: "Electrical engineering education, technical skills, leadership, and experience for Lauren Hohnholt.",
};

const BulletList = ({ children }: { children: React.ReactNode }) => <ul className="resume-bullets">{children}</ul>;

export default function ResumePage() {
  return (
    <main className="inner-page resume-page">
      <div className="section-shell resume-shell">
        <header className="resume-intro">
          <div><p className="eyebrow">Résumé</p><h1>Engineering with a creative signal.</h1></div>
          <p>Senior Electrical Engineering student and IEEE officer with 2+ years of workplace experience, blending analytical engineering fundamentals with creative problem solving. Passionate musician with skills in circuit design, hardware assembly, and troubleshooting through independent audio electronics projects, including building custom guitar effects pedals.</p>
        </header>

        <div className="resume-layout">
          <div className="resume-main">
            <section className="resume-section">
              <div className="resume-section-heading"><p className="eyebrow">Experience</p><h2>Work & audio</h2></div>
              <article className="resume-entry">
                <div className="resume-entry-heading"><div><h3>Sales Associate</h3><p>Marshalls</p></div><time>August 2024 - Current</time></div>
                <BulletList><li>Maintain organization and cleanliness of the women&apos;s department to support efficient merchandising and customer experience.</li><li>Handle cash, credit, and returns with high accuracy in a fast-paced environment.</li><li>Collaborate with team members to manage high customer traffic during peak hours.</li></BulletList>
              </article>
              <article className="resume-entry">
                <div className="resume-entry-heading"><div><h3>Worship Team Audio & Musician</h3><p>I Am Church</p></div><time>July 2022 - Current</time></div>
                <BulletList><li>Configure in-ear monitoring systems, digital mixers, microphones, and stage equipment for one weekly worship service.</li><li>Perform level balancing with digital audio workstations and microphones to deliver uninterrupted worship services.</li><li>Perform featured violin and keyboard accompaniment for weekly worship services attended by 50-150 people.</li></BulletList>
              </article>
            </section>

            <section className="resume-section">
              <div className="resume-section-heading"><p className="eyebrow">Leadership</p><h2>Student organizations</h2></div>
              <article className="resume-entry">
                <div className="resume-entry-heading"><div><h3>Publicity and Multimedia Officer</h3><p>IEEE</p></div></div>
                <BulletList><li>Spearheaded digital marketing and social media campaigns to boost branch engagement and event turnout.</li><li>Managed core online platforms, website updates, and member communications across the organization.</li><li>Captured and curated high-quality photo and multimedia archives to showcase branch events and history.</li></BulletList>
              </article>
            </section>

            <section className="resume-section">
              <div className="resume-section-heading"><p className="eyebrow">Selected work</p><h2>Academic projects</h2></div>
              <article className="resume-entry project-resume-entry"><div className="resume-entry-heading"><h3>Bacterial Incubator</h3><time>July 2026</time></div><p>Engineered a yogurt incubator using dual microcontrollers, UART communication, and PWM-driven thermal regulation to maintain precise fermentation temperatures. Integrating ADC thermistor sensing and relay control for automated thermal regulation.</p></article>
              <article className="resume-entry project-resume-entry"><div className="resume-entry-heading"><h3>Guitar Fuzz Pedal</h3><time>September 2026</time></div><p>Designed and soldered a custom analog fuzz effect pedal featuring transistor-based clipping, true-bypass switching, and clean PCB component layout within a shielded enclosure. Validated audio signal integrity and minimized background noise through iterative bench testing and live audio evaluation.</p></article>
            </section>
          </div>

          <aside className="resume-sidebar">
            <section><p className="eyebrow">Education</p><h2>B.S. Electrical Engineering</h2><p className="resume-school">The University of Texas at El Paso</p><dl className="resume-facts"><div><dt>Expected graduation</dt><dd>Spring 2028</dd></div><div><dt>GPA</dt><dd>3.95</dd></div></dl></section>
            <section><p className="eyebrow">Technical skills</p><ul className="resume-skill-groups"><li><span>Programming</span>C/C++, MATLAB, Xilinx Vivado</li><li><span>Engineering tools</span>LTspice</li><li><span>Hardware</span>Breadboarding, oscilloscope, multimeter</li></ul></section>
            <section><p className="eyebrow">Contact</p><div className="resume-contact"><a href="tel:+19154015762"><span>Telephone</span>(915) 401-5762</a><a href="mailto:laurenhohnholt@gmail.com"><span>Email</span>laurenhohnholt@gmail.com</a></div></section>
          </aside>
        </div>
      </div>
    </main>
  );
}
