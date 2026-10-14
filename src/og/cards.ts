// Link-preview cards (og:image), one per page. Rendered to PNG at build time by
// src/pages/og/[slug].png.ts. LinkedIn wants at least 1200×627 at 1.91:1.
import { site } from '../data/site';
import { projects, heroMetrics } from '../data/projects';

export const OG_SIZE = { width: 1200, height: 627 };

export interface Card {
  eyebrow: string;
  title: string;
  subtitle: string;
  metrics: { value: string; label: string; context?: string }[];
  footer: string;
  hues: string[]; // glow colours; the first is also used for the numbers
}

const host = new URL(site.url).host;
const hues: Record<string, string[]> = {
  aether: ['#ff7a2f', '#ffb547'],
  darkhorse: ['#ff4d5e', '#ff9a8b'],
  fintrust: ['#13c48f', '#4fd1ff'],
};

export const cards: Record<string, Card> = {
  home: {
    eyebrow: `${site.name} · ${site.role} · ${site.location}`,
    title: 'AI that shows its work.',
    subtitle: 'Building AI and software that takes repetitive, messy work off people’s plates.',
    metrics: heroMetrics,
    footer: host,
    hues: ['#6b8cff', '#ff4d5e', '#13c48f'],
  },
  ...Object.fromEntries(
    projects.map((p) => [
      p.slug,
      {
        eyebrow: `Case study · ${site.name}, ${site.role}`,
        title: p.name,
        subtitle: `${p.tagline}.`,
        metrics: p.metrics,
        footer: `${host}${p.caseStudy}`,
        hues: hues[p.slug],
      },
    ]),
  ),
};
