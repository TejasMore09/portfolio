// Every metric carries its denominator / baseline and the method that produced it.
// Figures come from each project's Complete Record (Oct 2026) or, where marked, the resume.
// `source` links to where the number can be seen; `verified` is the date it was last re-run.
import type { ImageMetadata } from 'astro';

// Covers are whole screens; highlights named hl-* are crops of the part each caption describes.
import aOverview from '../assets/projects/aether/01-overview.png';
import aApprovals from '../assets/projects/aether/hl-approvals.png';
import aDomain from '../assets/projects/aether/03-domain.png';
import aRejected from '../assets/projects/aether/hl-rejected.png';
import aActivity from '../assets/projects/aether/hl-activity.png';
import aExplore from '../assets/projects/aether/hl-explore.png';
import dCritical from '../assets/projects/darkhorse/06-verdict-critical.jpg';
import dLanding from '../assets/projects/darkhorse/hl-landing.jpg';
import dCheck from '../assets/projects/darkhorse/hl-check.jpg';
import dHowWeKnow from '../assets/projects/darkhorse/hl-how-we-know.jpg';
import dPlaybook from '../assets/projects/darkhorse/hl-playbook.jpg';
import dClicked from '../assets/projects/darkhorse/hl-clicked.jpg';
import fAsk from '../assets/projects/fintrust/20-ask-answer.jpg';
import fLanding from '../assets/projects/fintrust/01-landing.jpg';
import fObligations from '../assets/projects/fintrust/hl-obligations.jpg';
import fNotAdvice from '../assets/projects/fintrust/hl-not-advice.jpg';
import fCalendar from '../assets/projects/fintrust/28-deadlines-calendar.jpg';
import fPhone from '../assets/projects/fintrust/32-phone-dashboard.jpg';

export interface Metric {
  value: string;
  label: string;
  context?: string;
  method: string;
  source?: string;
  verified?: string;
}

export interface Highlight {
  image: ImageMetadata;
  title: string;
  caption: string;
  phone?: boolean;
}

export interface Project {
  slug: 'aether' | 'darkhorse' | 'fintrust';
  name: string;
  tagline: string;
  problem: string;
  summary: string;
  period: string;
  codebaseSince: string; // first commit of the current repository; earlier work lived elsewhere
  stack: string[];
  live: { url: string; label: string };
  repo: { url: string; private: boolean };
  caseStudy: string;
  theme: 'light' | 'dark';
  cover: ImageMetadata;
  coverAlt: string;
  coverPosition?: string; // object-position when the cover is cropped (default: top center)
  cardStats: { value: string; label: string }[];
  highlights: Highlight[];
  metrics: Metric[];
}

