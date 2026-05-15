/**
 * Vanilla scroll-reveal utility.
 *
 * - Targets any element with `[data-reveal]` and animates it into view
 *   the first time it crosses the viewport (one-shot).
 * - Optional `[data-reveal-stagger]` on a parent reveals direct children
 *   sequentially with an 80ms gap.
 * - Respects `prefers-reduced-motion`: shows everything immediately.
 * - SSR-safe: initial state is set in JS at boot, so no FOUC for JS users
 *   and no `opacity: 0` is ever shipped to no-JS users.
 *
 * Bound on Astro view-transition `astro:page-load` so it survives navigations.
 */

const REVEAL_ATTR = 'data-reveal'
const STAGGER_ATTR = 'data-reveal-stagger'
const REVEALED_CLASS = 'is-revealed'
const PREP_CLASS = 'reveal-prep'
const STAGGER_DELAY_MS = 80

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function flagAllRevealed(roots: Element[]): void {
  for (const el of roots) {
    el.classList.add(REVEALED_CLASS)
    el.classList.remove(PREP_CLASS)
  }
}

function init(): void {
  if (typeof window === 'undefined') return

  const targets = Array.from(
    document.querySelectorAll<HTMLElement>(`[${REVEAL_ATTR}]`),
  )
  if (targets.length === 0) return

  // Apply the prep class right now so the initial paint is opacity: 0.
  // (No FOUC because this script runs synchronously before paint when
  // injected in <head> with no `defer`/`async`.)
  for (const el of targets) {
    el.classList.add(PREP_CLASS)
  }

  if (prefersReducedMotion()) {
    flagAllRevealed(targets)
    return
  }

  if (typeof IntersectionObserver === 'undefined') {
    flagAllRevealed(targets)
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const el = entry.target as HTMLElement
        const parent = el.parentElement
        const isStaggerChild =
          parent?.hasAttribute(STAGGER_ATTR) &&
          el.hasAttribute(REVEAL_ATTR) &&
          parent.querySelectorAll(`:scope > [${REVEAL_ATTR}]`).length > 1

        if (isStaggerChild && parent) {
          const siblings = Array.from(
            parent.querySelectorAll<HTMLElement>(
              `:scope > [${REVEAL_ATTR}]`,
            ),
          )
          const index = siblings.indexOf(el)
          el.style.transitionDelay = `${index * STAGGER_DELAY_MS}ms`
        }

        el.classList.add(REVEALED_CLASS)
        el.classList.remove(PREP_CLASS)
        observer.unobserve(el)
      }
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px',
    },
  )

  for (const el of targets) {
    observer.observe(el)
  }
}

// Run on initial load AND on every Astro view-transition navigation.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true })
  } else {
    init()
  }
  document.addEventListener('astro:page-load', init)
}
