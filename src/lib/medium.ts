// Medium RSS → posts. Shared by the build (src/data/medium.ts) and the live function (api/medium.ts),
// so it must not depend on Astro or Vite.
export const MEDIUM_FEED = 'https://medium.com/feed/@tejasmore464';

export interface Post {
  title: string;
  url: string;
  date: string; // ISO 8601
  excerpt: string;
  image?: string;
  minutes: number;
}

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .trim();
const tag = (xml: string, name: string) => decode(xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))?.[1] ?? '');

export function parseFeed(xml: string): Post[] {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => {
    const html = tag(item, 'content:encoded');
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return {
      title: tag(item, 'title'),
      url: tag(item, 'link').split('?')[0],
      date: new Date(tag(item, 'pubDate')).toISOString(),
      excerpt: text.length > 180 ? `${text.slice(0, 177).trimEnd()}…` : text,
      image: html.match(/<img[^>]+src="([^"]+)"/)?.[1],
      minutes: Math.max(1, Math.round(text.split(' ').length / 230)),
    };
  });
}

export async function fetchPosts(timeoutMs = 8000): Promise<{ ok: boolean; posts: Post[]; status?: number }> {
  try {
    const res = await fetch(MEDIUM_FEED, {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; tejasmore-portfolio)' },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return { ok: false, posts: [], status: res.status };
    return { ok: true, posts: parseFeed(await res.text()) };
  } catch {
    return { ok: false, posts: [] };
  }
}
