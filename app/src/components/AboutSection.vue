<script setup lang="ts">
import { techStack } from '../data/site'
import { useReveal } from '../composables/useReveal'

useReveal('root', { stagger: 120 })

const principles = [
  {
    k: '非同步優先',
    v: '從一開始就為並發設計。FastAPI / Sanic / tokio——讓系統在量大時不卡死。',
  },
  {
    k: '測試為證',
    v: '新功能附測試，修 bug 先補回歸測試再動手。不是「應該會動」，是「證明會動」。',
  },
  {
    k: '效能有據',
    v: '熱點用 profiler 找，不靠猜。該下 Rust 就下 Rust，該用零拷貝就用零拷貝。',
  },
  {
    k: '穩定第一',
    v: '解壓縮炸彈、OOM、資料競爭、停滯偵測——把生產環境會爆的地方先補起來。',
  },
]
</script>

<template>
  <section id="about" ref="root" class="section">
    <div class="wrap about-grid">
      <div class="left reveal" data-reveal>
        <span class="eyebrow">// 03 — About</span>
        <h2 class="section-title">一個人，但像一支隊伍</h2>
        <p class="lead">
          我是 <strong>e-life-ai</strong>。橫跨 Rust、Python、Go 三種語言，
          做過從毫秒級程式碼圖譜引擎、生產級多 Agent AI 平台，
          到協定層逆向與高強度爬蟲的各種專案。
        </p>
        <p class="lead">
          接案時我帶來的不只是「會寫程式」，而是<strong>能下到底層、能扛住生產環境、能對品質負責</strong>的工程判斷。
          難的問題，正是我喜歡接的。
        </p>

        <div class="links">
          <a class="btn btn-ghost" href="https://github.com/coseto6125" target="_blank" rel="noopener">
            GitHub · coseto6125 ↗
          </a>
        </div>
      </div>

      <div class="right reveal" data-reveal>
        <ul class="principles">
          <li v-for="p in principles" :key="p.k">
            <span class="p-k">{{ p.k }}</span>
            <span class="p-v">{{ p.v }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- tech marquee -->
    <div class="marquee reveal" data-reveal aria-hidden="true">
      <div class="track">
        <span v-for="t in [...techStack, ...techStack]" :key="t" class="chip">{{ t }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: clamp(36px, 6vw, 80px);
  align-items: start;
}
.lead {
  color: var(--ink-1);
  margin-top: 20px;
  font-size: clamp(1rem, 1.4vw, 1.12rem);
  max-width: 52ch;
}
.lead strong {
  color: var(--ink-0);
  font-weight: 600;
}
.section-title {
  margin-top: 18px;
}
.links {
  margin-top: 30px;
}

.principles {
  list-style: none;
  display: flex;
  flex-direction: column;
}
.principles li {
  padding: 22px 0;
  border-top: 1px solid var(--line);
  display: grid;
  grid-template-columns: 7.5em 1fr;
  gap: 18px;
  align-items: start;
}
.principles li:last-child {
  border-bottom: 1px solid var(--line);
}
.p-k {
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 0.92rem;
  color: var(--accent);
}
.p-v {
  color: var(--ink-1);
  font-size: 0.94rem;
  line-height: 1.6;
}

.marquee {
  margin-top: clamp(56px, 8vw, 96px);
  border-block: 1px solid var(--line);
  padding-block: 18px;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
}
.track {
  display: flex;
  gap: 14px;
  width: max-content;
  animation: scroll 38s linear infinite;
}
.marquee:hover .track {
  animation-play-state: paused;
}
.chip {
  font-family: var(--font-mono);
  font-size: 0.88rem;
  color: var(--ink-1);
  white-space: nowrap;
  padding: 0.3em 0.2em;
}
.chip::before {
  content: '◆';
  color: var(--accent);
  margin-right: 0.8em;
  font-size: 0.6em;
  vertical-align: middle;
}
@keyframes scroll {
  to {
    transform: translateX(-50%);
  }
}

@media (max-width: 800px) {
  .about-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 480px) {
  .principles li {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .track {
    animation: none;
  }
}
</style>
