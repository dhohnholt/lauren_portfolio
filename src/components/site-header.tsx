import Link from "next/link";

export function SiteHeader() {
  return <header className="site-header"><Link className="wordmark" href="/" aria-label="Lauren Hohnholt home">Lauren <span>Hohnholt</span></Link><nav aria-label="Main navigation"><Link href="/#about">About</Link><Link href="/projects">Projects</Link><Link href="/resume">Résumé</Link><Link className="nav-contact" href="/contact">Contact</Link></nav></header>;
}
