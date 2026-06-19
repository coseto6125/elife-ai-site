<script setup lang="ts">
import { showcases } from '../data/site'
import { useReveal } from '../composables/useReveal'

useReveal('root', { stagger: 60 })
</script>

<template>
  <section id="showcase" ref="root" class="section">
    <div class="wrap">
      <header class="head reveal" data-reveal>
        <span class="eyebrow">// 03 — Design Templates</span>
        <h2 class="section-title">設計範例</h2>
        <p class="section-lead">
          這些是我們做的互動式設計樣板，涵蓋 60+ 種產業情境與設計風格，展示我們的設計幅度與前端功力。
          皆為純前端、使用模擬資料的展示範本（非真實客戶產品），點開即可實際操作。
        </p>
      </header>

      <div class="grid">
        <a
          v-for="s in showcases"
          :key="s.id"
          class="card reveal"
          :style="{ '--card-accent': s.accent ?? 'var(--accent)' }"
          :href="s.href"
          target="_blank"
          rel="noopener"
          data-reveal
        >
          <div class="card-top">
            <span class="no">{{ s.no }}</span>
            <span class="kind">{{ s.clientType }}</span>
          </div>
          <h3 class="card-title">{{ s.title }}</h3>
          <span class="view">查看範例 <span class="arrow" aria-hidden="true">↗</span></span>
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
  gap: clamp(16px, 2vw, 22px);
}
.card {
  background: linear-gradient(180deg, var(--bg-1), var(--bg-2));
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: clamp(22px, 2.4vw, 30px);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transition:
    border-color 0.4s var(--ease),
    transform 0.4s var(--ease);
}
.card::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--card-accent);
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 0.5s var(--ease);
}
.card:hover {
  border-color: var(--line-bright);
  transform: translateY(-4px);
}
.card:hover::after {
  transform: scaleY(1);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.no {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--card-accent);
}
.kind {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  color: var(--ink-2);
  text-align: right;
}
.card-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.12rem, 1.8vw, 1.4rem);
  letter-spacing: -0.015em;
  margin-top: 18px;
  line-height: 1.25;
}
.view {
  margin-top: auto;
  padding-top: 26px;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--ink-1);
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  transition: color 0.3s var(--ease);
}
.card:hover .view {
  color: var(--card-accent);
}
.arrow {
  transition: transform 0.3s var(--ease);
}
.card:hover .arrow {
  transform: translate(2px, -2px);
}

@media (max-width: 980px) {
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
