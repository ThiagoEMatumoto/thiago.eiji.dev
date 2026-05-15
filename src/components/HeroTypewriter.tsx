import { useEffect, useState } from 'react'

interface Props {
  /** Final text to type out, char by char. May contain `{{accent}}` placeholder. */
  text: string
  /** Word that replaces `{{accent}}` and gets the gradient styling. */
  accent: string
  /** ms per character. Default 30ms. */
  speed?: number
  /** ms to wait before starting (lets fonts settle). Default 200ms. */
  startDelay?: number
}

/**
 * Typewriter effect for the hero statement.
 *
 * Behavior:
 *  - The `text` prop carries a `{{accent}}` placeholder; `accent` is the word
 *    that replaces it and gets a coral→amber gradient.
 *  - SSR / no-JS path: full sentence is rendered with the accent word already
 *    inside a `<span class="text-gradient">`. Screen readers see plain text via
 *    `aria-label`.
 *  - JS path: starts empty after hydration, types char by char. While typing,
 *    the accent word is rendered plain (no gradient — gradient appears once
 *    typing completes). The cursor blinks throughout and indefinitely after.
 *  - Honors `prefers-reduced-motion`: shows the full string + gradient
 *    immediately, no blink.
 */
export default function HeroTypewriter({
  text,
  accent,
  speed = 30,
  startDelay = 200,
}: Props) {
  // The literal sentence to type, with `{{accent}}` replaced by the word.
  const fullText = text.replace('{{accent}}', accent)

  // Start with full text so SSR (and no-JS users) see complete content.
  // On hydration we reset to empty string and animate in.
  const [displayed, setDisplayed] = useState(fullText)
  const [mounted, setMounted] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [done, setDone] = useState(true) // true initially so SSR shows gradient

  useEffect(() => {
    const prefers = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    setReducedMotion(prefers)
    setMounted(true)

    if (prefers) {
      setDisplayed(fullText)
      setDone(true)
      return
    }

    setDisplayed('')
    setDone(false)

    let cancelled = false
    let i = 0
    const timeouts: ReturnType<typeof setTimeout>[] = []

    const tick = () => {
      if (cancelled) return
      i += 1
      setDisplayed(fullText.slice(0, i))
      if (i < fullText.length) {
        timeouts.push(setTimeout(tick, speed))
      } else {
        setDone(true)
      }
    }

    timeouts.push(setTimeout(tick, startDelay))

    return () => {
      cancelled = true
      timeouts.forEach(clearTimeout)
    }
  }, [fullText, speed, startDelay])

  // Cursor only animates after we know reduced-motion preference (post-mount).
  const cursorClass =
    'ml-[0.05em] inline-block h-[0.85em] w-[0.5ch] -mb-[0.05em] align-baseline bg-coral' +
    (mounted && !reducedMotion
      ? ' animate-[blink_1s_step-end_infinite]'
      : '')

  // Once typing is done (or in reduced-motion / SSR), wrap the accent word in
  // the gradient span. While typing, render plain so the typewriter effect is
  // smooth and doesn't flash gradient mid-character.
  let beforeAccent = ''
  let afterAccent = ''
  let showGradient = false

  if (done && displayed.includes(accent)) {
    const idx = displayed.indexOf(accent)
    beforeAccent = displayed.slice(0, idx)
    afterAccent = displayed.slice(idx + accent.length)
    showGradient = true
  }

  return (
    <span aria-label={fullText} role="text">
      {showGradient ? (
        <span aria-hidden="true">
          {beforeAccent}
          <span className="text-gradient">{accent}</span>
          {afterAccent}
        </span>
      ) : (
        <span aria-hidden="true">{displayed}</span>
      )}
      <span aria-hidden="true" data-blink className={cursorClass} />
    </span>
  )
}
