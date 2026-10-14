# Tejas More — portfolio

**Live: https://tejasmore.vercel.app**

My personal site: three production AI systems (Aether, DarkHorse AI and Fintrust) with full case studies,
writing that syncs from Medium, certificates, and an about page.

## Stack

- [Astro 7](https://astro.build), static output, deployed on Vercel
- GSAP and Lenis for motion; three.js for the hero prism
- Link-preview images rendered at build time with satori and resvg
- One Vercel Function, `api/medium.ts`, that reads my Medium feed (cached at the edge for 30 minutes),
  so new posts appear on the site without a redeploy

There is no CMS or database: content lives in `src/data`, and images in `src/assets`.

## Structure

```
src/pages        routes: home, work/*, writing, certificates, about, lite (text-only version)
src/data         projects, certificates and personal details, the single source of truth
src/components   project cards, highlights gallery, browser frames, Medium post list, …
src/layouts      the base layout and the case-study layout
src/og           link-preview cards
api/medium.ts    latest Medium posts as JSON
```

## Run it locally

Requires Node 22.12 or newer.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

Every number on the site carries its denominator and the method that produced it; the figures come from
each project's own records.
