"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { team } from "@/content/site";
import { EASE, RevealText, Tilt } from "./fx";

export function Team() {
  return (
    <section id="team" className="relative scroll-mt-16 border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-32">
        <div className="max-w-2xl">
          <RevealText
            text="The people behind AOM"
            className="font-display text-4xl font-medium tracking-tight sm:text-5xl lg:text-6xl"
          />
          <p className="mt-4 text-lg leading-relaxed text-mist">
            A small team that designs, builds and ships every project end to end.
          </p>
        </div>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {team.map((m, i) => (
            <motion.li
              key={m.name}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ delay: i * 0.12, duration: 1, ease: EASE }}
            >
              <Tilt max={5} className="group relative rounded-[29px]">
                <div
                  aria-hidden
                  className="absolute -inset-px overflow-hidden rounded-[29px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                >
                  <div className="ring-spin absolute left-1/2 top-1/2 aspect-square w-[160%] -translate-x-1/2 -translate-y-1/2" />
                </div>
                <article className="relative overflow-hidden rounded-[28px] border border-line bg-ink-2">
                  {/* One shared backdrop for every portrait, in the brand colours. */}
                  <div className="grain relative aspect-[4/5] overflow-hidden bg-ink-3">
                    <div
                      aria-hidden
                      className="absolute left-1/2 top-[18%] h-[70%] w-[90%] -translate-x-1/2 rounded-full bg-violet/45 blur-3xl transition-[opacity,transform] duration-700 group-hover:scale-110 group-hover:opacity-100 md:opacity-80"
                    />
                    <div aria-hidden className="absolute -bottom-10 -right-10 h-1/2 w-1/2 rounded-full bg-pink/25 blur-3xl" />
                    <div aria-hidden className="absolute -bottom-16 -left-10 h-1/2 w-1/2 rounded-full bg-blue/20 blur-3xl" />
                    <svg
                      viewBox="0 0 46 100"
                      aria-hidden
                      className="absolute left-1/2 top-[6%] h-[80%] -translate-x-1/2 opacity-[0.07]"
                    >
                      <path d="M0 21 L35 1 L35 41 Z" fill="#fff" />
                      <path d="M0 50 L35 30 L35 70 Z" fill="#fff" />
                      <path d="M0 79 L35 59 L35 99 Z" fill="#fff" />
                      <rect x="41.5" y="1" width="3" height="98" fill="#fff" />
                    </svg>
                    <Image
                      src={m.photo}
                      alt={`${m.name}, ${m.role}`}
                      fill
                      sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out-expo [mask-image:linear-gradient(to_bottom,black_62%,transparent_94%)] group-hover:scale-[1.04]"
                    />
                  </div>

                  <div className="relative -mt-20 flex items-end justify-between gap-4 px-6 pb-6 sm:px-7 sm:pb-7">
                    <div>
                      <h3 className="font-display text-2xl font-medium tracking-tight sm:text-[1.75rem]">{m.name}</h3>
                      <p className="mt-1 text-lilac">{m.role}</p>
                    </div>
                    {m.linkedin && (
                      <a
                        href={m.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${m.name} on LinkedIn`}
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-paper/20 bg-ink/40 backdrop-blur transition-colors hover:border-paper/60 hover:bg-paper hover:text-ink"
                      >
                        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
                          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </article>
              </Tilt>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
