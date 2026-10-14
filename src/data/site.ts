import { existsSync } from 'node:fs';

// Single source of truth for personal details. Anything set to null is left off the page.
export const site = {
  name: 'Tejas More',
  role: 'AI & Software Engineer',
  location: 'Mumbai, India',
  timezone: 'IST · UTC+5:30',
  status: 'Open to AI & software engineering roles',
  positioning:
    'I like building things that take real work off someone’s plate: finding the repetitive, messy workflows and automating them — whatever the technology.',
  url: import.meta.env.SITE, // production URL, set in astro.config.mjs
  email: 'tejasmore464@gmail.com',
  linkedin: 'https://www.linkedin.com/in/tejasmore09',
  github: 'https://github.com/TejasMore09' as string | null,
  medium: 'https://medium.com/@tejasmore464',
  // Public resume (no phone number). Until it exists, resume links are left out.
  resume: existsSync('public/resume.pdf') ? '/resume.pdf' : null,
};
