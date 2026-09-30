"use client";

import Lenis from "lenis";
import { useEffect } from "react";

let instance: Lenis | null = null;

/** Current page scroll position, as Lenis sees it when it's running. */
export function currentScroll() {
  return instance ? instance.targetScroll : window.scrollY;
}

/** Scroll the page to an absolute position, through Lenis when it's running. */
export function scrollToY(y: number, { immediate = false }: { immediate?: boolean } = {}) {
  if (instance) instance.scrollTo(y, { immediate, duration: immediate ? undefined : 1.1 });
  else window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
}

// Inertial scrolling on pointer devices. Skipped for reduced-motion users;
// touch devices keep native scrolling (Lenis leaves touch alone by default).
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ anchors: { offset: -72 }, lerp: 0.1 });
    instance = lenis;
    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      instance = null;
    };
  }, []);

  return null;
}
