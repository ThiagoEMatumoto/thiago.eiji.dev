/**
 * Subtle 3D tilt + cursor-tracking CSS vars on hover.
 *
 * Behavior:
 *  - Tracks cursor position relative to the element on `mousemove`.
 *  - Updates CSS custom props `--mx` / `--my` (in %) so children can use them
 *    for spotlight gradients etc.
 *  - Applies `perspective + rotateX/Y + translateZ` transform via rAF.
 *  - Resets on `mouseleave`.
 *  - Respects `prefers-reduced-motion`: only updates the CSS vars, no transform.
 *  - No-op on touch-only / coarse-pointer devices.
 *
 * Reusable across the Components Lab and (later) Stack/HowIWork cards.
 */
export function applyTilt(el: HTMLElement, maxDeg = 6): () => void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarse = window.matchMedia('(pointer: coarse)').matches

  let raf = 0
  let pendingX = 0.5
  let pendingY = 0.5
  let hovering = false

  const apply = () => {
    raf = 0
    el.style.setProperty('--mx', `${(pendingX * 100).toFixed(2)}%`)
    el.style.setProperty('--my', `${(pendingY * 100).toFixed(2)}%`)

    if (reduced || coarse) return

    if (!hovering) {
      el.style.transform = ''
      return
    }

    const rotX = (0.5 - pendingY) * maxDeg * 2
    const rotY = (pendingX - 0.5) * maxDeg * 2
    el.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(6px)`
  }

  const schedule = () => {
    if (raf) return
    raf = requestAnimationFrame(apply)
  }

  const onMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect()
    pendingX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    pendingY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    hovering = true
    schedule()
  }

  const onLeave = () => {
    hovering = false
    pendingX = 0.5
    pendingY = 0.5
    schedule()
  }

  el.style.transition = 'transform 200ms ease-out'
  el.style.willChange = 'transform'
  el.addEventListener('mousemove', onMove)
  el.addEventListener('mouseleave', onLeave)

  return () => {
    el.removeEventListener('mousemove', onMove)
    el.removeEventListener('mouseleave', onLeave)
    if (raf) cancelAnimationFrame(raf)
    el.style.transform = ''
    el.style.transition = ''
    el.style.willChange = ''
  }
}
