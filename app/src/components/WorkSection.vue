<script setup lang="ts">
import { cases } from '../data/site'
import { useReveal } from '../composables/useReveal'

useReveal('root', { stagger: 90 })
</script>

<template>
  <section id="work" ref="root" class="section">
    <div class="wrap">
      <header class="head reveal" data-reveal>
        <span class="eyebrow">// 02 — Selected Work</span>
        <h2 class="section-title">出貨過的硬東西</h2>
        <p class="section-lead">
          以下皆為實際出貨、跑在生產環境的專案，已隱去客戶可識別資訊，
          聚焦在解決的技術難題本身。
        </p>
      </header>

      <div class="grid">
        <article
          v-for="(c, i) in cases"
          :key="c.id"
          class="case reveal"
          :class="{ wide: i === 0 }"
          data-reveal
        >
          <div class="case-head">
            <div>
              <span class="kind">{{ c.kind }}</span>
              <h3 class="case-name">{{ c.name }}</h3>
            </div>
            <div v-if="c.metric" class="metric">
              <span class="m-v">{{ c.metric.value }}</span>
              <span class="m-l">{{ c.metric.label }}</span>
            </div>
          </div>

          <p class="case-blurb">{{ c.blurb }}</p>

          <ul class="case-hl">
            <li v-for="h in c.highlights" :key="h">
              <span class="check" aria-hidden="true">✓</span>{{ h }}
            </li>
          </ul>

          <div class="case-stack">
            <span v-for="t in c.stack" :key="t" class="tag">{{ t }}</span>
          </div>
        </article>
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
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(16px, 2vw, 22px);
}
.case {
  background: linear-gradient(180deg, var(--bg-1), var(--bg-2));
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: clamp(26px, 3vw, 38px);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transition:
    border-color 0.4s var(--ease),
    transform 0.4s var(--ease);
}
.case::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(var(--accent), var(--accent-2));
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 0.5s var(--ease);
}
.case:hover {
  border-color: var(--line-bright);
  transform: translateY(-4px);
}
.case:hover::after {
  transform: scaleY(1);
}
.case.wide {
  grid-column: 1 / -1;
}
.case.wide .case-blurb {
  max-width: 64ch;
  font-size: 1.05rem;
}

.case-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}
.kind {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  color: var(--accent);
  text-transform: uppercase;
}
.case-name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.25rem, 2.2vw, 1.7rem);
  letter-spacing: -0.015em;
  margin-top: 8px;
}
.metric {
  flex: none;
  text-align: right;
  padding-left: 18px;
  border-left: 1px solid var(--line);
}
.m-v {
  display: block;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.3rem, 2.4vw, 1.9rem);
  color: var(--accent);
  letter-spacing: -0.02em;
  line-height: 1;
}
.m-l {
  display: block;
  font-size: 0.72rem;
  color: var(--ink-2);
  margin-top: 6px;
  max-width: 12ch;
}

.case-blurb {
  color: var(--ink-1);
  margin-top: 16px;
}
.case-hl {
  list-style: none;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.case.wide .case-hl {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.case-hl li {
  display: flex;
  align-items: baseline;
  gap: 0.6em;
  font-size: 0.9rem;
  color: var(--ink-1);
  line-height: 1.5;
}
.check {
  color: var(--accent);
  font-size: 0.82rem;
  flex: none;
}
.case-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: auto;
  padding-top: 24px;
}

@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .case.wide .case-hl {
    grid-template-columns: 1fr;
  }
  .metric {
    text-align: left;
    padding-left: 0;
    border-left: 0;
  }
}
</style>
