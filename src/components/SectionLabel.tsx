import { useEffect, useRef, useState } from 'react'
import { animate } from 'motion'

interface Props {
  /** Final number, e.g. "01", "02". Two-digit string. */
  number: string
  /** Section label, e.g. "about", "how i work". */
  label: string
}

/**
 * Editorial section label rendered as a React island.
 *
 *   // 01
 *   about
 *
 * Behavior:
 *  - SSR: renders the final number, so no-JS users and screen readers see the right value.
 *  - On mount: resets to "00" and animates count-up to `number` once the section
 *    enters the viewport (IntersectionObserver, threshold 0.3). Triggers a single time.
 *  - Honors `prefers-reduced-motion`: skips the animation entirely.
 *  - Sticky on desktop (md+): aligns with the first line of content.
 */
export default function SectionLabel({ number, label }: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [displayed, setDisplayed] = useState<string>(number)

  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (reduced) {
      setDisplayed(number)
      return
    }

    const target = parseInt(number, 10)
    if (Number.isNaN(target)) return

    // Reset to "00" on hydration so the count-up has somewhere to start.
    setDisplayed('00')

    const node = wrapperRef.current
    if (!node) return

    let played = false
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !played) {
            played = true
            const counter = { value: 0 }
            animate(counter, { value: target }, {
              duration: 0.4,
              ease: 'easeOut',
              onUpdate: () => {
                const v = Math.round(counter.value)
                setDisplayed(v.toString().padStart(2, '0'))
              },
            })
            observer.disconnect()
            break
          }
        }
      },
      { threshold: 0.3 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [number])

  return (
    <div
      ref={wrapperRef}
      className="font-mono text-xs leading-relaxed text-mute md:sticky md:top-32"
    >
      <div>
        <span className="text-coral">//</span>{' '}
        <span aria-hidden="true">{displayed}</span>
        <span className="sr-only">{number}</span>
      </div>
      <div className="mt-1 text-ink">{label}</div>
    </div>
  )
}
