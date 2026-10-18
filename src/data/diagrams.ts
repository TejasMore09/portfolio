// Architecture diagrams for the case studies, drawn from each project's Complete Record.
// Rendered as HTML by src/components/Flow.astro (not images), so they stay legible on phones
// and ship no JavaScript.

export type StepKind = 'io' | 'step' | 'llm' | 'check';
export type NoteKind = 'exit' | 'reads' | 'emits' | 'holds';

export interface FlowStep {
  kind: StepKind;
  title: string;
  detail?: string;
  tag?: string; // overrides the default label for the kind
  notes?: { kind: NoteKind; text: string }[];
}

export interface FlowLane {
  title?: string;
  subtitle?: string;
  steps: FlowStep[];
  writes?: string; // label on the connector from the lane's end into the store
}

export interface FlowDiagram {
  lanes: FlowLane[];
  store?: { title: string; detail: string };
  caption: string;
  runsOn?: string;
}

export const fintrustFlow: FlowDiagram = {
  lanes: [
    {
      title: 'Ingestion',
      subtitle: 'offline, idempotent — key stages shown',
      writes: 'writes',
      steps: [
        { kind: 'io', tag: 'Input', title: 'RBI / SEBI circulars & directions', detail: '7 documents · 267 pages · ~450,000 characters' },
        { kind: 'step', title: 'Immutable version text', detail: '703 sections, 436 retrieval passages; every quote and span points into it' },
        { kind: 'llm', tag: 'LLM · Gemini', title: 'Explanations & obligation extraction', detail: 'every statement must quote the regulator' },
        {
          kind: 'check',
          title: 'Quote & deadline checks',
          detail: 'code finds each quote; each deadline must appear inside its own quote',
          notes: [{ kind: 'exit', text: 'quote not found → stored, never shown' }],
        },
        { kind: 'step', title: 'Deadline generator', detail: 'deterministic, no LLM' },
        { kind: 'io', tag: 'Output', title: 'Cited explanations & deadline board', detail: '177 of 179 statements shown · 132 dated deadlines' },
      ],
    },
    {
      title: 'Question → answer',
      subtitle: '2–5 seconds',
      steps: [
        { kind: 'io', tag: 'Input', title: 'Question', detail: 'admitted under an advisory lock' },
        {
          kind: 'check',
          title: 'Advice pattern check',
          detail: 'runs before retrieval or any model call',
          notes: [{ kind: 'exit', text: 'investment advice → declined' }],
        },
        {
          kind: 'step',
          title: 'Hybrid retrieval — one SQL query',
          detail: 'top 40 vector + top 40 keyword, fused by RRF (k = 60) → 12 passages',
          notes: [{ kind: 'reads', text: 'Postgres' }],
        },
        {
          kind: 'check',
          title: 'Relevance gate',
          detail: 'threshold 0.32, calibrated on hand-written questions',
          notes: [{ kind: 'exit', text: 'nothing relevant → "the documents don\'t say", no model call' }],
        },
        {
          kind: 'llm',
          tag: 'LLM · Gemini',
          title: 'Answer with quotes',
          detail: 'question fenced; every call logged with model, prompt version, tokens, latency',
          notes: [{ kind: 'exit', text: 'model flags advice → declined' }],
        },
        {
          kind: 'check',
          title: 'Quote verification',
          detail: 'each quote must sit at its character span in the version text',
          notes: [{ kind: 'exit', text: 'unverifiable → withheld or abstain' }],
        },
        { kind: 'io', tag: 'Output', title: 'Answer, abstention or decline', detail: 'every statement backed by a verbatim quote' },
      ],
    },
  ],
  store: {
    title: 'Postgres + pgvector (Neon) — one database',
    detail: 'immutable version text · vector + full-text index · claims with quote + character span · obligations & deadlines',
  },
  caption: 'Two paths share one database. Each model call is followed by a deterministic check before anything is shown.',
  runsOn: 'Next.js on Vercel · FastAPI on Render · Neon Postgres · 225 tests, CI-gated',
};

