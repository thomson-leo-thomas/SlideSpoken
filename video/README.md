# Slidespoken Reel

A 1080×1920, ~48-second Instagram Reel about Slidespoken, made with [Remotion](https://www.remotion.dev) (React + TypeScript) and FFmpeg. This folder is isolated from the Next.js app: it has its own `package.json` and is excluded from the app's TypeScript and ESLint config.

## Render

```bash
cd video
npm install
npm run build        # Remotion render + FFmpeg mix -> out/slidespoken-reel.mp4 and .srt
npm run studio       # live preview in the browser
```

The voice-over and sound files in `public/audio` are committed, so rendering needs no API key. To regenerate them:

```bash
npm run voiceover    # OpenAI TTS (gpt-4o-mini-tts, AI voice); reads OPENAI_API_KEY or ../.env.local
npm run sfx          # whoosh, pop and music bed generated with FFmpeg (no external assets)
```

If you change the voice-over text in `scripts/voiceover-lines.mjs`, run `npm run voiceover`, then update `public/audio/durations.json` with each clip's length (`ffprobe -show_entries format=duration`), because scene lengths follow the voice-over.

## Contents

- Scenes: hook, problem, intro, features (languages, live captions, layouts and voice commands), how it works, grounded slides, ending (`src/scenes.tsx`).
- Screenshots in `public/shots` are real captures of the app (`../screenshots` and the landing page).
- The "Adoption up 300%" card is labelled as an example of what other AI tools do; it is not a Slidespoken result.
- No third-party music is used. Rendered videos go to `out/`, which is gitignored.
