<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

/**
 * Living code-graph backdrop: nodes drift, edges form when nodes are near,
 * a faint "query pulse" travels along edges. Nods to ECP, the flagship work.
 * Pauses when offscreen / reduced-motion; DPR-aware.
 */
const canvas = ref<HTMLCanvasElement | null>(null)
let raf = 0
let running = true

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  hub: boolean
}

onMounted(() => {
  const cv = canvas.value!
  const ctx = cv.getContext('2d')!
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  let w = 0
  let h = 0
  let dpr = 1
  let nodes: Node[] = []
  const LINK = 168 // px distance to draw an edge

  const accent = '52, 227, 196'
  const edge = '124, 140, 255'

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = cv.offsetWidth
    h = cv.offsetHeight
    cv.width = w * dpr
    cv.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    seed()
  }

  function seed() {
    const density = Math.min(72, Math.floor((w * h) / 17000))
    nodes = Array.from({ length: density }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.16,
      r: Math.random() * 1.6 + 0.8,
      hub: i % 9 === 0,
    }))
  }

  let t = 0
  function frame() {
    if (!running) return
    t += 0.006
    ctx.clearRect(0, 0, w, h)

    // edges
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const d = Math.hypot(dx, dy)
        if (d < LINK) {
          const o = (1 - d / LINK) * 0.4
          ctx.strokeStyle = `rgba(${edge}, ${o * 0.5})`
          ctx.lineWidth = 0.6
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()

          // query pulse travelling along a few edges
          const phase = (t * 0.6 + (i + j) * 0.13) % 1
          if ((i + j) % 7 === 0) {
            const px = a.x + (b.x - a.x) * phase
            const py = a.y + (b.y - a.y) * phase
            ctx.fillStyle = `rgba(${accent}, ${o * 1.6})`
            ctx.beginPath()
            ctx.arc(px, py, 1.4, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }
    }

    // nodes
    for (const n of nodes) {
      n.x += n.vx
      n.y += n.vy
      if (n.x < 0 || n.x > w) n.vx *= -1
      if (n.y < 0 || n.y > h) n.vy *= -1

      ctx.beginPath()
      ctx.arc(n.x, n.y, n.hub ? n.r + 1.4 : n.r, 0, Math.PI * 2)
      ctx.fillStyle = n.hub ? `rgba(${accent}, 0.9)` : `rgba(${edge}, 0.55)`
      ctx.fill()
      if (n.hub) {
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r + 5, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${accent}, 0.22)`
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }
    raf = requestAnimationFrame(frame)
  }

  resize()
  window.addEventListener('resize', resize)

  if (reduced) {
    // static single paint
    running = true
    frame()
    running = false
    cancelAnimationFrame(raf)
  } else {
    const io = new IntersectionObserver((e) => {
      running = e[0].isIntersecting
      if (running) frame()
      else cancelAnimationFrame(raf)
    })
    io.observe(cv)
    onBeforeUnmount(() => io.disconnect())
  }

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', resize)
  })
})
</script>

<template>
  <canvas ref="canvas" class="graph" aria-hidden="true" />
</template>

<style scoped>
.graph {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  -webkit-mask-image: radial-gradient(ellipse 75% 75% at 60% 40%, #000 30%, transparent 78%);
  mask-image: radial-gradient(ellipse 75% 75% at 60% 40%, #000 30%, transparent 78%);
}
</style>
