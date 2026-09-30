# AOM Tech — portfolio site

Next.js 16 (App Router) · Tailwind CSS 4 · Motion · Lenis

## Editing content

All copy — projects, services, process, contact details — lives in
`src/content/site.ts`. Set `hidden: true` on a project to keep it off the page.

Brand tokens (colors, fonts) are in `src/app/globals.css`. The logo is redrawn
as SVG in `src/components/Logo.tsx` and `src/app/icon.svg`.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build check
```

## Deploy to Vercel

Push this folder to a GitHub repository and import it at vercel.com/new
(framework preset: Next.js, no settings to change), or run `npx vercel`.
After the first deploy, update `site.url` in `src/content/site.ts` to the
production domain so social previews use the right address.
