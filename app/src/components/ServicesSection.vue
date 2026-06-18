<script setup lang="ts">
import { services } from '../data/site'
import { useReveal } from '../composables/useReveal'

useReveal('root', { stagger: 110 })
</script>

<template>
  <section id="services" ref="root" class="section">
    <div class="wrap">
      <header class="head reveal" data-reveal>
        <span class="eyebrow">// 01 — Services</span>
        <h2 class="section-title">我能交付什麼</h2>
        <p class="section-lead">
          不是什麼都接。我專注在四個自己有深度的領域——
          每一項都有實際出貨、跑在生產環境的作品支撐。
        </p>
      </header>

      <div class="grid">
        <article
          v-for="s in services"
          :key="s.id"
          class="card reveal"
          data-reveal
        >
          <div class="card-top">
            <span class="num">{{ s.index }}</span>
            <span class="arrow" aria-hidden="true">↗</span>
          </div>
          <h3 class="card-title">{{ s.title }}</h3>
          <p class="card-sum">{{ s.summary }}</p>
          <ul class="card-list">
            <li v-for="b in s.bullets" :key="b">
              <span class="bullet" aria-hidden="true" />{{ b }}
            </li>
          </ul>
          <div class="card-stack">
            <span v-for="t in s.stack" :key="t" class="tag">{{ t }}</span>
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
.card {
  background: linear-gradient(180deg, var(--bg-1), var(--bg-2));
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: clamp(26px, 3vw, 36px);
  position: relative;
  overflow: hidden;
  transition:
    border-color 0.4s var(--ease),
    transform 0.4s var(--ease);
}
.card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(380px 200px at 100% 0%, var(--accent-soft), transparent 70%);
  opacity: 0;
  transition: opacity 0.45s var(--ease);
  pointer-events: none;
}
.card:hover {
  border-color: var(--accent-line);
  transform: translateY(-4px);
}
.card:hover::before {
  opacity: 1;
}
.card:hover .arrow {
  color: var(--accent);
  transform: translate(3px, -3px);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.num {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--accent);
  letter-spacing: 0.1em;
}
.arrow {
  font-size: 1.2rem;
  color: var(--ink-3);
  transition: all 0.35s var(--ease);
}
.card-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.2rem, 2vw, 1.5rem);
  letter-spacing: -0.01em;
  margin-top: 18px;
}
.card-sum {
  color: var(--ink-1);
  margin-top: 12px;
  font-size: 0.98rem;
}
.card-list {
  list-style: none;
  margin-top: 22px;
  display: flex;
  flex-direction: column;
  gap: 11px;
}
.card-list li {
  display: flex;
  align-items: baseline;
  gap: 0.7em;
  font-size: 0.92rem;
  color: var(--ink-1);
  line-height: 1.5;
}
.bullet {
  flex: none;
  width: 5px;
  height: 5px;
  margin-top: 0.55em;
  border-radius: 1px;
  background: var(--accent);
  transform: rotate(45deg);
}
.card-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 26px;
  padding-top: 22px;
  border-top: 1px dashed var(--line);
}

@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
