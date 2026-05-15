# CLAUDE.md — thiago.eiji.dev

## Sobre

Landing page pessoal de Thiago Eiji Matumoto. Single-page bilingual (PT/EN), SSG via Astro 6 com React islands. Deploy Vercel.

## Comandos comuns

- `npm run dev` — dev server em `localhost:4321`
- `npm run build` — production build para `dist/`
- `npm run preview` — serve `dist/` localmente
- `npm run test:e2e` — Playwright smoke tests (5 testes)
- `npm run format` — Prettier
- `npm run lint` — ESLint (`.ts`, `.tsx`, `.astro`)

## Convenções

### Worktree workflow

Branches feature em `.worktrees/`. `main` protegida. Cada feature = PR pequeno.

```bash
git worktree add .worktrees/feat-nome -b feat/nome
```

### Adicionar copy

Tudo via i18n JSONs (`src/i18n/pt.json` + `src/i18n/en.json`). NUNCA hardcode strings em components — sempre via `t.section.key` depois de `const t = useTranslations(Astro.currentLocale)`.

Manter shape idêntico nos dois JSONs. Se faltar key em um locale, build quebra ou render fica inconsistente.

### Animações

- **Sutis** (scroll reveals, hover, transições) → vanilla JS + CSS, sem dependência
- **Showcase moments** (typewriter do hero, number flip dos labels) → Motion v12 em React islands
- TUDO respeita `prefers-reduced-motion` (já configurado em `global.css` e nos islands)

### Design tokens

Definidos em `src/styles/global.css` via `@theme` (Tailwind v4 CSS-first):

- Cores: `canvas`, `ink`, `coral`, `mute`
- Font: `mono` (JetBrains Mono Variable, importado via `@fontsource-variable/jetbrains-mono`)

NÃO adicionar cores fora desse set sem justificativa explícita do dono. Mantém a identidade editorial.

### Astro i18n

- Locales: `pt` (default, sem prefix) e `en` (em `/en/`)
- `prefixDefaultLocale: false` mantém PT em `/`
- Pages duplicadas em `src/pages/index.astro` e `src/pages/en/index.astro`
- Helper: `useTranslations(Astro.currentLocale)` em `src/i18n/index.ts`

### React islands

- `client:visible` quando o componente está abaixo do fold
- `client:load` apenas para o hero (above the fold, animação imediata)
- Não hidratar componentes estáticos — Astro renderiza HTML puro por default e isso é o que queremos na maioria dos casos

## Gotchas

- **Tailwind v4** usa CSS-first config (`@theme` em `global.css`), NÃO `tailwind.config.mjs`. Não tente adicionar arquivo de config JS — não vai ser lido.
- **Astro 6 i18n nativo** com `prefixDefaultLocale: false` mantém PT em `/`. Mudar isso quebra todos os links e SEO já existentes.
- **ClientRouter já no BaseLayout** — view transitions nativas. Não adicionar Framer Motion para transições de página.
- **OG image** (`public/og-image.png`) é PNG real gerado a partir de `og-image.svg` via `svgexport`. Se mudar identidade visual, regerar o PNG (não basta atualizar o SVG).
- **Node `>=22.12.0`** obrigatório (`package.json` engines). Vercel usa por default; localmente garantir via `nvm` se necessário.
- **Playwright** roda contra build local — `npm run test:e2e` faz preview automático via `playwright.config.ts` webServer.

## Testes

Smoke tests em `tests/e2e/smoke.spec.ts`. Cobrem:

- Render do hero
- Toggle de idioma PT ↔ EN
- Render de seções principais (about, how I work, stack, contact)
- Meta tags básicas

Rodar antes de mergear PR:

```bash
npm run test:e2e
```

Se adicionar feature visível, adicionar smoke correspondente — não tentar cobertura ampla, manter focado em "página renderiza e fluxos críticos funcionam".

## Roadmap (Phase 2 do projeto)

Próximo: aba de blog (`/writing/`) com MDX. Quando implementar:

- Adicionar content collection em `src/content/blog/`
- Posts em MDX, PT/EN paralelos
- Index em `src/pages/writing/index.astro` + `src/pages/en/writing/index.astro`
- RSS feed via `@astrojs/rss`
- Atualizar i18n keys em `writing` (atualmente placeholder "soon")

## Antes de mergear

1. `npm run lint` clean
2. `npm run build` clean
3. `npm run test:e2e` verde
4. PR pequeno e focado (uma feature/fix por PR)
5. Commit message segue conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`)
