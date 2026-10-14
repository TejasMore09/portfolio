// Renders a Card to PNG: satori lays out the element tree as SVG, resvg rasterises it.
// Uses the site's own fonts (static WOFF builds, since satori can't read WOFF2).
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { OG_SIZE, type Card } from './cards';

const font = (pkg: string, file: string) => readFile(path.join(process.cwd(), 'node_modules', pkg, 'files', file));

let fonts: ReturnType<typeof loadFonts> | undefined;
async function loadFonts() {
  const [inter500, inter700, mono] = await Promise.all([
    font('@fontsource/inter', 'inter-latin-500-normal.woff'),
    font('@fontsource/inter', 'inter-latin-700-normal.woff'),
    font('@fontsource/ibm-plex-mono', 'ibm-plex-mono-latin-400-normal.woff'),
  ]);
  return [
    { name: 'Inter', data: inter500, weight: 500, style: 'normal' },
    { name: 'Inter', data: inter700, weight: 700, style: 'normal' },
    { name: 'Plex Mono', data: mono, weight: 400, style: 'normal' },
  ] as const;
}

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: (Node | string | null | false)[]): Node => {
  const kids = children.filter((c) => c !== null && c !== false);
  return { type, props: { style, children: kids.length === 1 ? kids[0] : kids } };
};

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};
const glow = (hex: string, a: number, box: Record<string, number>) =>
  h('div', {
    position: 'absolute',
    borderRadius: 9999,
    backgroundImage: `radial-gradient(circle, ${rgba(hex, a)} 0%, ${rgba(hex, 0)} 68%)`,
    ...box,
  });

const tree = (c: Card) =>
  h(
    'div',
    { width: '100%', height: '100%', display: 'flex', position: 'relative', backgroundColor: '#06070d', color: '#f5f5f7', fontFamily: 'Inter' },
    glow(c.hues[0], 0.5, { width: 820, height: 820, right: -260, top: -360 }),
    glow(c.hues[1], 0.34, { width: 640, height: 640, right: 140, bottom: -380 }),
    c.hues[2] ? glow(c.hues[2], 0.26, { width: 560, height: 560, left: -220, bottom: -320 }) : null,
    h(
      'div',
      { display: 'flex', flexDirection: 'column', flex: 1, padding: '54px 64px 46px', position: 'relative' },
      h('div', { fontFamily: 'Plex Mono', fontSize: 19, letterSpacing: 2, color: 'rgba(235,235,245,0.62)' }, c.eyebrow.toUpperCase()),
      h('div', { fontSize: 84, fontWeight: 700, lineHeight: 1, letterSpacing: -3, marginTop: 26, color: '#ffffff' }, c.title),
      h(
        'div',
        { fontSize: 29, fontWeight: 500, lineHeight: 1.32, marginTop: 18, color: 'rgba(235,235,245,0.74)', maxWidth: 920, textWrap: 'balance' },
        c.subtitle,
      ),
      h('div', { flex: 1 }),
      h(
        'div',
        { display: 'flex', gap: 40, borderTop: '1px solid rgba(255,255,255,0.16)', paddingTop: 22 },
        ...c.metrics.map((m, i) =>
          h(
            'div',
            { display: 'flex', flexDirection: 'column', flex: 1 },
            h('div', { fontSize: 44, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.1, color: c.hues[i % c.hues.length] }, m.value),
            h('div', { fontSize: 20, fontWeight: 500, lineHeight: 1.3, marginTop: 6, color: 'rgba(235,235,245,0.78)', textWrap: 'balance' }, m.label),
          ),
        ),
      ),
      h('div', { fontFamily: 'Plex Mono', fontSize: 18, marginTop: 22, color: 'rgba(235,235,245,0.55)' }, c.footer),
    ),
  );

export async function renderCard(card: Card): Promise<Buffer> {
  fonts ??= loadFonts();
  const svg = await satori(tree(card) as any, { ...OG_SIZE, fonts: [...(await fonts)] });
  return new Resvg(svg, { fitTo: { mode: 'width', value: OG_SIZE.width } }).render().asPng();
}