export const projects: Project[] = [
  {
    slug: 'aether',
    name: 'Aether',
    tagline: 'An AI agent that decides whether acting is worth the money',
    problem:
      'A small business runs on numbers it cannot read. Aether gives each one its own agent that judges every reading, sizes the loss, declines when acting doesn’t pay, and holds risky actions for a person.',
    summary:
      'Aether is an adaptive monitoring and decision platform for small businesses, each with its own isolated agent. It takes readings from whatever the business has, judges each against a band calibrated to that business, decides whether acting is worth the money, explains itself in the owner’s language — and holds any high-risk action until a person agrees.',
    period: 'Nov 2025 – present',
    codebaseSince: 'Jun 2026',
    stack: ['Python', 'FastAPI', 'PostgreSQL + pgvector', 'SQLAlchemy', 'Next.js', 'TypeScript', 'Gemini', 'Xero OAuth 2.0', 'Docker', 'pytest'],
    live: { url: 'https://aether-ai-customer-app.vercel.app/explore', label: 'Live demo' },
    repo: { url: 'https://github.com/TejasMore09/Aether-AI', private: true },
    caseStudy: '/work/aether',
    theme: 'dark',
    cover: aOverview,
    coverAlt: 'Aether overview: one decision awaiting the owner, $387 a day of exposure if unaddressed, and recent agent activity.',
    cardStats: [
      { value: '$3.78/day', label: 'estimated on live Xero data vs $400 to act: declined' },
      { value: '1,388', label: 'tests, none skipped' },
    ],
    highlights: [
      {
        image: aApprovals,
        title: 'Risky actions wait for a person.',
        caption: '$387.06 a day at risk against a $400 one-off cost: it pays for itself in 1.0 days, so it is proposed — and held for Approve or Reject.',
      },
      {
        image: aDomain,
        title: 'Every threshold names its source.',
        caption: '“Healthy below 57d — your own normal, from 12 readings.” Each metric is judged against this business’s own history, within anchored limits.',
      },
      {
        image: aRejected,
        title: 'A bad reading is kept, never used.',
        caption: 'An overdue share of 46, above the possible maximum of 1, usually means a unit mismatch upstream. The reading is quarantined and shown — and excluded from every decision.',
      },
      {
        image: aActivity,
        title: 'A permanent record.',
        caption: 'Every decision and every notification, append-only. Even Aether staff access is listed — read-only, with when it opened and when it ended.',
      },
      {
        image: aExplore,
        title: 'A public walk-through.',
        caption: 'A worked example anyone can open: the decision, what it costs, and what the agent found — in plain words, no sign-up.',
      },
    ],
    metrics: [
      {
        value: '$3.78/day',
        label: 'estimated loss on live Xero data, against $400 to act: declined',
        context: 'Xero demo company over the live API · $9,194.51 outstanding · 15% a year assumed',
        method:
          'Read from a Xero demo company over the live Xero API (OAuth 2.0 + PKCE): ar_total 9,194.51 and overdue ratio 0.7555, matching Xero’s own dashboard exactly. The books are Xero’s sample data, not a customer’s; no real business data has entered the system yet. At an assumed carrying cost of 15% a year, that book’s expected loss is about $3.78 a day against a $400 one-off cost to act, so the engine declined to recommend spending money to save less, unprompted. On the worked example (2,846,000 × 34% × 0.0004 = $387.06 a day) the same test pays back in 1.0 day, so it acts and holds the action for a person.',
      },
      {
        value: '12 of 25',
        label: 'tables under row-level security',
        context: 'non-owner app role · proved against a real Postgres in CI',
        method:
          'All 12 tables that hold a business’s data carry a tenant_id and a row-level-security policy. The other 13 are the control plane (accounts, sessions, staff and platform records), which has no tenant_id and is protected by application logic. Tenant scoping is the database’s job: no Python filters by tenant, so the isolation tests fail if a policy is dropped. Tests run many tenants concurrently on a shared pool, including a query whose nearest vector neighbour belongs to someone else.',
      },
      {
        value: '1,388',
        label: 'tests, none skipped',
        context: '1,354 Python + 20 front-end + 14 browser · five CI gates',
        method:
          'pytest, ruff and mypy on the backend; component tests in both Next.js apps; and a real-Chrome check of the public page under both motion settings, all in GitHub Actions. Skipped tests are not allowed, and 120 decisions are logged in writing.',
      },
    ],
  },
  {
    slug: 'darkhorse',
    name: 'DarkHorse AI',
    tagline: 'Anti-fraud verdicts that show their evidence',
    problem:
      'Expensive fraud now looks like ordinary work. DarkHorse reads what a message is doing to the reader — and publishes a false-positive rate anyone can reproduce.',
    summary:
      'Someone gets a message they’re unsure about — an invoice where the bank details changed, a “colleague” on WhatsApp — and pastes it, forwards it, or sends a screenshot or voice note. They get back a severity verdict, the exact phrases that triggered it, and an ordered list of what to do, starting with whatever is irreversible.',
    period: 'Mar 2026 – present',
    codebaseSince: 'Sep 2026',
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'Next.js', 'Gemini', 'Tesseract OCR', 'Docker'],
    live: { url: 'https://darkhorsemain.vercel.app/', label: 'Try it live' },
    repo: { url: 'https://github.com/TejasMore09/DarkHorse_AI_main', private: true },
    caseStudy: '/work/darkhorse',
    theme: 'light',
    cover: dCritical,
    coverAlt: 'DarkHorse verdict: Critical, 94% likely an attack, “Do not act on this message”, with quoted evidence and ordered steps.',
    cardStats: [
      { value: '1.355%', label: 'false positives · 9 of 664 on a held-out set' },
      { value: '6', label: 'signals, each allowed to say “couldn’t check”' },
    ],
    highlights: [
      {
        image: dLanding,
        title: 'Is this real, or is someone trying to take your money?',
        caption: 'The landing page publishes its false-positive rate with the count behind it: 9 of 664 legitimate messages.',
      },
      {
        image: dCheck,
        title: 'Five ways in.',
        caption: 'Paste a message, check a link, upload an .eml file, send a screenshot or a voice note.',
      },
      {
        image: dHowWeKnow,
        title: 'How we know.',
        caption: 'Each signal reports CHECKED, DOES NOT APPLY or COULD NOT RUN, with the exact words it found. A check that did not run never reads as a pass.',
      },
      {
        image: dPlaybook,
        title: 'The Playbook.',
        caption: 'Fourteen tactics: how each one works on people who are not stupid, and the concrete thing that breaks it. The one your line of work meets most is marked.',
      },
      {
        image: dClicked,
        title: '“I already clicked” has a plan.',
        caption: 'Tell it what happened and it gives you the order to do things in — four urgent steps first, each with roughly how long it takes.',
      },
    ],
    metrics: [
      {
        value: '1.355%',
        label: 'false-positive rate',
        context: '9 of 664 legitimate · recall 11.1% (6 of 54) · 3 of 6 signals, network off',
        method:
          'Frozen held-out set of 718 messages (fingerprint 9fc2bac7e80a21ce), threshold 0.460, reproduced with `python -m darkhorse.eval`. Scope: three of six signals, network off, corpora that predate 2010. An earlier 0.55% figure was withdrawn because it could not be reproduced.',
        source: 'https://darkhorsemain.vercel.app/',
      },
      {
        value: '2 of 8',
        label: 'model claims discarded by the quote guard',
        context: 'requested actions · 399 real messages · 1 of 15 levers',
        method:
          'Every quotation the model returns is matched against the original message (exact or whitespace-insensitive only). Findings whose quote is not found are discarded, not scored. Two of eight is a count, not a rate — the interval is roughly 7–59%.',
      },
      {
        value: '$0.00048',
        label: 'model cost per check, measured in evaluation',
        context: '~1.2 s per text check · at Claude Haiku list prices',
        method:
          'Persuasion analysis is the only signal that calls a model. This cost comes from evaluation runs priced at Claude Haiku’s list rates, the model its prompt and thresholds were tuned against. Production now runs Gemini 3.5 Flash Lite, listed at well under half Haiku’s price per token, and no production check has been priced yet. Deterministic signals take 0.4–1.4 ms per message; the full text check measured ~1.2 s on the deployed instance.',
      },
    ],
  },
  {
    slug: 'fintrust',
    name: 'Fintrust',
    tagline: 'Regulation explained — every line sourced',
    problem:
      'Compliance teams act on 99-page circulars. Fintrust explains them in plain language, where every statement must quote the regulator — or it isn’t shown.',
    summary:
      'Fintrust reads RBI and SEBI circulars and master directions and explains what they require, in plain language, for SEBI-registered advisers, research analysts and small NBFCs. A 99-page master circular becomes a cited explanation, a list of obligations, real due dates on a deadline board — and answers to questions about the rules.',
    period: 'Apr 2026 – present',
    codebaseSince: 'Sep 2026',
    stack: ['Python', 'FastAPI', 'PostgreSQL + pgvector', 'Next.js', 'Gemini', 'Playwright'],
    live: { url: 'https://fintrust-rho.vercel.app/', label: 'Visit Fintrust' },
    repo: { url: 'https://github.com/TejasMore09/fintrust-regintel', private: true },
    caseStudy: '/work/fintrust',
    theme: 'light',
    cover: fAsk,
    coverPosition: 'left top',
    coverAlt: 'Fintrust answering “How many days do I have to resolve a client grievance?” with two cited sources highlighted in the regulator’s text.',
    cardStats: [
      { value: '177/179', label: 'statements with their quote found in the source' },
      { value: '132', label: 'deadlines, computed by code' },
    ],
    highlights: [
      {
        image: fLanding,
        title: 'Circulars, explained. Every line sourced.',
        caption: 'Built for SEBI-registered investment advisers, research analysts and NBFC compliance teams.',
      },
      {
        image: fObligations,
        title: 'Obligations, cited to the sentence.',
        caption: 'Each obligation carries its deadline and a numbered citation into the regulator’s own text.',
      },
      {
        image: fNotAdvice,
        title: 'Information, not advice.',
        caption: '“Should I buy Reliance shares now?” is declined before any model call — and the model’s own flag declines it again if anything slips through.',
      },
      {
        image: fCalendar,
        title: 'Deadlines computed by code.',
        caption: 'The model extracts obligations; deterministic code turns them into dates.',
      },
      {
        image: fPhone,
        title: 'On a phone, too.',
        caption: 'One adviser’s dashboard: “42 of 42 statements matched their quote in the source. Anything that doesn’t is withheld.”',
        phone: true,
      },
    ],
    metrics: [
      {
        value: '98.9%',
        label: 'explanation statements whose quote was found in the source',
        context: '177 of 179 · the other 2 withheld · obligations: 82 of 90 kept',
        method:
          'The model must quote the regulator’s words for every statement; code then finds that quote as a character span in the stored, immutable text of the document. Anything whose quote cannot be found is stored but never shown. A match proves the quote is really in the source, not that the statement reads it correctly; that human review step isn’t built yet.',
        source: 'https://fintrust-rho.vercel.app/',
      },
      {
        value: '132',
        label: 'dated deadlines, computed by code',
        context: 'window: 3 months back to 24 ahead',
        method:
          'The model extracts obligations as cited records; code checks each deadline appears inside its own quote, then a deterministic, non-LLM generator turns them into dates.',
      },
      {
        value: '225',
        label: 'tests against a real Postgres',
        context: 'incl. tests that the database refuses unevidenced statements',
        method: 'pytest against PostgreSQL (not mocks), CI-gated in GitHub Actions; Playwright for the web app.',
      },
    ],
  },
];

export const testCounts = { aether: 1388, darkhorse: 1246, fintrust: 225 }; // every CI-gated test
export const totalTests = testCounts.aether + testCounts.darkhorse + testCounts.fintrust;

const bySlug = (slug: Project['slug']) => projects.find((p) => p.slug === slug)!;

// Headline numbers for the homepage hero and its link-preview card.
export const heroMetrics: Metric[] = [
  bySlug('fintrust').metrics[0],
  bySlug('darkhorse').metrics[0],
  {
    value: totalTests.toLocaleString('en-US'),
    label: 'tests across three live systems',
    context: '1,388 + 1,246 + 225',
    method:
      'Every CI-gated test, as of October 2026: Aether 1,388 (1,354 Python + 34 front-end and browser), DarkHorse AI 1,246 (1,135 detection engine + 111 web app) and Fintrust 225.',
  },
];
