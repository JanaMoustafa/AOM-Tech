import { nav, site } from "@/content/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-5 py-12 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <Logo className="text-2xl" />
          <p className="mt-3 font-display text-xs tracking-[0.42em] text-paper/70">AI. SOLUTIONS</p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-mist">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="transition-colors hover:text-paper">
              {item.label}
            </a>
          ))}
          {site.socials.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-paper"
            >
              {s.label}
            </a>
          ))}
          <a href={`mailto:${site.email}`} className="transition-colors hover:text-paper">
            {site.email}
          </a>
        </nav>
      </div>
      <div aria-hidden className="overflow-hidden px-5 sm:px-8">
        <p className="text-shimmer mx-auto max-w-7xl select-none text-center font-display text-[21vw] font-semibold leading-[0.8] tracking-tighter xl:text-[17rem]">
          AOMTech
        </p>
      </div>
      <p className="mx-auto max-w-7xl px-5 pb-10 pt-8 text-xs text-mist/70 sm:px-8">
        © {new Date().getFullYear()} {site.name}. All rights reserved.
      </p>
    </footer>
  );
}
