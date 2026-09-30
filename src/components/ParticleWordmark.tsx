"use client";

import { useEffect, useRef } from "react";

type RGB = [number, number, number];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  // Home in the logo-mark formation and in the wordmark formation.
  lx: number;
  ly: number;
  tx: number;
  ty: number;
  logoColor: RGB;
  textColor: RGB;
  textStyle: string;
  size: number;
  phase: number;
  // Direction the particle drifts when the hero scrolls away.
  sx: number;
  sy: number;
};

// Brand gradient stops, sampled left → right across the wordmark.
const STOPS: [number, RGB][] = [
  [0, [91, 108, 255]],
  [0.45, [140, 82, 255]],
  [1, [255, 102, 196]],
];

function gradientAt(t: number): RGB {
  for (let i = 1; i < STOPS.length; i++) {
    const [t1, c1] = STOPS[i];
    const [t0, c0] = STOPS[i - 1];
    if (t <= t1) {
      const k = (t - t0) / (t1 - t0);
      return [0, 1, 2].map((j) => Math.round(c0[j] + (c1[j] - c0[j]) * k)) as RGB;
    }
  }
  return STOPS[STOPS.length - 1][1];
}

const rgb = (c: RGB) => `rgb(${c[0]} ${c[1]} ${c[2]})`;

// The AOM Tech mark (see Logo.tsx), in a 46×100 box.
const MARK: { d: string; fill: string }[] = [
  { d: "M0 21 L35 1 L35 41 Z", fill: "#8c52ff" },
  { d: "M0 50 L35 30 L35 70 Z", fill: "#e2a9f1" },
  { d: "M0 79 L35 59 L35 99 Z", fill: "#ff66c4" },
  { d: "M41.5 1 H44.5 V99 H41.5 Z", fill: "#ffffff" },
];

// Timeline of the intro, in ms from first paint.
const FORM_LOGO = 0;
const MORPH_AT = 1900;
const BLEND_MS = 900;

/**
 * Particles gather into the AOM Tech mark, then break apart and re-form as the
 * "AOM" wordmark. The pointer pushes them aside, a click sends a shockwave,
 * and scrolling away scatters them upward. Reduced-motion users get the
 * settled wordmark as a still image.
 */
