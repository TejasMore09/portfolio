import { defineConfig } from 'astro/config';

// Production URL, used for canonical links and link-preview images. On Vercel it comes
// from VERCEL_PROJECT_PRODUCTION_URL: your custom domain once added, otherwise
// <project>.vercel.app. Vercel sets it on preview builds too, so previews point at
// production. SITE_URL overrides it (e.g. another host); local builds use the dev server.
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const site = process.env.SITE_URL ?? (vercelHost ? `https://${vercelHost}` : 'http://localhost:4321');

export default defineConfig({
  site,
  // One URL per page, e.g. /work/fintrust: pages build to work/fintrust.html and Vercel
  // serves them extension-free (vercel.json: cleanUrls, trailingSlash: false).
  trailingSlash: 'never',
  build: { format: 'file' },
  // The 3D hero (three.js) is a large, lazily loaded chunk by design.
  vite: { build: { chunkSizeWarningLimit: 900 } },
  // Astro 7 defaults to 'jsx', which drops line-break whitespace between inline
  // elements ("produces the⏎<span>132</span>" → "the132"). The prose here relies on
  // normal HTML whitespace, so keep the pre-v7 behaviour.
  compressHTML: true,
});
