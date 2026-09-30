"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { useState } from "react";
import { contact, site } from "@/content/site";
import { EASE, Magnetic, RevealText } from "./fx";

export function Contact() {
  const [copied, setCopied] = useState(false);
  const linkedin = site.socials.find((s) => s.label === "LinkedIn");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${site.email}`;
    }
  };

  return (
    <section id="contact" className="grain relative isolate scroll-mt-16 overflow-hidden border-t border-line">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="animate-drift absolute -bottom-1/2 left-1/2 h-[70vmax] w-[70vmax] -translate-x-1/2 rounded-full bg-violet/30 blur-[140px]" />
        <div className="animate-drift-slow absolute -bottom-1/3 right-0 h-[40vmax] w-[40vmax] rounded-full bg-pink/25 blur-[120px]" />
      </div>

      {/* The brand mark assembles itself: triangles fly in one by one, then the bar drops. */}
      <motion.svg
        aria-hidden
        viewBox="0 0 46 100"
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, amount: 0.4 }}
        className="pointer-events-none absolute right-[6%] top-[15%] hidden h-[70%] overflow-visible drop-shadow-[0_0_60px_rgb(140_82_255/0.5)] lg:block"
      >
        {[
          { d: "M0 21 L35 1 L35 41 Z", fill: "#8c52ff" },
          { d: "M0 50 L35 30 L35 70 Z", fill: "#e2a9f1" },
          { d: "M0 79 L35 59 L35 99 Z", fill: "#ff66c4" },
        ].map((t, i) => (
          <motion.path
            key={i}
            d={t.d}
            fill={t.fill}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            variants={{
              hidden: { x: 90, rotate: -35, opacity: 0 },
              shown: { x: 0, rotate: 0, opacity: 1, transition: { delay: 0.15 + i * 0.16, duration: 1.1, ease: EASE } },
            }}
          />
        ))}
        <motion.rect
          x="41.5"
          y="1"
          width="3"
          height="98"
          fill="#ffffff"
          style={{ transformBox: "fill-box", transformOrigin: "top" }}
          variants={{
            hidden: { scaleY: 0 },
            shown: { scaleY: 1, transition: { delay: 0.75, duration: 0.9, ease: EASE } },
          }}
        />
      </motion.svg>

      <div className="relative mx-auto max-w-7xl px-5 py-28 sm:px-8 md:py-40">
        <RevealText
          text={contact.headline}
          stagger={0.08}
          className="max-w-4xl font-display text-[2.75rem] font-medium leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-[5.5rem]"
        />
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist">{contact.body}</p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Magnetic strength={0.2} className="w-full sm:w-auto">
            <div className="flex w-full items-stretch overflow-hidden rounded-full bg-paper text-ink">
              <a
                href={`mailto:${site.email}`}
                className="inline-flex min-h-14 flex-1 items-center gap-3 pl-6 pr-4 font-medium transition-colors hover:bg-lilac/40"
              >
                <Mail className="h-5 w-5" aria-hidden />
                <span className="break-all">{site.email}</span>
              </a>
              <button
                type="button"
                onClick={copy}
                aria-label={copied ? "Email copied" : "Copy email address"}
                className="grid w-14 shrink-0 place-items-center border-l border-ink/10 transition-colors hover:bg-lilac/40"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={copied ? "done" : "copy"}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {copied ? <Check className="h-5 w-5 text-violet" /> : <Copy className="h-5 w-5" />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </Magnetic>

          {linkedin && (
            <Magnetic strength={0.2} className="w-full sm:w-auto">
              <a
                href={linkedin.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full border border-paper/25 px-6 font-medium transition-colors hover:border-paper/60 hover:bg-paper/5"
              >
                Follow us on LinkedIn
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            </Magnetic>
          )}
        </div>
        <p aria-live="polite" className="sr-only">
          {copied ? "Email address copied to clipboard" : ""}
        </p>
      </div>
    </section>
  );
}
