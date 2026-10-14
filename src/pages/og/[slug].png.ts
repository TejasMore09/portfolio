// Static link-preview images: /og/home.png, /og/fintrust.png, ... generated at build time.
import type { APIRoute, GetStaticPaths } from 'astro';
import { cards } from '../../og/cards';
import { renderCard } from '../../og/render';

export const getStaticPaths: GetStaticPaths = () => Object.keys(cards).map((slug) => ({ params: { slug } }));

export const GET: APIRoute = async ({ params }) => {
  const png = await renderCard(cards[params.slug!]);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
