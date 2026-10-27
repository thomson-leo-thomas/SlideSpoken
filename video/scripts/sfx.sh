#!/usr/bin/env bash
# Generates original, license-free sound effects and a soft music bed with FFmpeg (no external assets).
set -euo pipefail
cd "$(dirname "$0")/../public/audio"
ffmpeg -y -loglevel error -f lavfi -i "anoisesrc=d=0.5:c=pink:a=0.6" -af "highpass=f=700,lowpass=f=6000,afade=t=in:d=0.18,afade=t=out:st=0.18:d=0.32,volume=0.7" -ar 48000 whoosh.wav
ffmpeg -y -loglevel error -f lavfi -i "sine=f=1046:d=0.09" -af "afade=t=out:st=0:d=0.09,volume=0.5" -ar 48000 pop.wav
ffmpeg -y -loglevel error -f lavfi -i "aevalsrc='0.06*sin(2*PI*110*t)+0.045*sin(2*PI*164.81*t)+0.035*sin(2*PI*220*t)+0.025*sin(2*PI*329.63*t)*(0.6+0.4*sin(2*PI*0.25*t))':s=48000:d=60" -af "lowpass=f=1200,afade=t=in:d=2,afade=t=out:st=55:d=5" bed.wav
echo "sfx ok"
