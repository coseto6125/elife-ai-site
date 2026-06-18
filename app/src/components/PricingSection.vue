<script setup lang="ts">
import { steps, plans } from '../data/site'
import { useReveal } from '../composables/useReveal'

useReveal('root', { stagger: 90 })

function go(href: string) {
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <section id="pricing" ref="root" class="section">
    <div class="wrap">
      <header class="head reveal" data-reveal>
        <span class="eyebrow">// 04 — How We Work</span>
        <h2 class="section-title">合作流程與方案</h2>
        <p class="section-lead">
          透明、分階段、可驗收。先把問題談清楚，再談錢，需求釐清完全免費。
        </p>
      </header>

      <!-- process -->
      <ol class="steps">
        <li v-for="s in steps" :key="s.no" class="step reveal" data-reveal>
          <span class="step-no">{{ s.no }}</span>
          <h3 class="step-title">{{ s.title }}</h3>
          <p class="step-desc">{{ s.desc }}</p>
        </li>
      </ol>

      <!-- plans -->
      <div class="plans">
        <article
          v-for="p in plans"
          :key="p.id"
          class="plan reveal"
          :class="{ featured: p.featured }"
          data-reveal
        >
          <span v-if="p.featured" class="badge">最常合作</span>
          <h3 class="plan-name">{{ p.name }}</h3>
          <div class="plan-price">
            <span class="pp-v">{{ p.price }}</span>
            <span class="pp-u">{{ p.unit }}</span>
          </div>
          <p class="plan-tag">{{ p.tagline }}</p>
          <ul class="plan-feat">
            <li v-for="f in p.features" :key="f">
              <span class="dot" aria-hidden="true" />{{ f }}
            </li>
          </ul>
          <button
            class="btn"
            :class="p.featured ? 'btn-primary' : 'btn-ghost'"
            @click="go('#contact')"
          >
            {{ p.featured ? '討論專案' : '聊聊' }}
          </button>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.head {
  margin-bottom: clamp(40px, 6vw, 60px);
}

.steps {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(16px, 2vw, 24px);
  counter-reset: none;
  margin-bottom: clamp(56px, 8vw, 96px);
}
.step {
  position: relative;
  padding-top: 26px;
  border-top: 1px solid var(--line);
}
.step::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  width: 38px;
  height: 2px;
  background: var(--accent);
}
.step-no {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--accent);
  letter-spacing: 0.12em;
}
.step-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.18rem;
  margin-top: 12px;
}
.step-desc {
  color: var(--ink-2);
  font-size: 0.9rem;
  margin-top: 10px;
  line-height: 1.6;
}

.plans {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(16px, 2vw, 22px);
  align-items: stretch;
}
.plan {
  position: relative;
  background: linear-gradient(180deg, var(--bg-1), var(--bg-2));
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: clamp(28px, 3vw, 38px);
  display: flex;
  flex-direction: column;
  transition:
    border-color 0.4s var(--ease),
    transform 0.4s var(--ease);
}
.plan:hover {
  transform: translateY(-4px);
  border-color: var(--line-bright);
}
.plan.featured {
  border-color: var(--accent-line);
  background: linear-gradient(180deg, rgba(52, 227, 196, 0.07), var(--bg-2));
  box-shadow: 0 30px 70px -40px rgba(52, 227, 196, 0.4);
}
.badge {
  position: absolute;
  top: -11px;
  left: clamp(28px, 3vw, 38px);
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  color: #04110d;
  background: var(--accent);
  padding: 0.32em 0.7em;
  border-radius: 5px;
}
.plan-name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.2rem;
}
.plan-price {
  display: flex;
  align-items: baseline;
  gap: 0.4em;
  margin-top: 16px;
}
.pp-v {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.7rem, 3vw, 2.3rem);
  letter-spacing: -0.02em;
  color: var(--ink-0);
}
.pp-u {
  font-family: var(--font-mono);
  font-size: 0.84rem;
  color: var(--ink-2);
}
.plan-tag {
  color: var(--ink-1);
  font-size: 0.92rem;
  margin-top: 12px;
  min-height: 2.8em;
}
.plan-feat {
  list-style: none;
  margin: 24px 0 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}
.plan-feat li {
  display: flex;
  align-items: baseline;
  gap: 0.7em;
  font-size: 0.92rem;
  color: var(--ink-1);
}
.plan-feat .dot {
  flex: none;
  width: 5px;
  height: 5px;
  margin-top: 0.5em;
  border-radius: 50%;
  background: var(--accent);
}
.plan .btn {
  width: 100%;
  justify-content: center;
}

@media (max-width: 820px) {
  .steps {
    grid-template-columns: repeat(2, 1fr);
    gap: 28px;
  }
  .plans {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 440px) {
  .steps {
    grid-template-columns: 1fr;
  }
}
</style>
