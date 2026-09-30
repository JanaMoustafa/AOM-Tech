"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { Fragment, useRef } from "react";
import { services } from "@/content/site";
import { usePrefersReducedMotion } from "./useMediaQuery";

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

function Triangle() {
  return (
    <svg viewBox="0 0 10 12" className="mx-[0.35em] inline-block h-[0.55em] w-[0.46em] align-middle" aria-hidden>
      <path d="M0 6 L10 0 L10 12Z" fill="url(#marquee-grad)" />
    </svg>
  );
}

// A row that drifts on its own and speeds up (and leans) with scroll velocity.
function Row({ items, baseVelocity, outline = false }: { items: string[]; baseVelocity: number; outline?: boolean }) {
  const reduce = usePrefersReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [0, 1000], [0, 5], { clamp: false });
  const skew = useTransform(velocity, [-2500, 2500], [10, -10]);
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    let move = direction.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    move += direction.current * move * f;
    baseX.set(baseX.get() + move);
  });

  // Two identical halves, each long enough to overflow wide screens.
  const half = [...items, ...items];
  const content = (
    <span className="flex shrink-0 items-center">
      {half.map((item, i) => (
        <Fragment key={i}>
          <span>{item}</span>
          <Triangle />
        </Fragment>
      ))}
    </span>
  );

  return (
    <motion.div
      aria-hidden
      style={{ x, skewX: reduce ? 0 : skew }}
      className={`flex w-max whitespace-nowrap font-display text-5xl font-medium tracking-tight sm:text-7xl lg:text-8xl ${
        outline ? "text-transparent [-webkit-text-stroke:1.5px_rgb(226_169_241/0.55)]" : "text-paper"
      }`}
    >
      {content}
      {content}
    </motion.div>
  );
}

export function Marquee() {
  const titles = services.map((s) => s.title);
  return (
    <section aria-label="What we do" className="relative overflow-hidden border-y border-line py-10 md:py-14">
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <linearGradient id="marquee-grad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#5b6cff" />
            <stop offset="0.45" stopColor="#8c52ff" />
            <stop offset="1" stopColor="#ff66c4" />
          </linearGradient>
        </defs>
      </svg>
      <p className="sr-only">{titles.join(", ")}</p>
      <div className="flex flex-col gap-2 md:gap-4">
        <Row items={titles} baseVelocity={-2.2} />
        <Row items={[...titles].reverse()} baseVelocity={2.2} outline />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ink md:w-40" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink md:w-40" />
    </section>
  );
}
