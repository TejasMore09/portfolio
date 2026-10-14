// Posts known at build time. Pages render these first; PostList then refreshes from /api/medium,
// so new Medium posts appear on the live site without a redeploy.
import { fetchPosts, type Post } from '../lib/medium';

export type { Post };

let cache: Promise<Post[]> | undefined;

export function getPosts(): Promise<Post[]> {
  cache ??= fetchPosts().then((r) => r.posts);
  return cache;
}
