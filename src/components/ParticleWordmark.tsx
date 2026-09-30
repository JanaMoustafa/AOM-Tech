/**
 * The hero particle animation. The engine (hero-particles.js) is inlined into
 * the page HTML by HeroParticlesScript, outside the React bundle, so it starts
 * as soon as the browser reaches the hero and runs in a Web Worker where page
 * start-up work can't make it stutter. This component only renders the
 * elements it drives.
 */
export function ParticleWordmark({ text = "AOM" }: { text?: string }) {
  return (
    <>
      {/* Painted with the HTML, in exactly the spot the particles form the mark.
          The script fades it out once the first particle frame is drawn. */}
      <svg
        id="hero-mark"
        viewBox="0 0 46 100"
        aria-hidden
        suppressHydrationWarning
        className="hero-mark pointer-events-none absolute left-1/2 top-[7%] h-[86%] w-auto -translate-x-1/2"
      >
        <path d="M0 21 L35 1 L35 41 Z" fill="#8c52ff" />
        <path d="M0 50 L35 30 L35 70 Z" fill="#e2a9f1" />
        <path d="M0 79 L35 59 L35 99 Z" fill="#ff66c4" />
        <rect x="41.5" y="1" width="3" height="98" fill="#ffffff" />
      </svg>
      <canvas
        id="hero-particles"
        data-text={text}
        role="img"
        aria-label={text}
        suppressHydrationWarning
        className="absolute inset-0 h-full w-full font-display"
      />
    </>
  );
}
