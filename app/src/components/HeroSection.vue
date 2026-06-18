<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import GraphCanvas from './GraphCanvas.vue'
import { stats } from '../data/site'

function go(href: string) {
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
}

/* --- terminal typing animation --- */
// `cmd` lines type out char by char (single-colour); `out` lines reveal at once
// and may carry multi-colour token markup via v-html.
type Line = { kind: 'cmd' | 'out' | 'blank'; text?: string; html?: string }

const script: Line[] = [
  { kind: 'cmd', text: '$ elife who-am-i --stack' },
  { kind: 'out', html: '<span class="c-key">role</span>     : 軟體開發夥伴 / 接案外包' },
  {
    kind: 'out',
    html: '<span class="c-key">backend</span>  : <span class="c-acc">Rust</span> · <span class="c-acc">Python 3.14</span> · <span class="c-acc">Go</span>',
  },
  {
    kind: 'out',
    html: '<span class="c-key">frontend</span> : <span class="c-acc">Vue 3</span> · <span class="c-acc">React</span> · <span class="c-acc">Next.js</span> · <span class="c-acc">TypeScript</span>',
  },
  { kind: 'out', html: '<span class="c-key">domains</span>  : ai-agent · rag · scraping · systems' },
  { kind: 'out', html: '<span class="c-key">style</span>    : async-first, test-backed, perf-tuned' },
  { kind: 'blank' },
  { kind: 'cmd', text: '$ elife ecp impact --target your_problem' },
  { kind: 'out', html: '<span class="c-ok">✓</span> resolved 14 languages' },
  { kind: 'out', html: '<span class="c-ok">✓</span> blast-radius mapped in 28ms' },
  { kind: 'out', html: '<span class="c-acc">→ ready.</span>' },
]

// rendered[i] holds how much of script[i] is currently visible
const rendered = ref<{ html: string; done: boolean }[]>([])
const activeLine = ref(0)
let timer: ReturnType<typeof setTimeout> | undefined

// colour the `$` prompt and the `elife` command inside a typed cmd line
function styleCmd(text: string): string {
  return text.replace(/^\$/, '<span class="c-mut">$</span>').replace(/\belife\b/, '<span class="c-cmd">elife</span>')
}

function reset() {
  rendered.value = script.map(() => ({ html: '', done: false }))
  activeLine.value = 0
}

function play() {
  const i = activeLine.value
  if (i >= script.length) {
    // typing finished — stop here (run once per page load, no loop)
    return
  }
  const line = script[i]
  if (line.kind === 'cmd') {
    const full = line.text ?? ''
    const shown = rendered.value[i].html.length
    if (shown < full.length) {
      rendered.value[i] = { html: styleCmd(full.slice(0, shown + 1)), done: false }
      timer = setTimeout(play, 38)
    } else {
      rendered.value[i].done = true
      activeLine.value++
      timer = setTimeout(play, 360)
    }
  } else {
    // out / blank reveal instantly
    rendered.value[i] = { html: line.html ?? '', done: true }
    activeLine.value++
    timer = setTimeout(play, line.kind === 'blank' ? 120 : 220)
  }
}

onMounted(() => {
  reset()
  timer = setTimeout(play, 500)
})
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <section id="top" class="hero">
    <GraphCanvas />

    <div class="wrap hero-grid">
      <div class="hero-copy">
        <div class="status" data-h>
          <span class="live" /> 開放接案中 · 歡迎來聊聊
        </div>

        <h1 class="title" data-h>
          使<span class="hl">想像成為現實</span>，<br />
          讓我們實現你的期望。
        </h1>

        <p class="sub" data-h>
          <strong>e-life-ai</strong> 是橫跨後端與前端的軟體開發夥伴，
          後端用 Rust / Python / Go，前端用 Vue / React / Next.js。
          專注 AI Agent、RAG、程式碼圖譜、爬蟲與系統整合，從底層到介面一條龍。
        </p>

        <div class="cta-row" data-h>
          <button class="btn btn-primary" @click="go('#contact')">
            開始一個專案 <span aria-hidden="true">→</span>
          </button>
          <button class="btn btn-ghost" @click="go('#work')">看作品案例</button>
        </div>

        <ul class="stats" data-h>
          <li v-for="s in stats" :key="s.label">
            <span class="stat-v">{{ s.value }}</span>
            <span class="stat-l">{{ s.label }}</span>
          </li>
        </ul>
      </div>

      <!-- terminal card: the signature visual -->
      <aside class="term" data-h aria-hidden="true">
        <div class="term-bar">
          <span /><span /><span />
          <em>~/e-life-ai — zsh</em>
        </div>
        <pre class="term-body"><template v-for="(r, i) in rendered" :key="i"><span v-html="r.html" /><span
              v-if="i === activeLine || (i === rendered.length - 1 && r.done)"
              class="cursor"
            >▋</span><br v-if="i < rendered.length - 1" /></template></pre>
      </aside>
    </div>

    <a class="scroll" href="#services" @click.prevent="go('#services')">
      <span>SCROLL</span>
      <span class="scroll-line" />
    </a>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: center;
  padding-top: 92px;
  padding-bottom: 60px;
  overflow: hidden;
}
.hero-grid {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: clamp(32px, 5vw, 72px);
  align-items: center;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 0.6em;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  color: var(--ink-1);
  border: 1px solid var(--line-bright);
  border-radius: 99px;
  padding: 0.42em 0.9em;
  background: var(--bg-1);
}
.live {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 0 var(--accent-soft);
  animation: live 2s infinite;
}
@keyframes live {
  0% {
    box-shadow: 0 0 0 0 rgba(52, 227, 196, 0.5);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(52, 227, 196, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(52, 227, 196, 0);
  }
}

.title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(2rem, 4.6vw, 3.4rem);
  line-height: 1.12;
  letter-spacing: -0.03em;
  margin: 22px 0 0;
}
.hl {
  color: var(--accent);
  position: relative;
}
.hl::after {
  content: '';
  position: absolute;
  left: -2%;
  right: -2%;
  bottom: 0.08em;
  height: 0.16em;
  background: var(--accent-soft);
  z-index: -1;
}

