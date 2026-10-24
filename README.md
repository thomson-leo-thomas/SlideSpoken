# Slidespoken

Speak in English, Malayalam or Hindi and watch slides appear live.

> Work in progress. The full README (architecture, eval table, deploy steps) comes in milestone M6. See [AGENTS.md](AGENTS.md) for the milestone plan.

## Quick start
```bash
cp .env.example .env.local   # add your OPENAI_API_KEY
npm install
npm run dev
```
Open http://localhost:3000, choose a language and press **Start Listening**.

## Environment variables
| Name | Required | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | yes | Server-side transcription (and slide generation from M2) |
| `PEXELS_API_KEY` | no | Slide images (from M3). The app works without it |

If OpenAI transcription fails (for example, no key is set), the app falls back to the browser's Web Speech API. That works in Chrome and Edge.

## Scripts
`npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck` · `npm test`
