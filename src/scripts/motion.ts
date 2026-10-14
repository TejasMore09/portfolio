// Site-wide motion: smooth scroll, scroll reveals, split-line headings, scroll-lit statements,
// count-ups, tilt, magnetic buttons, a custom cursor and a nav that adapts to the section under
// it. Without JS — or with reduced motion — every page stays static and fully readable.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => [
  ...root.querySelectorAll<T>(sel),
];

function smoothScroll() {
  if (reduce) return;
  const lenis = new Lenis({ lerp: 0.09, anchors: { offset: -88 } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function reveals() {
  if (reduce) return;
  for (const el of $$('[data-reveal]')) {
    gsap.from(el, {
      y: 40,
      autoAlpha: 0,
      duration: 1.3,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  }
  for (const group of $$('[data-stagger]')) {
    gsap.from(group.children, {
      y: 48,
      autoAlpha: 0,
      duration: 1.2,
      ease: 'expo.out',
      stagger: 0.09,
      scrollTrigger: { trigger: group, start: 'top 86%', once: true },
    });
  }
}

function splitHeadings() {
  if (reduce) return;
  for (const el of $$('[data-split]')) {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.25,
          ease: 'expo.out',
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 87%', once: true },
        }),
    });
  }
  // Apple-style statement: words light up as the paragraph scrolls through the viewport.
  for (const el of $$('[data-light-up]')) {
    SplitText.create(el, {
      type: 'words',
      autoSplit: true,
      onSplit: (self) =>
        gsap.fromTo(
          self.words,
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.12,
            scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 52%', scrub: true },
          },
        ),
    });
  }
}

function counters() {
  for (const el of $$('[data-count]')) {
    const to = Number(el.dataset.count);
    if (!Number.isFinite(to) || reduce) continue;
    const decimals = Number(el.dataset.decimals ?? 0);
    const prefix = el.dataset.prefix ?? '';
    const suffix = el.dataset.suffix ?? '';
    const fmt = (v: number) =>
      prefix + v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
    const state = { v: 0 };
    el.textContent = fmt(0);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: () =>
        gsap.to(state, { v: to, duration: 2, ease: 'power3.out', onUpdate: () => (el.textContent = fmt(state.v)) }),
    });
  }
}

function scrollScenes() {
  if (reduce) return;
  // Parallax: data-speed="1" drifts up ~10% of its height over the viewport.
  for (const el of $$('[data-speed]')) {
    gsap.to(el, {
      yPercent: Number(el.dataset.speed) * -10,
      ease: 'none',
      scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }
  // Screens that "rise" and flatten as they scroll in, like a product on a turntable.
  for (const el of $$('[data-rise]')) {
    gsap.fromTo(
      el,
      { rotationX: 16, scale: 0.9, y: 24, transformPerspective: 1600, transformOrigin: '50% 100%' },
      {
        rotationX: 0,
        scale: 1,
        y: 0,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 100%', end: 'top 28%', scrub: 0.6 },
      },
    );
  }
  // Sticky project cards: each one recedes as the next slides over it.
  const cards = $$('[data-stack-card]');
  if (matchMedia('(min-width: 901px)').matches) {
    cards.forEach((card, i) => {
      const next = cards[i + 1];
      if (!next) return;
      gsap.to(card.querySelector('.pcard-inner'), {
        scale: 0.92,
        filter: 'brightness(0.72)',
        ease: 'none',
        scrollTrigger: { trigger: next, start: 'top 90%', end: 'top 20%', scrub: true },
      });
    });
  }
}

function tilt() {
  if (!fine || reduce) return;
  for (const el of $$('[data-tilt]')) {
    gsap.set(el, { transformPerspective: 1200 });
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.9, ease: 'power3.out' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.9, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry(px * 7);
      rx(-py * 7);
      el.style.setProperty('--gx', `${(px + 0.5) * 100}%`);
      el.style.setProperty('--gy', `${(py + 0.5) * 100}%`);
    });
    el.addEventListener('pointerleave', () => {
      rx(0);
      ry(0);
    });
  }
}

function magnetic() {
  if (!fine || reduce) return;
  for (const el of $$('[data-magnetic]')) {
    const x = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.28);
      y((e.clientY - (r.top + r.height / 2)) * 0.4);
    });
    el.addEventListener('pointerleave', () => {
      x(0);
      y(0);
    });
  }
}

function cursor() {
  const root = document.querySelector<HTMLElement>('[data-cursor-root]');
  if (!root || !fine) return;
  const dot = root.querySelector<HTMLElement>('.cursor-dot')!;
  const ring = root.querySelector<HTMLElement>('.cursor-ring')!;
  const label = root.querySelector<HTMLElement>('.cursor-label')!;
  document.documentElement.classList.add('has-cursor');
  gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });
  const fast = { duration: reduce ? 0 : 0.12, ease: 'power3.out' };
  const slow = { duration: reduce ? 0 : 0.5, ease: 'power3.out' };
  const dx = gsap.quickTo(dot, 'x', fast);
  const dy = gsap.quickTo(dot, 'y', fast);
  const rx = gsap.quickTo(ring, 'x', slow);
  const ry = gsap.quickTo(ring, 'y', slow);
  addEventListener(
    'pointermove',
    (e) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      root.classList.add('is-visible');
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', () => root.classList.remove('is-visible'));
  document.addEventListener('pointerover', (e) => {
    const target = (e.target as Element).closest<HTMLElement>('[data-cursor], a, button, summary, label');
    const text = target?.dataset.cursor;
    root.classList.toggle('is-link', !!target && !text);
    root.classList.toggle('is-label', !!text);
    label.textContent = text ?? '';
  });
  addEventListener('pointerdown', () => root.classList.add('is-down'));
  addEventListener('pointerup', () => root.classList.remove('is-down'));
}

function navTone() {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  if (!nav) return;
  let queued = false;
  const update = () => {
    queued = false;
    const y = Math.max(8, nav.getBoundingClientRect().height / 2);
    const under = document.elementsFromPoint(innerWidth / 2, y).find((el) => !nav.contains(el));
    const section = under?.closest<HTMLElement>('[data-theme]');
    nav.dataset.tone = section?.dataset.theme === 'dark' ? 'dark' : 'light';
    nav.classList.toggle('is-scrolled', scrollY > 12);
  };
  addEventListener(
    'scroll',
    () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  addEventListener('resize', update);
  update();
}

smoothScroll();
navTone();
cursor();
reveals();
counters();
scrollScenes();
tilt();
magnetic();
document.fonts.ready.then(() => {
  splitHeadings();
  ScrollTrigger.refresh();
});
addEventListener('load', () => ScrollTrigger.refresh());