.sub {
  margin-top: 24px;
  max-width: 50ch;
  color: var(--ink-1);
  font-size: clamp(1rem, 1.5vw, 1.14rem);
}
.sub strong {
  color: var(--ink-0);
  font-weight: 600;
}

.cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 34px;
}

.stats {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(4, auto);
  gap: clamp(20px, 3vw, 42px);
  margin-top: 46px;
  padding-top: 30px;
  border-top: 1px solid var(--line);
}
.stat-v {
  display: block;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.4rem, 2.6vw, 2rem);
  color: var(--ink-0);
  letter-spacing: -0.02em;
  white-space: nowrap;
}
.stat-l {
  display: block;
  font-size: 0.76rem;
  color: var(--ink-2);
  margin-top: 4px;
  line-height: 1.3;
}

/* terminal */
.term {
  background: linear-gradient(180deg, #0a1018, #0c1420);
  border: 1px solid var(--line-bright);
  border-radius: var(--radius);
  box-shadow:
    0 40px 90px -40px rgba(0, 0, 0, 0.8),
    0 0 60px -30px rgba(52, 227, 196, 0.25);
  overflow: hidden;
}
.term-bar {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 12px 16px;
  background: var(--bg-2);
  border-bottom: 1px solid var(--line);
}
.term-bar span {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--line-bright);
}
.term-bar span:nth-child(1) {
  background: #ff5f57;
}
.term-bar span:nth-child(2) {
  background: #febc2e;
}
.term-bar span:nth-child(3) {
  background: #28c840;
}
.term-bar em {
  margin-left: auto;
  font-family: var(--font-mono);
  font-style: normal;
  font-size: 0.72rem;
  color: var(--ink-2);
}
.term-body {
  font-family: var(--font-mono);
  font-size: clamp(0.86rem, 1.2vw, 1.02rem);
  line-height: 1.9;
  padding: 26px 26px 30px;
  color: var(--ink-1);
  white-space: pre-wrap;
  word-break: break-word;
  /* hold height steady so looping typing doesn't jolt the layout */
  min-height: 18em;
}
/* token colours are injected via v-html, so scoped attrs don't reach them — pierce with :deep() */
.term-body :deep(.c-mut) {
  color: var(--ink-2);
}
.term-body :deep(.c-cmd) {
  color: var(--ink-0);
  font-weight: 600;
}
.term-body :deep(.c-key) {
  color: var(--accent-2);
}
.term-body :deep(.c-acc) {
  color: var(--accent);
}
.term-body :deep(.c-ok) {
  color: var(--accent);
}
.cursor {
  color: var(--accent);
  animation: blink 1.1s steps(1) infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}

/* scroll hint */
.scroll {
  position: absolute;
  left: 50%;
  bottom: 26px;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-family: var(--font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.3em;
  color: var(--ink-2);
}
.scroll-line {
  width: 1px;
  height: 40px;
  background: linear-gradient(var(--accent), transparent);
  animation: drop 2.2s var(--ease-in-out) infinite;
}
@keyframes drop {
  0% {
    transform: scaleY(0);
    transform-origin: top;
  }
  50% {
    transform: scaleY(1);
    transform-origin: top;
  }
  51% {
    transform-origin: bottom;
  }
  100% {
    transform: scaleY(0);
    transform-origin: bottom;
  }
}

/* entrance */
[data-h] {
  opacity: 0;
  transform: translateY(22px);
  animation: rise 0.8s var(--ease) forwards;
}
.hero-copy [data-h]:nth-child(1) {
  animation-delay: 0.05s;
}
.hero-copy [data-h]:nth-child(2) {
  animation-delay: 0.16s;
}
.hero-copy [data-h]:nth-child(3) {
  animation-delay: 0.28s;
}
.hero-copy [data-h]:nth-child(4) {
  animation-delay: 0.4s;
}
.hero-copy [data-h]:nth-child(5) {
  animation-delay: 0.52s;
}
.term[data-h] {
  animation-delay: 0.4s;
}
@keyframes rise {
  to {
    opacity: 1;
    transform: none;
  }
}

@media (max-width: 900px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }
  .term {
    order: 2;
  }
}
@media (max-width: 480px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 22px 18px;
  }
}
@media (prefers-reduced-motion: reduce) {
  [data-h] {
    opacity: 1;
    transform: none;
    animation: none;
  }
}
</style>
