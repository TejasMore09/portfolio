// Every public page, at its canonical address (no .html, no trailing slash), for search engines.
import type { APIRoute } from 'astro';
import { projects } from '../data/projects';

const paths = ['/', '/work', ...projects.map((p) => p.caseStudy), '/writing', '/certificates', '/about', '/lite'];

export const GET: APIRoute = ({ site }) => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = paths.map((path) => `  <url><loc>${new URL(path, site)}</loc><lastmod>${lastmod}</lastmod></url>`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};
