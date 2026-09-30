"use client";

import { type MotionValue, motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { process } from "@/content/site";
import { RevealText } from "./fx";
import { usePrefersReducedMotion } from "./useMediaQuery";

function Step({
  index,
  total,
  progress,
  title,
  body,
}: {
  index: number;
  total: number;
  progress: MotionValue<number>;
  title: string;
  body: string;
}) {
  // Light up as the drawn line reaches this step.
  const at = total > 1 ? index / (total - 1) : 0;
  const lit = useTransform(progress, [Math.max(0, at - 0.08), at], [0, 1]);
  const scale = useTransform(lit, [0, 0.6, 1], [1, 1.25, 1]);
  const textOpacity = useTransform(lit, [0, 1], [0.35, 1]);
  const x = useTransform(lit, [0, 1], [16, 0]);
  const reduce = usePrefersReducedMotion();

  return (
    <li className="relative flex gap-6 pb-14 last:pb-0 md:gap-8">
      <motion.span
        style={{ scale }}
        className="relative z-10 grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-ink-2 font-display text-sm"
      >
        <motion.span style={{ opacity: lit }} className="bg-brand absolute inset-0" />
        <span className="relative">{index + 1}</span>
      </motion.span>
      <motion.div style={reduce ? { opacity: 1, x: 0 } : { opacity: textOpacity, x }} className="pt-1">
        <h3 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">{title}</h3>
        <p className="mt-3 max-w-lg leading-relaxed text-mist">{body}</p>
      </motion.div>
    </li>
  );
}

export function Process() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  return (
    <section id="process" className="relative scroll-mt-16 border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 md:py-32 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <RevealText
              text="How we work"
              className="font-display text-4xl font-medium tracking-tight sm:text-5xl lg:text-6xl"
            />
            <p className="mt-4 max-w-md text-lg leading-relaxed text-mist">
              Four stages, and we only move to the next one when the last one has proven itself.
            </p>
          </div>
        </div>

        <ol ref={ref} className="relative lg:col-span-7">
          <div aria-hidden className="absolute bottom-6 left-[19px] top-6 w-px bg-line">
            <motion.div
              style={{ scaleY: fill }}
              className="h-full w-full origin-top bg-gradient-to-b from-blue via-violet to-pink shadow-[0_0_12px_rgb(255_102_196/0.8)]"
            />
          </div>
          {process.map((step, i) => (
            <Step key={step.title} index={i} total={process.length} progress={fill} title={step.title} body={step.body} />
          ))}
        </ol>
      </div>
    </section>
  );
}
