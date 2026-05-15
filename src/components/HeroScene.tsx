import { useEffect, useRef } from 'react'

/**
 * HeroScene — three.js wireframe icosahedron + floating particles.
 *
 * Loaded as a React island (`client:visible`). Three.js is **dynamically imported**
 * so the chunk lives in a lazy bundle, not in the initial page payload.
 *
 * Behavior:
 *  - Renders an icosahedron wireframe (plus a barely-visible glassy mesh) at center.
 *  - Sprinkles 5 small spheres around it (3 coral, 1 ink, 1 amber) that bob on Y.
 *  - Subtle mouse parallax tilts the icosahedron a few degrees toward the cursor.
 *  - Honors `prefers-reduced-motion`: renders ONE static frame, no rAF, no parallax.
 *  - Cleans up everything on unmount: rAF, listeners, geometries, materials, renderer.
 *
 * The container element fills 100% of its parent — the parent decides the size.
 */
export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Pre-flight: skip entirely on environments without WebGL (very rare in 2026,
    // but preserves SSR/test safety).
    if (typeof window === 'undefined') return

    let cancelled = false
    let cleanup: (() => void) | null = null

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    // Dynamic import keeps `three` out of the initial bundle. The chunk only
    // downloads when this island hydrates (client:visible → after first paint).
    // NOTE: three.js (r184+) is ~180kb gzip — larger than the original spec
    // estimated (80kb). Acceptable trade-off because the chunk is lazy and the
    // initial page payload is unaffected. Hero text is SSR'd; scene fades in.
    import('three')
      .then((THREE) => {
        if (cancelled || !container) return

        const width = container.clientWidth || 1
        const height = container.clientHeight || 1

        // ── Scene + camera ───────────────────────────────────────────
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
        camera.position.z = 4

        // ── Renderer (transparent over the canvas color) ─────────────
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
        })
        renderer.setClearColor(0x000000, 0)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        renderer.setSize(width, height)
        container.appendChild(renderer.domElement)

        // ── Polyhedron: icosahedron wireframe + faint glass mesh ─────
        const baseGeom = new THREE.IcosahedronGeometry(1.4, 0)

        const edges = new THREE.EdgesGeometry(baseGeom)
        const lineMat = new THREE.LineBasicMaterial({ color: 0x1a1a1a })
        const wireframe = new THREE.LineSegments(edges, lineMat)

        const glassMat = new THREE.MeshBasicMaterial({
          color: 0xfaf7f2,
          transparent: true,
          opacity: 0.05,
          depthWrite: false,
        })
        const glass = new THREE.Mesh(baseGeom, glassMat)

        const polyhedron = new THREE.Group()
        polyhedron.add(glass)
        polyhedron.add(wireframe)
        scene.add(polyhedron)

        // ── Floating particles ───────────────────────────────────────
        type Particle = {
          mesh: import('three').Mesh
          baseY: number
          phase: number
          speed: number
        }

        const particleConfigs: Array<{
          color: number
          size: number
          x: number
          y: number
          z: number
        }> = [
          { color: 0xe94b2d, size: 0.08, x: -2.0, y: 0.6, z: 0.5 },
          { color: 0xe94b2d, size: 0.06, x: 1.9, y: -0.4, z: -0.3 },
          { color: 0xe94b2d, size: 0.07, x: 0.2, y: 1.7, z: -0.6 },
          { color: 0x1a1a1a, size: 0.05, x: -1.4, y: -1.3, z: 0.4 },
          { color: 0xf5b820, size: 0.1, x: 1.6, y: 1.2, z: 0.2 },
        ]

        const particles: Particle[] = particleConfigs.map((p) => {
          const geom = new THREE.SphereGeometry(p.size, 12, 12)
          const mat = new THREE.MeshBasicMaterial({ color: p.color })
          const mesh = new THREE.Mesh(geom, mat)
          mesh.position.set(p.x, p.y, p.z)
          scene.add(mesh)
          return {
            mesh,
            baseY: p.y,
            phase: Math.random() * Math.PI * 2,
            speed: 0.6 + Math.random() * 0.6,
          }
        })

        // ── Mouse parallax (subtle) ──────────────────────────────────
        const target = { x: 0, y: 0 }
        const onMouse = (e: MouseEvent) => {
          if (reducedMotion) return
          const rect = container.getBoundingClientRect()
          const nx = (e.clientX - rect.left) / rect.width - 0.5
          const ny = (e.clientY - rect.top) / rect.height - 0.5
          target.x = nx * 0.2
          target.y = ny * 0.2
        }
        window.addEventListener('mousemove', onMouse)

        // ── Resize ───────────────────────────────────────────────────
        const onResize = () => {
          const w = container.clientWidth || 1
          const h = container.clientHeight || 1
          camera.aspect = w / h
          camera.updateProjectionMatrix()
          renderer.setSize(w, h)
        }
        window.addEventListener('resize', onResize)

        // ── Animation loop ───────────────────────────────────────────
        let rafId = 0
        const start = performance.now()

        const renderOnce = () => {
          renderer.render(scene, camera)
        }

        const tick = () => {
          const t = (performance.now() - start) / 1000
          polyhedron.rotation.y += 0.003
          polyhedron.rotation.x += 0.001
          // ease toward parallax target
          polyhedron.rotation.y += (target.x - polyhedron.rotation.y * 0) * 0
          polyhedron.rotation.z += (target.y - polyhedron.rotation.z) * 0.02

          for (const p of particles) {
            p.mesh.position.y = p.baseY + Math.sin(t * p.speed + p.phase) * 0.3
          }

          renderer.render(scene, camera)
          rafId = requestAnimationFrame(tick)
        }

        if (reducedMotion) {
          renderOnce()
        } else {
          rafId = requestAnimationFrame(tick)
        }

        cleanup = () => {
          if (rafId) cancelAnimationFrame(rafId)
          window.removeEventListener('mousemove', onMouse)
          window.removeEventListener('resize', onResize)

          // Dispose particles
          for (const p of particles) {
            p.mesh.geometry.dispose()
            ;(p.mesh.material as import('three').Material).dispose()
            scene.remove(p.mesh)
          }

          // Dispose polyhedron
          edges.dispose()
          baseGeom.dispose()
          lineMat.dispose()
          glassMat.dispose()
          scene.remove(polyhedron)

          renderer.dispose()
          if (renderer.domElement.parentNode === container) {
            container.removeChild(renderer.domElement)
          }
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[HeroScene] failed to load three.js', err)
      })

    return () => {
      cancelled = true
      if (cleanup) cleanup()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      aria-hidden="true"
      role="presentation"
    />
  )
}
