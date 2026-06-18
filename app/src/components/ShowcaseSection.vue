<script setup lang="ts">
import { showcase } from '../data/site'
import { useReveal } from '../composables/useReveal'

useReveal('root', { stagger: 60 })

// Per-card accent hue, spread across the spectrum so the grid feels lively
// while staying within the site's dark aesthetic.
function hue(i: number): number {
  return Math.round((i / showcase.length) * 320 + 160) % 360
}
</script>

<template>
  <section id="showcase" ref="root" class="section">
    <div class="wrap">
      <header class="head reveal" data-reveal>
        <span class="eyebrow">// 03 — Design Showcase</span>
        <h2 class="section-title">設計範例</h2>
        <p class="section-lead">
          20 套自製、可互動的網站設計樣板，涵蓋從 sci-fi、精品電商到賽博龐克等不同風格。
          點擊任一張即可開啟完整 demo（每頁皆標註 elife-ai.com）。
        </p>
      </header>

      <div class="grid">
        <a
          v-for="(s, i) in showcase"
          :key="s.id"
          class="card reveal"
          :style="{ '--h': hue(i) }"
          :href="s.href"
          target="_blank"
          rel="noopener"
          data-reveal
        >
          <div class="strip" aria-hidden="true">
            <svg class="motif" viewBox="0 0 80 80" preserveAspectRatio="none">
              <circle cx="40" cy="40" r="22" />
              <circle cx="40" cy="40" r="34" />
              <line x1="0" y1="40" x2="80" y2="40" />
              <line x1="40" y1="0" x2="40" y2="80" />
            </svg>
          </div>

          <div class="card-body">
            <div class="card-head">
              <span class="num">N° {{ s.number }}</span>
              <span class="open" aria-hidden="true">↗</span>
            </div>
            <h3 class="card-title">{{ s.title }}</h3>
            <p class="card-desc">{{ s.desc }}</p>
            <div class="card-tags">
              <span v-for="t in s.tags" :key="t" class="tag">{{ t }}</span>
            </div>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.head {
  margin-bottom: clamp(40px, 6vw, 64px);
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(14px, 1.8vw, 20px);
}
.card {
  --accent-h: hsl(var(--h) 70% 62%);
  --accent-h-2: hsl(calc(var(--h) + 40) 72% 58%);
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, var(--bg-1), var(--bg-2));
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
  position: relative;
  transition:
    border-color 0.4s var(--ease),
    transform 0.4s var(--ease);
}
.card:hover {
  border-color: var(--line-bright);
  transform: translateY(-4px);
}

.strip {
  position: relative;
  height: 74px;
  overflow: hidden;
  background: linear-gradient(
    120deg,
    color-mix(in oklab, var(--accent-h) 24%, var(--bg-2)),
    color-mix(in oklab, var(--accent-h-2) 18%, var(--bg-1))
  );
  border-bottom: 1px solid var(--line);
}
.motif {
  position: absolute;
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 96px;
  height: 96px;
  fill: none;
  stroke: var(--accent-h);
  stroke-width: 1;
  opacity: 0.5;
  transition:
    transform 0.6s var(--ease),
    opacity 0.4s var(--ease);
}
.card:hover .motif {
  transform: translateY(-50%) rotate(45deg) scale(1.1);
  opacity: 0.85;
}

.card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: clamp(18px, 2vw, 24px);
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.num {
  font-family: var(--font-mono);
  font-size: 0.74rem;
  letter-spacing: 0.06em;
  color: var(--accent-h);
}
.open {
  font-size: 0.95rem;
  color: var(--ink-2);
  transition:
    color 0.3s var(--ease),
    transform 0.3s var(--ease);
}
.card:hover .open {
  color: var(--accent-h);
  transform: translate(2px, -2px);
}
.card-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.1rem, 1.7vw, 1.32rem);
  letter-spacing: -0.015em;
  margin-top: 10px;
}
.card-desc {
  color: var(--ink-1);
  font-size: 0.9rem;
  line-height: 1.55;
  margin-top: 10px;
}
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: auto;
  padding-top: 18px;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 560px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
