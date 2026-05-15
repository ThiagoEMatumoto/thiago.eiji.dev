# thiago.eiji.dev

Personal landing page for Thiago Eiji Matumoto — product engineer.

Live: https://thiago-eiji-dev.vercel.app (after deploy)

## Stack

- Astro 6 (SSG, React islands)
- Tailwind CSS v4 (CSS-first config via `@theme`)
- Motion v12 (showcase animations)
- Astro i18n (PT default at `/`, EN at `/en/`)
- Playwright (E2E smoke tests)
- Deploy: Vercel

## Design

- All-mono typography (JetBrains Mono Variable)
- Editorial 2-column layout with numbered sections
- Light + Coral palette
  - canvas: `#FAF7F2`
  - ink: `#1A1A1A`
  - coral: `#E94B2D`
  - mute: `#6B6B6B`
- No images, no avatars — typography is the design

## Develop

```bash
npm install
npm run dev          # dev server at localhost:4321
npm run build        # static output to dist/
npm run preview      # preview the production build
npm run test:e2e     # playwright smoke tests
npm run format       # prettier write
npm run lint         # eslint
```

Requires Node `>=22.12.0`.

## Structure

```
src/
  layouts/BaseLayout.astro      # html shell, SEO, fonts, ClientRouter
  components/
    Hero.astro                  # full-bleed hero with typewriter
    HeroTypewriter.tsx          # react island for hero animation
    EditorialSection.astro      # 2-col wrapper for numbered sections
    SectionLabel.tsx            # react island with number flip animation
    About.astro
    HowIWork.astro
    Stack.astro
    Writing.astro
    Contact.astro
    Footer.astro
    LangToggle.astro
  i18n/
    pt.json                     # PT copy (default)
    en.json                     # EN copy
    index.ts                    # useTranslations() helper
  pages/
    index.astro                 # PT route at /
    en/index.astro              # EN route at /en/
  styles/global.css             # Tailwind import + @theme tokens
public/
  og-image.png                  # 1200x630 social preview
  og-image.svg                  # source for og-image.png
  robots.txt
tests/e2e/smoke.spec.ts         # 5 smoke tests
```

## i18n

Add a string:

1. Edit `src/i18n/pt.json` and `src/i18n/en.json` keeping the same shape
2. In components, do `const t = useTranslations(Astro.currentLocale)` and reference via `t.section.key`
3. Toggle language via the link in the footer (`LangToggle.astro`)

## Deploy

Vercel auto-deploys on push to `main`. Pull requests get preview URLs automatically.
