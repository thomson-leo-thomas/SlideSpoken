"use client";

import { useEffect, useRef } from "react";

interface Props {
  levelRef: { current: number };
  /** Element that receives the smoothed `--voice` (0..1) CSS variable every frame. */
  targetRef: { current: HTMLElement | null };
  /** Changing this re-reads the theme colours. */
  theme: string | undefined;
}

interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  hue: 0 | 1;
  phase: number;
}

const COUNT = 46;

function particle(w: number, h: number, anywhere: boolean): Particle {
  return {
    x: Math.random() * w,
    y: anywhere ? Math.random() * h : h + 10,
    r: 0.6 + Math.random() * 2.2,
    vx: (Math.random() - 0.5) * 0.25,
    vy: -(0.15 + Math.random() * 0.45),
    hue: Math.random() < 0.5 ? 0 : 1,
    phase: Math.random() * Math.PI * 2,
  };
}

/** Voice-reactive particles and a sound-wave ribbon drawn behind the slide content. */
export function VoiceFx({ levelRef, targetRef, theme }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const style = getComputedStyle(canvas);
    const colors = [style.getPropertyValue("--s-accent").trim() || "#818cf8", style.getPropertyValue("--s-accent2").trim() || "#e879f9"];

    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (particles.length === 0) particles = Array.from({ length: COUNT }, () => particle(w, h, true));
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let voice = 0;
    let written = -1;
    let t = 0;
    let raf = 0;
    const frame = () => {
      const target = Math.min(1, levelRef.current * 10);
      voice += (target - voice) * (target > voice ? 0.35 : 0.08);
      if (Math.abs(voice - written) > 0.01) {
        written = voice;
        targetRef.current?.style.setProperty("--voice", voice.toFixed(3));
      }
      t += 1;

      ctx.clearRect(0, 0, w, h);
      if (!reduced) {
        const boost = 1 + voice * 5;
        for (const p of particles) {
          p.x += p.vx * boost + Math.sin((t + p.phase * 100) / 60) * 0.15;
          p.y += p.vy * boost;
          if (p.y < -10 || p.x < -10 || p.x > w + 10) Object.assign(p, particle(w, h, false));
          ctx.globalAlpha = 0.25 + voice * 0.6;
          ctx.fillStyle = colors[p.hue];
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * (1 + voice * 1.4), 0, Math.PI * 2);
          ctx.fill();
        }

        // Sound-wave ribbon along the bottom edge.
        const amp = 2 + voice * h * 0.07;
        for (let line = 0; line < 2; line++) {
          ctx.globalAlpha = (line ? 0.25 : 0.45) * (0.4 + voice);
          ctx.strokeStyle = colors[line];
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let x = 0; x <= w; x += 6) {
            const y = h - 18 - amp * Math.sin(x / (55 + line * 25) + t / (14 - line * 4)) * Math.sin((x / w) * Math.PI);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [levelRef, targetRef, theme]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />;
}
