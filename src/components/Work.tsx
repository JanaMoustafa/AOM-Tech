"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { projects } from "@/content/site";
import { RevealText } from "./fx";
import { ProjectCard } from "./ProjectCard";
import { currentScroll, scrollToY } from "./SmoothScroll";
import { useMediaQuery, usePrefersReducedMotion } from "./useMediaQuery";

const visible = projects.filter((p) => !p.hidden);

function Intro() {
  return (
    <div className="max-w-2xl">
      <RevealText
        text="Selected work"
        className="font-display text-4xl font-medium tracking-tight sm:text-5xl lg:text-6xl"
      />
      <p className="mt-4 text-lg leading-relaxed text-mist">
        Healthcare AI published in a peer-reviewed journal, a medical imaging model, an app people use every day,
        and two products on the way.
      </p>
    </div>
  );
}

export function Work() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const reduce = usePrefersReducedMotion();

  return (
    <section id="work" aria-label="Selected work" className="relative scroll-mt-16">
      {isDesktop && !reduce ? <HorizontalWork /> : <StackedWork />}
    </section>
  );
}

function StackedWork() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-32">
      <Intro />
      <div className="mt-12 grid gap-6 md:gap-8">
        {visible.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </div>
  );
}

// Vertical px of page scroll per horizontal px the cards travel. Lower = less scrolling.
const SPEED = 0.6;

// Vertical scroll drives a horizontal track while the section is pinned.
// Arrows, numbered dots, ← → keys and sideways trackpad swipes also move it,
// and it settles on the nearest card when you stop close to one.
function HorizontalWork() {
  const target = useRef<HTMLDivElement>(null);
  const sticky = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [distance, setDistance] = useState(0);
  const [stops, setStops] = useState<number[]>([]);
  const [active, setActive] = useState(-1);

  useLayoutEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => {
      const d = Math.max(0, el.scrollWidth - window.innerWidth);
      setDistance(d);
      // Progress at which each card sits centered on screen.
      setStops(
        cardRefs.current.map((card) => {
          if (!card || !d) return 0;
          const center = card.offsetLeft + card.offsetWidth / 2 - window.innerWidth / 2;
          return Math.min(1, Math.max(0, center / d));
        }),
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  // Background type drifts at a fraction of the card speed for depth.
  const bgX = useTransform(scrollYProgress, [0, 1], [0, -distance * 0.35]);

  const progressToY = useCallback((p: number) => {
    const el = target.current;
    if (!el) return 0;
    const top = window.scrollY + el.getBoundingClientRect().top;
    return top + p * (el.offsetHeight - window.innerHeight);
  }, []);

  // The card we're heading to, so quick repeated presses chain instead of
  // reading the position mid-animation.
  const heading = useRef<{ index: number; at: number } | null>(null);

  const goTo = useCallback(
    (i: number) => {
      heading.current = { index: i, at: performance.now() };
      if (i < 0) scrollToY(progressToY(0));
      else if (stops[i] !== undefined) scrollToY(progressToY(stops[i]));
    },
    [stops, progressToY],
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      const h = heading.current;
      if (h && performance.now() - h.at < 1000) {
        goTo(Math.min(stops.length - 1, Math.max(-1, h.index + dir)));
        return;
      }
      const p = scrollYProgress.get();
      if (dir === 1) {
        const next = stops.findIndex((s) => s > p + 0.01);
        if (next !== -1) goTo(next);
      } else {
        let prev = -1;
        stops.forEach((s, i) => s < p - 0.01 && (prev = i));
        goTo(prev);
      }
    },
    [stops, goTo, scrollYProgress],
  );

  // Track which card is centered, and gently settle onto it after scrolling stops.
  const settle = useRef<ReturnType<typeof setTimeout>>(undefined);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!stops.length) return;
    let nearest = 0;
    stops.forEach((s, i) => Math.abs(s - p) < Math.abs(stops[nearest] - p) && (nearest = i));
    setActive(p < stops[0] / 2 ? -1 : nearest);

    clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      const q = scrollYProgress.get();
      const gap = Math.abs(stops[nearest] - q);
      // Leave the intro alone; between cards, always settle on the nearest one.
      if (q > stops[0] * 0.5 && q < 0.999 && gap > 0.003) goTo(nearest);
    }, 260);
  });
  useEffect(() => () => clearTimeout(settle.current), []);

  const pinned = () => {
    const r = target.current?.getBoundingClientRect();
    return !!r && r.top <= 1 && r.bottom >= window.innerHeight - 1;
  };

  // ← → keys while the section is pinned.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea, [contenteditable]")) return;
      if (!pinned()) return;
      e.preventDefault();
      step(e.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  // Sideways trackpad swipes move the cards too.
  useEffect(() => {
    const el = sticky.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      e.stopPropagation();
      scrollToY(currentScroll() + e.deltaX * SPEED, { immediate: true });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div ref={target} style={{ height: `calc(100svh + ${distance * SPEED}px)` }} className="relative">
      <div ref={sticky} className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <motion.p
          aria-hidden
          style={{ x: bgX }}
          className="pointer-events-none absolute left-0 top-[calc(50%-11vw)] whitespace-nowrap pl-[8vw] font-display text-[22vw] font-semibold leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/0.07)]"
        >
          Selected work
        </motion.p>
        <motion.div
          ref={track}
          style={{ x }}
          className="flex w-max items-center gap-8 pl-[max(2rem,calc((100vw-80rem)/2+2rem))] pr-[max(10vw,calc((100vw-1120px)/2))]"
        >
          <div className="w-[min(420px,30vw)] shrink-0">
            <Intro />
            <p className="mt-8 flex items-center gap-3 text-sm text-mist">
              <span aria-hidden className="bg-brand h-px w-12" />
              Scroll, swipe sideways or use the arrows
            </p>
          </div>
          {visible.map((p, i) => (
            <div key={p.slug} ref={(el) => void (cardRefs.current[i] = el)} className="shrink-0">
              <ProjectCard project={p} wide />
            </div>
          ))}
        </motion.div>

        <nav aria-label="Projects" className="mx-auto mt-8 flex items-center gap-4">
          <ArrowButton label="Previous project" onClick={() => step(-1)} disabled={active === -1}>
            <ArrowLeft className="h-5 w-5" />
          </ArrowButton>
          <ol className="flex items-center gap-1">
            {visible.map((p, i) => (
              <li key={p.slug}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to ${p.name}`}
                  aria-current={active === i ? "true" : undefined}
                  className="group flex h-11 items-center gap-2 rounded-full px-3 text-sm"
                >
                  <span
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      active === i ? "bg-brand w-10" : "w-4 bg-paper/25 group-hover:bg-paper/60"
                    }`}
                  />
                  <span
                    className={`font-display transition-colors ${
                      active === i ? "text-paper" : "text-mist/70 group-hover:text-paper"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <ArrowButton label="Next project" onClick={() => step(1)} disabled={active === visible.length - 1}>
            <ArrowRight className="h-5 w-5" />
          </ArrowButton>
        </nav>
      </div>
    </div>
  );
}

function ArrowButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-11 w-11 place-items-center rounded-full border border-paper/20 text-paper transition-[background-color,border-color,opacity] duration-200 hover:border-paper/60 hover:bg-paper/10 disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}
