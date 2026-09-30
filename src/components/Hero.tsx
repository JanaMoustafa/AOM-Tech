"use client";

import { motion, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { hero } from "@/content/site";
import { EASE, Magnetic, RevealText } from "./fx";
import { ParticleWordmark } from "./ParticleWordmark";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  // A soft light that trails the cursor across the hero.
  const mx = useSpring(useMotionValue(-1000), { stiffness: 90, damping: 20 });
  const my = useSpring(useMotionValue(-1000), { stiffness: 90, damping: 20 });
  const spotlight = useMotionTemplate`radial-gradient(600px circle at ${mx}px ${my}px, rgb(140 82 255 / 0.22), transparent 60%)`;

  return (
    <section
      id="top"
      ref={ref}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      className="grain relative isolate flex min-h-svh flex-col overflow-hidden pb-10 pt-24 md:pb-20 md:pt-28"
    >
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="animate-drift absolute -left-[15%] top-[5%] h-[60vmax] w-[60vmax] rounded-full bg-violet/25 blur-[120px]" />
        <div className="animate-drift-slow absolute -right-[20%] top-[25%] h-[55vmax] w-[55vmax] rounded-full bg-pink/20 blur-[120px]" />
        <div className="animate-drift absolute bottom-[-30%] left-[20%] h-[45vmax] w-[45vmax] rounded-full bg-blue/20 blur-[120px]" />
      </div>
      <motion.div aria-hidden style={{ background: spotlight }} className="pointer-events-none absolute inset-0 -z-10" />

      <div className="relative mx-auto w-full max-w-7xl flex-1 px-5 sm:px-8">
        <div className="relative h-full min-h-[34svh] md:min-h-[42svh]">
          <ParticleWordmark />
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0, letterSpacing: "0.1em" }}
        animate={{ opacity: 1, letterSpacing: "0.42em" }}
        transition={{ delay: 2.3, duration: 1.4, ease: EASE }}
        className="mx-auto mb-10 mt-2 text-center font-display text-sm text-paper/80 md:mb-14 md:text-base"
      >
        AI. SOLUTIONS
      </motion.p>

      <motion.div
        style={{ y: copyY, opacity: copyOpacity }}
        className="mx-auto grid w-full max-w-7xl gap-8 px-5 sm:px-8 md:grid-cols-12 md:items-end md:gap-10"
      >
        <RevealText
          as="h1"
          onMount
          delay={0.35}
          stagger={0.055}
          text={hero.headline}
          className="font-display text-[2.5rem] font-medium leading-[1.02] tracking-tight text-balance sm:text-5xl md:col-span-8 lg:text-[4.25rem]"
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8, ease: EASE }}
          className="md:col-span-4"
        >
          <p className="max-w-md text-base leading-relaxed text-mist md:text-lg">{hero.body}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Magnetic>
              <a
                href={hero.primaryCta.href}
                className="bg-brand relative inline-flex min-h-12 items-center overflow-hidden rounded-full px-6 font-medium text-white shadow-[0_10px_40px_-10px_rgb(140_82_255/0.7)] transition-transform duration-200 active:scale-[0.97]"
              >
                <span aria-hidden className="shine absolute inset-0" />
                <span className="relative">{hero.primaryCta.label}</span>
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href={hero.secondaryCta.href}
                className="inline-flex min-h-12 items-center rounded-full border border-paper/25 px-6 font-medium transition-colors duration-200 hover:border-paper/60 hover:bg-paper/5"
              >
                {hero.secondaryCta.label}
              </a>
            </Magnetic>
          </div>
        </motion.div>
      </motion.div>

      <motion.a
        href="#work"
        aria-label="Scroll to work"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.6, duration: 1 }}
        className="absolute bottom-5 left-1/2 hidden h-10 w-6 -translate-x-1/2 justify-center rounded-full border border-paper/30 pt-2 md:flex"
      >
        <span className="scroll-dot h-2 w-1 rounded-full bg-paper/80" />
      </motion.a>
    </section>
  );
}
