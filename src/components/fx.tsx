"use client";

// Shared motion building blocks. Each one renders its final, readable state
// for reduced-motion users.

import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { type ElementType, type ReactNode, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./useMediaQuery";

export const EASE = [0.16, 1, 0.3, 1] as const;

/** Heading whose words rise out of a mask, one after another, when scrolled into view. */
export function RevealText({
  text,
  as: Tag = "h2",
  className = "",
  delay = 0,
  stagger = 0.06,
  onMount = false,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  /** Animate on page load instead of on scroll. */
  onMount?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const reduce = usePrefersReducedMotion();
  const show = reduce || onMount || inView;
  const words = text.split(" ");

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => {
        const content = `${word}${i < words.length - 1 ? "\u00a0" : ""}`;
        return (
          <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.1em] align-bottom">
            {onMount ? (
              // Page-load reveals run in CSS so they start at first paint,
              // without waiting for JavaScript to download and hydrate.
              <span className="rise" style={{ animationDelay: `${delay + i * stagger}s` }}>
                {content}
              </span>
            ) : reduce ? (
              <span className="inline-block">{content}</span>
            ) : (
              <motion.span
                className="inline-block will-change-transform"
                initial={{ y: "110%", rotate: 4 }}
                animate={show ? { y: 0, rotate: 0 } : undefined}
                transition={{ delay: delay + i * stagger, duration: 0.95, ease: EASE }}
              >
                {content}
              </motion.span>
            )}
          </span>
        );
      })}
    </Tag>
  );
}

/** Pulls its child toward the pointer while hovered, then springs back. */
export function Magnetic({
  children,
  strength = 0.35,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = usePrefersReducedMotion();
  const x = useSpring(0, { stiffness: 220, damping: 16, mass: 0.4 });
  const y = useSpring(0, { stiffness: 220, damping: 16, mass: 0.4 });

  if (reduce) return <span className={`inline-flex ${className}`}>{children}</span>;

  return (
    <motion.span
      ref={ref}
      style={{ x, y }}
      className={`inline-flex ${className}`}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

/**
 * Counts a metric up from zero when it scrolls into view, keeping its prefix,
 * suffix and decimal places ("86.6%", "5.2 g", "0.986"). Non-numeric values
 * ("1 tap" still counts; "ID" would not) render as-is.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = usePrefersReducedMotion();
  const match = value.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!match || reduce || !inView) return;
    const [, prefix, num, suffix] = match;
    const target = parseFloat(num);
    const decimals = num.includes(".") ? num.split(".")[1].length : 0;
    const controls = animate(0, target, {
      duration: 1.6,
      ease: EASE,
      onUpdate: (v) => setDisplay(`${prefix}${v.toFixed(decimals)}${suffix}`),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

/** 3D tilt toward the pointer, plus a soft light that follows it. Mouse only. */
export function Tilt({
  children,
  className = "",
  max = 6,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const glow = useMotionValue(0);
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 160, damping: 20 });
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 160, damping: 20 });
  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const glowOpacity = useSpring(glow, { stiffness: 200, damping: 30 });
  const light = useMotionTemplate`radial-gradient(520px circle at ${gx} ${gy}, rgb(226 169 241 / 0.16), transparent 45%)`;

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <div style={{ perspective: 1400 }} className={className}>
      <motion.div
        ref={ref}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="relative h-full w-full rounded-[inherit]"
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse" || !ref.current) return;
          const r = ref.current.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width);
          py.set((e.clientY - r.top) / r.height);
          glow.set(1);
        }}
        onPointerLeave={() => {
          px.set(0.5);
          py.set(0.5);
          glow.set(0);
        }}
      >
        {children}
        <motion.div
          aria-hidden
          style={{ background: light, opacity: glowOpacity }}
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
        />
      </motion.div>
    </div>
  );
}
