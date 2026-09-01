export type PortfolioSettings = {
  id: number;
  hero_eyebrow: string;
  hero_title: string;
  hero_body: string;
  primary_cta_label: string;
  secondary_cta_label: string;
  projects_eyebrow: string;
  projects_title: string;
  experience_eyebrow: string;
  experience_title: string;
  experience_body: string;
  experience_link_label: string;
  footer_tagline: string;
  color_olive: string;
  color_berry: string;
  color_sand: string;
  color_ink: string;
  color_mist: string;
  color_paper: string;
};

export const DEFAULT_PORTFOLIO_SETTINGS: PortfolioSettings = {
  id: 1,
  hero_eyebrow: "Designer · Creator · Problem solver",
  hero_title: "Hi, I'm Lauren.",
  hero_body:
    "I turn thoughtful ideas into clear, memorable work. This portfolio is a growing collection of projects that show how I think, create, and bring a concept to life.",
  primary_cta_label: "Explore my work",
  secondary_cta_label: "Let's connect",
  projects_eyebrow: "Selected work",
  projects_title: "Four projects, one creative point of view.",
  experience_eyebrow: "Experience",
  experience_title: "Learning by making.",
  experience_body:
    "Lauren's résumé, education, and experience will live here as her portfolio grows. The structure is ready for real milestones, roles, and accomplishments.",
  experience_link_label: "View résumé",
  footer_tagline:
    "let's build something great...or goood, as long as I learn along the way.",
  color_olive: "#6a713e",
  color_berry: "#47122f",
  color_sand: "#a18a7b",
  color_ink: "#260e18",
  color_mist: "#c9c7c8",
  color_paper: "#f5f1ed",
};

export const COLOR_FIELDS = [
  "color_olive",
  "color_berry",
  "color_sand",
  "color_ink",
  "color_mist",
  "color_paper",
] as const;

export function applyTheme(settings: PortfolioSettings) {
  if (typeof document === "undefined") return;
  for (const field of COLOR_FIELDS) {
    document.documentElement.style.setProperty(
      `--${field.replace("color_", "")}`,
      settings[field],
    );
  }
}
