import { useEffect, useState } from 'react'

interface Props {
  /** Final text to type out, char by char. */
  text: string
  /** ms per character. Default 30ms. */
  speed?: number
  /** ms to wait before starting (lets fonts settle). Default 200ms. */
  startDelay?: number
}

/**
 * Typewriter effect for the hero statement.
 *
 * Behavior:
 *  - Renders the full string into the DOM as `aria-label` for screen readers
 *    so the experience is identical for assistive tech.
 *  - Visually types out one character every `speed` ms.
 *  - A coral cursor blinks throughout — during typing AND indefinitely after.
 *  - Honors `prefers-reduced-motion`: shows the full string immediately, no blink.
 */
export default function HeroTypewriter({
  text,
  speed = 30,
  startDelay = 200,
}: Props) {
  // Start with full text so SSR (and no-JS users) see complete content.
  // On hydration we reset to empty string and animate in.
  const [displayed, setDisplayed] = useState(text)
  const [mounted, setMounted] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const prefers = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    setReducedMotion(prefers)
    setMounted(true)

    if (prefers) {
      setDisplayed(text)
      return
    }

    setDisplayed('')

    let cancelled = false
    let i = 0
    const timeouts: ReturnType<typeof setTimeout>[] = []

    const tick = () => {
      if (cancelled) return
      i += 1
      setDisplayed(text.slice(0, i))
      if (i < text.length) {
        timeouts.push(setTimeout(tick, speed))
      }
    }

    timeouts.push(setTimeout(tick, startDelay))

    return () => {
      cancelled = true
      timeouts.forEach(clearTimeout)
    }
  }, [text, speed, startDelay])

  // Cursor only animates after we know reduced-motion preference (post-mount).
  const cursorClass =
    'ml-[0.05em] inline-block h-[0.85em] w-[0.5ch] -mb-[0.05em] align-baseline bg-coral' +
    (mounted && !reducedMotion
      ? ' animate-[blink_1s_step-end_infinite]'
      : '')

  return (
    <span aria-label={text} role="text">
      <span aria-hidden="true">{displayed}</span>
      <span aria-hidden="true" data-blink className={cursorClass} />
    </span>
  )
}
