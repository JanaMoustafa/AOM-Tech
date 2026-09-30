"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { services } from "@/content/site";
import { EASE, RevealText } from "./fx";

export function Services() {
  const [open, setOpen] = useState(0);
  const baseId = useId();

  return (
    <section id="services" className="relative scroll-mt-16 border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 md:py-32 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <RevealText
              text="What we build"
              className="font-display text-4xl font-medium tracking-tight sm:text-5xl lg:text-6xl"
            />
            <p className="mt-4 max-w-md text-lg leading-relaxed text-mist">
              We take a model from notebook to production, and we&rsquo;re honest about what it can and can&rsquo;t do along
              the way.
            </p>
          </div>
        </div>

        <ul className="lg:col-span-7">
          {services.map((s, i) => {
            const isOpen = open === i;
            const panelId = `${baseId}-panel-${i}`;
            return (
              <motion.li
                key={s.title}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                transition={{ delay: i * 0.08, duration: 0.8, ease: EASE }}
                className="relative border-b border-line first:border-t"
              >
                <motion.span
                  aria-hidden
                  initial={false}
                  animate={{ scaleX: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="bg-brand absolute -bottom-px left-0 h-px w-full origin-left"
                />
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="group flex w-full items-center gap-5 py-6 text-left md:py-7"
                >
                  <svg viewBox="0 0 10 12" className="h-4 w-3.5 shrink-0" aria-hidden>
                    <path
                      d="M0 6 L10 0 L10 12Z"
                      className={`transition-colors duration-300 ${isOpen ? "fill-pink" : "fill-paper/20 group-hover:fill-lilac"}`}
                    />
                  </svg>
                  <span
                    className={`flex-1 font-display text-2xl font-medium tracking-tight transition-[color,transform] duration-300 group-hover:translate-x-2 sm:text-3xl ${
                      isOpen ? "text-paper" : "text-paper/65 group-hover:text-paper"
                    }`}
                  >
                    {s.title}
                  </span>
                  <Plus
                    aria-hidden
                    className={`h-6 w-6 shrink-0 text-mist transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-8 pl-9">
                        <p className="max-w-xl leading-relaxed text-mist">{s.summary}</p>
                        <ul className="mt-5 flex flex-wrap gap-2">
                          {s.deliverables.map((d) => (
                            <li key={d} className="rounded-full bg-paper/[0.06] px-3.5 py-1.5 text-sm text-paper/85">
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
