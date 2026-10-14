// Vercel Function: latest Medium posts as JSON, cached at Vercel's edge for 30 minutes so Medium is
// asked at most twice an hour. The site keeps showing its build-time posts if this fails.
import { fetchPosts } from '../src/lib/medium.js'; // .js: Vercel runs this file as native ESM

const json = (body: unknown, sMaxAge: number) =>
  new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=0, s-maxage=${sMaxAge}, stale-while-revalidate=86400`,
    },
  });

export async function GET() {
  const result = await fetchPosts();
  return result.ok
    ? json({ ok: true, posts: result.posts, fetchedAt: new Date().toISOString() }, 1800)
    : json({ ok: false, posts: [], status: result.status ?? null }, 120);
}
