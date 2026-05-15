import { useEffect, useRef, useState } from 'react'
import { animate } from 'motion'

interface Props {
  /** Final integer value, e.g. 5. */
  value: number
  /** Suffix appended after the number, e.g. "+". */
  suffix?: string
  /** Lowercase mono label rendered below. */
  label: string
}

/**
 * Big gradient number with a count-up animation.
 *
 * SSR: renders the final value so no-JS users + screen readers see the truth.
 * On mount: resets to 0 and animates to `value` once it enters the viewport.
 * Honors `prefers-reduced-motion`: no animation, just final value.
 */
export default function AnimatedCounter({ value, suffix = '', label }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [n, setN] = useState<number>(value)

  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (reduced) {
      setN(value)
      return
    }
    setN(0)
    const node = ref.current
    if (!node) return
    let played = false
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !played) {
            played = true
            const counter = { v: 0 }
            animate(counter, { v: value }, {
              duration: 1.2,
              ease: 'easeOut',
              onUpdate: () => setN(Math.round(counter.v)),
            })
            obs.disconnect()
            break
          }
        }
      },
      { threshold: 0.5 },
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [value])

  return (
    <div
      ref={ref}
      className="flex h-full flex-col items-center justify-center gap-2"
    >
      <div
        className="text-gradient font-mono text-6xl font-semibold leading-none tabular-nums md:text-7xl"
        aria-hidden="true"
      >
        {n}
        {suffix}
      </div>
      <div className="font-mono text-xs uppercase tracking-wider text-mute">
        {label}
      </div>
      <span className="sr-only">
        {value}
        {suffix} {label}
      </span>
    </div>
  )
}
