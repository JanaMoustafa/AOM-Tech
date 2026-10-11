"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/content/site";
import { CountUp, EASE, Tilt } from "./fx";
import { ProjectArt } from "./ProjectArt";

const statusStyle: Record<Project["status"], string> = {
  Live: "bg-pink/15 text-pink",
  Beta: "bg-pink/15 text-pink",
  "Published research": "bg-violet/20 text-lilac",
  Research: "bg-paper/10 text-paper/80",
  "In development": "bg-blue/15 text-[#a9b1ff]",
};

export function ProjectCard({ project, wide = false }: { project: Project; wide?: boolean }) {
  return (
    <Tilt
      max={wide ? 4 : 5}
      className={`group relative rounded-[29px] ${wide ? "h-[min(640px,78svh)] w-[min(1120px,80vw)] shrink-0" : ""}`}
    >
      <div
        aria-hidden
        className="absolute -inset-px overflow-hidden rounded-[29px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      >
        <div className="ring-spin absolute left-1/2 top-1/2 aspect-square w-[160%] -translate-x-1/2 -translate-y-1/2" />
      </div>
      <article
        className={`relative grid h-full overflow-hidden rounded-[28px] border border-line bg-ink-2 ${
          wide ? "grid-cols-[1fr_1.05fr]" : "grid-cols-1"
        }`}
      >
        <div
          className={`relative overflow-hidden bg-ink-3 bg-[linear-gradient(rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.05)_1px,transparent_1px)] bg-[size:28px_28px] ${wide ? "h-full" : "aspect-[4/3] sm:aspect-[16/9]"}`}
        >
          <div aria-hidden className="absolute -left-10 -top-10 h-2/3 w-2/3 rounded-full bg-violet/30 blur-3xl" />
          <div aria-hidden className="absolute -bottom-16 -right-10 h-2/3 w-2/3 rounded-full bg-pink/20 blur-3xl" />
          <motion.div
            initial={{ scale: 1.25, opacity: 0, filter: "blur(12px)" }}
            whileInView={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 1.3, ease: EASE }}
            className="relative h-full p-4"
          >
            <div className="h-full transition-transform duration-700 ease-out-expo group-hover:scale-[1.05]">
              <ProjectArt kind={project.art} />
            </div>
          </motion.div>
        </div>

        <div className={`flex flex-col p-6 sm:p-8 ${wide ? "overflow-y-auto lg:p-10" : ""}`}>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className={`rounded-full px-3 py-1 font-medium ${statusStyle[project.status]}`}>
              {(project.status === "Live" || project.status === "Beta") && (
                <span className="relative mr-1.5 inline-flex h-2 w-2 translate-y-[-1px]">
                  <span className="absolute inset-0 animate-ping rounded-full bg-pink/70" />
                  <span className="relative h-2 w-2 rounded-full bg-pink" />
                </span>
              )}
              {project.status}
            </span>
            <span className="text-mist">{project.sector}</span>
          </div>

          <h3 className="mt-5 font-display text-3xl font-medium tracking-tight sm:text-4xl">{project.name}</h3>
          <p className="mt-2 text-lg text-lilac">{project.tagline}</p>
          <p className="mt-4 max-w-prose leading-relaxed text-mist">{project.summary}</p>

          {project.metrics.length > 0 && (
            <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-6">
              {project.metrics.map((m) => (
                <div key={m.label}>
                  <dt className="sr-only">{m.label}</dt>
                  <dd className="text-brand font-display text-2xl font-medium tabular-nums sm:text-3xl">
                    <CountUp value={m.value} />
                  </dd>
                  <dd className="mt-1 text-xs leading-snug text-mist sm:text-sm">{m.label}</dd>
                </div>
              ))}
            </dl>
          )}

          {project.highlights && project.metrics.length === 0 && (
            <ul className="mt-6 space-y-2.5 border-t border-line pt-6">
              {project.highlights.map((h) => (
                <li key={h} className="flex gap-3 leading-snug">
                  <svg viewBox="0 0 10 12" className="mt-1.5 h-3 w-2.5 shrink-0" aria-hidden>
                    <path d="M0 6 L10 0 L10 12Z" fill="#ff66c4" />
                  </svg>
                  {h}
                </li>
              ))}
            </ul>
          )}

          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Built with">
            {project.stack.map((s) => (
              <li key={s} className="rounded-full border border-line px-3 py-1 text-xs text-paper/75">
                {s}
              </li>
            ))}
          </ul>

          {(project.link || project.note) && (
            <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-6">
              {project.link && (
                <a
                  href={project.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-paper px-5 text-sm font-medium text-ink transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
                >
                  {project.link.label}
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
              )}
              {project.note && <p className="text-xs text-mist/80">{project.note}</p>}
            </div>
          )}
        </div>
      </article>
    </Tilt>
  );
}
