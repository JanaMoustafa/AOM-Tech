"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { team } from "@/content/site";
import { type CSSProperties, useRef } from "react";
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
                  <Portrait photo={m.photo} alt={`${m.name}, ${m.role}`} index={i} />

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

/**
 * One shared stage for every portrait, so photos taken in different places
 * look like one shoot: a brand-coloured backdrop that drifts on its own and
 * follows the pointer, a violet rim light around the person, and the same
 * colour grade laid over each cut-out.
 */
function Portrait({ photo, alt, index }: { photo: string; alt: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const fade = "linear-gradient(to bottom, black 60%, transparent 93%)";

  // Pointer position as CSS variables (-1..1); no React re-renders.
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--px", String(((e.clientX - r.left) / r.width) * 2 - 1));
    ref.current.style.setProperty("--py", String(((e.clientY - r.top) / r.height) * 2 - 1));
  };
  const onLeave = () => {
    ref.current?.style.setProperty("--px", "0");
    ref.current?.style.setProperty("--py", "0");
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ "--px": 0, "--py": 0 } as CSSProperties}
      className="portrait-stage grain relative aspect-[4/5] overflow-hidden bg-[#1c1930]"
    >
      {/* Backdrop: deep violet base with slow-drifting light, moving opposite the pointer for depth. */}
      <div aria-hidden className="portrait-layer absolute -inset-[12%]" style={{ "--depth": "-18px" } as CSSProperties}>
        <div
          className="animate-drift absolute left-[8%] top-[4%] h-[75%] w-[85%] rounded-full bg-violet/55 blur-3xl"
          style={{ animationDelay: `${index * -7}s` }}
        />
        <div
          className="animate-drift-slow absolute bottom-[2%] right-[-6%] h-[55%] w-[60%] rounded-full bg-pink/30 blur-3xl"
          style={{ animationDelay: `${index * -11}s` }}
        />
        <div className="animate-drift absolute bottom-[-4%] left-[-8%] h-[50%] w-[55%] rounded-full bg-blue/30 blur-3xl" />
        {/* Soft halo right behind the head */}
        <div className="absolute left-1/2 top-[30%] h-[46%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(226_169_241/0.5),transparent)]" />
        {/* Concentric rings, echoing the particle hero */}
        <svg viewBox="0 0 200 200" className="absolute left-1/2 top-[30%] w-[118%] -translate-x-1/2 -translate-y-1/2 opacity-[0.12]">
          {[40, 60, 80, 98].map((r) => (
            <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="#fff" strokeWidth="0.35" strokeDasharray="1 2.5" />
          ))}
        </svg>
      </div>

      {/* Spotlight that follows the pointer */}
      <div aria-hidden className="portrait-spot pointer-events-none absolute inset-0" />

      {/* The person, with a violet rim light and a gentle parallax */}
      <div className="portrait-layer absolute inset-0" style={{ "--depth": "8px" } as CSSProperties}>
        <div className="relative h-full w-full transition-transform duration-700 ease-out-expo group-hover:scale-[1.035]">
          <Image
            src={photo}
            alt={alt}
            fill
            quality={90}
            priority={false}
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            className="object-cover [filter:drop-shadow(0_0_1.5px_rgb(226_169_241/0.55))_drop-shadow(0_0_28px_rgb(140_82_255/0.45))]"
            style={{ maskImage: fade, WebkitMaskImage: fade }}
          />
          {/* Same colour grade on every cut-out, masked to the person's silhouette */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(160deg,rgb(140_82_255/0.55),rgb(26_20_60/0.2)_45%,rgb(255_102_196/0.45))] mix-blend-soft-light"
            style={{
              maskImage: `url(${photo}), ${fade}`,
              WebkitMaskImage: `url(${photo}), ${fade}`,
              maskComposite: "intersect",
              WebkitMaskComposite: "source-in",
              maskSize: "cover",
              WebkitMaskSize: "cover",
            }}
          />
        </div>
      </div>

      {/* Floor: grounds the portrait and hands off to the name below */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-ink-2 via-ink-2/70 to-transparent" />
    </div>
  );
}
