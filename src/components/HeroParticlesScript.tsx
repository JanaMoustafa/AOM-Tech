import { readFileSync } from "node:fs";
import { join } from "node:path";

// Read once at build time; the page is statically generated.
const source = readFileSync(join(process.cwd(), "src/components/hero-particles.js"), "utf8");

/**
 * Inlines the hero particle engine into the HTML right after the hero, so it
 * runs during page parsing — no extra download, and no waiting for React.
 * Inline scripts also wait for the stylesheet, so the hero is laid out when it
 * measures.
 */
export function HeroParticlesScript() {
  return <script dangerouslySetInnerHTML={{ __html: source }} />;
}
