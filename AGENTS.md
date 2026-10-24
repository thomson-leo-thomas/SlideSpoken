# AGENTS.md

Guidance for AI coding agents (and humans) working on Slidespoken.

## What this is
Slidespoken is a Next.js web app: a presenter speaks English, Malayalam or Hindi and animated slides are generated live from the transcript. The full product spec is in the milestone plan below. **Do not add features beyond the spec.** Ask the owner if anything is ambiguous.

## Stack
- Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS v4, zod
- OpenAI API, called **server-side only** from `src/app/api/*` route handlers
- Lucide icons (`lucide-react`)
- Later milestones: PptxGenJS (PPTX), jsPDF + html-to-image (PDF), Pexels API (optional images)
- Tests: Vitest (`src/**/*.test.ts`)
- Deploy target: Vercel. Node >= 20.

## Commands
```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm test           # vitest run
npm run build
```
Run lint, typecheck, tests and build before every push.

## Layout
```
src/app/            pages and API route handlers (src/app/api/<name>/route.ts)
src/components/     client UI components
src/hooks/          client hooks (e.g. useTranscriber: MediaRecorder + Web Speech fallback)
src/lib/            shared, framework-light logic. Unit-test this layer.
```
Keep pure logic (schemas, parsing, merge rules) in `src/lib` so it can be unit-tested without a browser.

## Rules
- Secrets: `OPENAI_API_KEY` and `PEXELS_API_KEY` are read only on the server (`src/lib/openai.ts` imports `server-only`). Never use a `NEXT_PUBLIC_` prefix for them, never send them to the client, and never commit `.env*` files. Only `.env.example` is tracked.
- Validate every API input and every LLM output with zod.
- The demo must never break: every async path needs loading and error states and a graceful fallback.
- Slide text must be in the presenter's selected language.
- Audio: each 6-second chunk is recorded by a fresh `MediaRecorder` so every blob is a complete, decodable file. Timesliced chunks after the first have no container header and OpenAI can't decode them.
- Keep the dark theme, large readable type and smooth animations.
- Prefer small, focused changes that follow the existing style. No new dependencies unless the spec calls for them.

## Workflow
Work in milestones. Push each finished milestone directly to `main` (no pull requests), then stop and wait for the owner's review.

| Milestone | Scope |
|---|---|
| M1 | Project scaffold, mic recording, `/api/transcribe`, live transcript, language selector |
| M2 | `/api/slide` with zod validation, slide rendering and animations (must be a working demo on its own) |
| M3 | Voice commands, image loading, fallback behavior |
| M4 | PPTX and PDF export |
| M5 | Audience Q&A page (`/ask`) and Q&A slide |
| M6 | Rate limiting, 15-min session cap, `/api/slide` caching, same-origin checks, README, demo script, Vercel config |

Required unit tests (added as the matching features land): zod schema validation, slide merge/update logic, voice command parsing.
