"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { hero, nav, site } from "@/content/site";
import { Logo } from "./Logo";

export function Nav() {
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled && !open
            ? "border-b border-line bg-ink/70 backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
        <nav
          aria-label="Main"
          className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 md:h-[72px]"
        >
          <a href="#top" className="relative z-10 flex items-center gap-2.5" aria-label={`${site.name} home`}>
            <Logo className="text-xl" />
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-full px-4 py-2 text-[15px] text-mist transition-colors hover:text-paper"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <a
            href={hero.secondaryCta.href}
            className="hidden rounded-full bg-paper px-5 py-2.5 text-[15px] font-medium text-ink transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] md:inline-flex"
          >
            {hero.secondaryCta.label}
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="relative z-10 -mr-2 grid h-11 w-11 place-items-center rounded-full md:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
        <motion.div
          aria-hidden
          style={{ scaleX: progress }}
          className="bg-brand absolute bottom-0 left-0 h-px w-full origin-left"
        />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ clipPath: "circle(0% at calc(100% - 40px) 32px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 40px) 32px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 40px) 32px)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="grain fixed inset-0 -z-10 flex flex-col bg-ink-2 px-5 pb-10 pt-28 md:hidden"
          >
            <div aria-hidden className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-violet/40 blur-3xl" />
            <div aria-hidden className="absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-pink/25 blur-3xl" />
            <ul className="relative flex flex-col gap-2">
              {nav.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-2 font-display text-5xl font-medium tracking-tight"
                  >
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <motion.a
              href={`mailto:${site.email}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="relative mt-auto text-lg text-mist"
            >
              {site.email}
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
