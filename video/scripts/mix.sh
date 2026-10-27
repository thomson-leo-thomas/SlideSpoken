#!/usr/bin/env bash
# Final encode with FFmpeg: loudness-normalised audio, web-friendly MP4, plus an .srt subtitle file.
set -euo pipefail
cd "$(dirname "$0")/.."
ffmpeg -y -loglevel error -i out/reel-silent.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k -movflags +faststart out/slidespoken-reel.mp4
node scripts/srt.mjs > out/slidespoken-reel.srt
echo "Wrote out/slidespoken-reel.mp4 and out/slidespoken-reel.srt"