export function ParticleWordmark({ text = "AOM" }: { text?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;
    let visible = true;
    let startedAt = -1;
    let introDone = reduce;
    const pointer = { x: -9999, y: -9999, active: false };

    const sample = (draw: (c: CanvasRenderingContext2D) => void, gap: number) => {
      const off = document.createElement("canvas");
      off.width = Math.ceil(width);
      off.height = Math.ceil(height);
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return [];
      draw(octx);
      const data = octx.getImageData(0, 0, off.width, off.height).data;
      const points: { x: number; y: number; c: RGB }[] = [];
      for (let y = 0; y < off.height; y += gap) {
        for (let x = 0; x < off.width; x += gap) {
          const i = (y * off.width + x) * 4;
          if (data[i + 3] > 128) points.push({ x, y, c: [data[i], data[i + 1], data[i + 2]] });
        }
      }
      return points;
    };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (!width || !height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const gap = width < 640 ? 4 : 6;
      const family = getComputedStyle(canvas).fontFamily;

      const textPoints = sample((c) => {
        let size = height * 0.95;
        c.font = `600 ${size}px ${family}`;
        const measured = c.measureText(text).width;
        if (measured > width * 0.94) size *= (width * 0.94) / measured;
        c.font = `600 ${size}px ${family}`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillStyle = "#fff";
        c.fillText(text, width / 2, height / 2 + size * 0.04);
      }, gap);

      const logoPoints = sample((c) => {
        const scale = (height * 0.86) / 100;
        c.translate(width / 2 - 23 * scale, height * 0.07);
        c.scale(scale, scale);
        for (const part of MARK) {
          c.fillStyle = part.fill;
          c.fill(new Path2D(part.d));
        }
      }, Math.max(3, gap - 2));

      if (!textPoints.length || !logoPoints.length) return;
      let minX = Infinity;
      let maxX = -Infinity;
      for (const p of textPoints) {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
      }
      const span = Math.max(1, maxX - minX);

      // Shuffle the logo points so the morph looks like a swarm, not a slide.
      for (let i = logoPoints.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [logoPoints[i], logoPoints[j]] = [logoPoints[j], logoPoints[i]];
      }

      particles = textPoints.map((t, i) => {
        const l = logoPoints[i % logoPoints.length];
        const jitter = i >= logoPoints.length ? gap * 0.8 : 0;
        const textColor = gradientAt((t.x - minX) / span);
        const settled = introDone;
        return {
          x: settled ? t.x : width / 2 + (Math.random() - 0.5) * width * 1.4,
          y: settled ? t.y : height / 2 + (Math.random() - 0.5) * height * 2.2,
          vx: 0,
          vy: 0,
          lx: l.x + (Math.random() - 0.5) * jitter,
          ly: l.y + (Math.random() - 0.5) * jitter,
          tx: t.x,
          ty: t.y,
          logoColor: l.c,
          textColor,
          textStyle: rgb(textColor),
          size: gap * (0.42 + Math.random() * 0.3),
          phase: Math.random() * Math.PI * 2,
          sx: (Math.random() - 0.5) * width * 0.5,
          sy: 120 + Math.random() * height * 1.6,
        };
      });
    };

    const shockwave = (x: number, y: number) => {
      const radius = Math.max(220, width * 0.22);
      for (const p of particles) {
        const dx = p.x - x;
        const dy = p.y - y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        if (d < radius) {
          const force = (1 - d / radius) * 34;
          p.vx += (dx / d) * force;
          p.vy += (dy / d) * force;
        }
      }
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      if (startedAt < 0) startedAt = now;
      const t = now - startedAt;

      if (!introDone && t >= MORPH_AT) {
        introDone = true;
        // A small outward kick as the mark breaks apart.
        shockwave(width / 2, height / 2);
      }
      const blend = reduce ? 1 : Math.min(1, Math.max(0, (t - MORPH_AT) / BLEND_MS));
      const scatter = reduce ? 0 : Math.min(1, window.scrollY / Math.max(1, window.innerHeight));
      const scatterEase = scatter * scatter;
      const radius = Math.max(70, width * 0.08);
      const spring = t < MORPH_AT ? 0.012 + Math.min(1, (t - FORM_LOGO) / 1200) * 0.012 : 0.018;

      for (const p of particles) {
        if (!reduce) {
          const inText = introDone;
          const baseX = inText ? p.tx : p.lx;
          const baseY = inText ? p.ty : p.ly;
          const hx = baseX + Math.sin(t * 0.0011 + p.phase) * 0.9 + p.sx * scatterEase;
          const hy = baseY + Math.cos(t * 0.0013 + p.phase) * 0.9 - p.sy * scatterEase;
          p.vx += (hx - p.x) * spring;
          p.vy += (hy - p.y) * spring;

          if (pointer.active) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < radius * radius) {
              const d = Math.sqrt(d2) || 1;
              const force = (1 - d / radius) * 7;
              p.vx += (dx / d) * force;
              p.vy += (dy / d) * force;
            }
          }
          p.vx *= 0.86;
          p.vy *= 0.86;
          p.x += p.vx;
          p.y += p.vy;
        }

        if (blend >= 1) {
          ctx.fillStyle = p.textStyle;
        } else {
          const c0 = p.logoColor;
          const c1 = p.textColor;
          ctx.fillStyle = `rgb(${c0[0] + (c1[0] - c0[0]) * blend} ${c0[1] + (c1[1] - c0[1]) * blend} ${c0[2] + (c1[2] - c0[2]) * blend})`;
        }
        ctx.globalAlpha = 1 - scatter * 0.6;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      draw(now);
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduce || !visible || document.hidden) return;
      running = true;
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = pointer.y > -40 && pointer.y < rect.height + 40;
    };
    const onDown = (e: PointerEvent) => {
      onPointer(e);
      if (pointer.active && introDone && !reduce) shockwave(pointer.x, pointer.y);
    };
    const onLeave = () => (pointer.active = false);
    const onUp = (e: PointerEvent) => e.pointerType === "touch" && onLeave();
    const onVisibility = () => (document.hidden ? stop() : start());

    let lastWidth = 0;
    const resizeObserver = new ResizeObserver(() => {
      // Mobile browsers resize the viewport height as the toolbar hides;
      // only rebuild when the width really changes.
      const w = canvas.getBoundingClientRect().width;
      if (Math.abs(w - lastWidth) < 2 && particles.length) return;
      lastWidth = w;
      build();
      if (reduce) draw(0);
    });
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });

    let disposed = false;
    document.fonts.ready.then(() => {
      if (disposed) return;
      build();
      lastWidth = width;
      if (reduce) draw(0);
      resizeObserver.observe(canvas);
      intersection.observe(canvas);
      start();
    });
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      stop();
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [text]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={text}
      className="absolute inset-0 h-full w-full font-display"
    />
  );
}