export const darkhorseFlow: FlowDiagram = {
  lanes: [
    {
      writes: 'recorded',
      steps: [
        { kind: 'io', tag: 'Input', title: 'A message, in any form', detail: 'pasted text · link · .eml file · screenshot · voice note' },
        { kind: 'step', title: 'Extraction', detail: 'OCR + QR decoding for screenshots · speech-to-text for voice notes' },
        {
          kind: 'check',
          title: 'Five deterministic signals',
          detail: 'sender auth (SPF/DKIM/DMARC) · domain age · lookalike · link reputation · attachment type',
          notes: [{ kind: 'emits', text: "can't run → UNAVAILABLE, never 0" }],
        },
        {
          kind: 'llm',
          tag: 'LLM · Gemini 3.5 Flash Lite',
          title: 'Persuasion analysis',
          detail: 'seven levers × the requested action, scored multiplicatively · $0.00048 a check',
        },
        {
          kind: 'check',
          title: 'Span-verification guard',
          detail: 'every quote must appear in the message — exact or whitespace-insensitive only',
          notes: [{ kind: 'exit', text: 'quote not found → finding discarded; all fail → UNAVAILABLE' }],
        },
        {
          kind: 'step',
          title: 'Fusion',
          detail: 'noisy-OR, unfitted — and the verdict says so',
          notes: [{ kind: 'emits', text: 'degraded: true when a signal is missing' }],
        },
        { kind: 'io', tag: 'Output', title: 'Verdict', detail: 'severity · the exact phrases · ordered steps, irreversible first' },
      ],
    },
  ],
  store: { title: 'Postgres (Neon)', detail: 'FORCE row-level security · app role NOBYPASSRLS · 13 of 17 tables tenant-scoped' },
  caption: 'One message in, one verdict out. A finding only counts if its quote survives the guard; a check that cannot run says so.',
  runsOn: 'Guard: Next.js on Vercel → same-origin proxy (12-path allowlist) → Core: FastAPI in Docker (Tesseract, zbar) on Render',
};

export const aetherFlow: FlowDiagram = {
  lanes: [
    {
      writes: 'recorded',
      steps: [
        {
          kind: 'io',
          tag: 'Input',
          title: 'Readings',
          detail: 'typed · spreadsheet · per-tenant API key · connectors, e.g. Xero via OAuth 2.0 + PKCE',
        },
        {
          kind: 'check',
          title: 'Quality gate',
          detail: 'every route into the system passes it',
          notes: [{ kind: 'exit', text: 'bad reading → quarantined, shown, excluded' }],
        },
        { kind: 'step', title: 'Derive signals', detail: 'performance against the band · drift against this tenant’s own baseline' },
        {
          kind: 'check',
          title: 'Risk + economic test',
          detail: 'daily loss = exposure × at-risk share × daily rate; act only if it pays back inside the horizon',
          notes: [
            { kind: 'reads', text: 'decision memory · vector + keyword must agree' },
            { kind: 'exit', text: 'payback too long → flag for review, no action' },
          ],
        },
        { kind: 'check', title: 'Human gate', notes: [{ kind: 'holds', text: 'high-risk actions until the owner approves' }] },
        {
          kind: 'llm',
          tag: 'LLM · Gemini via LiteLLM',
          title: 'Explain',
          detail: 'the owner’s words, never “drift” or “model”; metered per tenant, template fallback',
        },
        { kind: 'io', tag: 'Output', title: 'Verdict', detail: 'e.g. ESCALATE_COLLECTIONS · HIGH · $387.06 a day' },
      ],
    },
  ],
  store: {
    title: 'Postgres + pgvector (Neon)',
    detail: '25 tables · 12 under row-level security · embeddings computed locally (no text leaves)',
  },
  caption: 'Code makes every decision; the model only writes the explanation. Run out of AI budget and only the wording degrades.',
  runsOn: '3 FastAPI services on Render · 2 Next.js apps on Vercel · Neon Postgres · 1,388 tests, none skipped',
};
