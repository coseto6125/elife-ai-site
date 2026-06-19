<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { contacts } from '../data/site'
import { useReveal } from '../composables/useReveal'

useReveal('root', { stagger: 90 })

// 表單寄信端點（Cloudflare Worker → Email Routing）
const ENDPOINT = 'https://elife-ai-contact.digital-oasis-tw.workers.dev'

const form = reactive({
  name: '',
  email: '',
  phone: '',
  line: '',
  kind: 'AI / RAG',
  budget: '',
  msg: '',
  company_url: '', // honeypot：真人不會填，機器人會
})
const kinds = ['AI / RAG', '全端 / 後端', '爬蟲 / 資料', '系統 / 顧問', '其他']
const state = ref<'idle' | 'sending' | 'sent' | 'error'>('idle')
const errorMsg = ref('')

const valid = computed(
  () => form.name.trim() && /^\S+@\S+\.\S+$/.test(form.email) && form.msg.trim().length > 4,
)

async function submit() {
  if (!valid.value || state.value === 'sending') return
  state.value = 'sending'
  errorMsg.value = ''
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || '寄送失敗')
    }
    state.value = 'sent'
  } catch (err) {
    state.value = 'error'
    errorMsg.value = err instanceof Error ? err.message : '寄送失敗，請改用 Email 或 LINE'
  }
}

// 降級：若 Worker 不可用，改用 mailto
function mailtoFallback() {
  const body = [
    `姓名 / 公司：${form.name}`,
    `Email：${form.email}`,
    `電話：${form.phone || '未填'}`,
    `LINE ID：${form.line || '未填'}`,
    `專案類型：${form.kind}`,
    `預算範圍：${form.budget || '未填'}`,
    '',
    form.msg,
  ].join('\n')
  window.location.href = `mailto:service@e-life-ai.com?subject=${encodeURIComponent(
    `[接案洽詢] ${form.kind} — ${form.name}`,
  )}&body=${encodeURIComponent(body)}`
}
</script>

<template>
  <section id="contact" ref="root" class="section">
    <div class="wrap contact-grid">
      <div class="left reveal" data-reveal>
        <span class="eyebrow">// 06 — Contact</span>
        <h2 class="section-title">有想做的東西？<br />來聊聊。</h2>
        <p class="section-lead">
          無論是已經很明確的需求，還是一個「這做得到嗎」的模糊想法，
          都歡迎丟過來。需求釐清不收費。
        </p>

        <ul class="channels">
          <li v-for="c in contacts" :key="c.channel">
            <a :href="c.href" target="_blank" rel="noopener">
              <span class="ch-prefix">[{{ c.channel }}]</span>
              <span class="ch-body">
                <span class="ch-label">{{ c.label }}</span>
                <span class="ch-value">{{ c.value }}</span>
              </span>
              <span class="ch-go" aria-hidden="true">↗</span>
            </a>
          </li>
        </ul>
      </div>

      <form class="form reveal panel" data-reveal @submit.prevent="submit">
        <div class="row">
          <label>
            <span>姓名 / 公司</span>
            <input v-model="form.name" type="text" placeholder="如何稱呼你" />
          </label>
          <label>
            <span>Email</span>
            <input v-model="form.email" type="email" placeholder="you@company.com" />
          </label>
        </div>

        <label>
          <span>專案類型</span>
          <div class="chips">
            <button
              v-for="k in kinds"
              :key="k"
              type="button"
              class="chip"
              :class="{ on: form.kind === k }"
              @click="form.kind = k"
            >
              {{ k }}
            </button>
          </div>
        </label>

        <div class="row">
          <label>
            <span>電話 <em>(選填)</em></span>
            <input v-model="form.phone" type="tel" placeholder="0912-345-678" />
          </label>
          <label>
            <span>LINE ID <em>(選填)</em></span>
            <input v-model="form.line" type="text" placeholder="你的 LINE ID" />
          </label>
        </div>

        <label>
          <span>預算範圍 <em>(選填)</em></span>
          <input v-model="form.budget" type="text" placeholder="例如 NT$50k–100k / 待討論" />
        </label>

        <label>
          <span>需求描述</span>
          <textarea
            v-model="form.msg"
            rows="4"
            placeholder="想解決什麼問題？有沒有現成系統要整合？時程大概？"
          />
        </label>

        <!-- honeypot: visually hidden, bots fill it -->
        <input
          v-model="form.company_url"
          class="hp"
          type="text"
          tabindex="-1"
          autocomplete="off"
          aria-hidden="true"
        />

        <button
          v-if="state !== 'sent'"
          class="btn btn-primary submit"
          type="submit"
          :disabled="!valid || state === 'sending'"
        >
          {{ state === 'sending' ? '送出中…' : '送出洽詢 →' }}
        </button>
        <p v-else class="ok-msg">✓ 已送出，我們會盡快回覆你！</p>

        <p v-if="state === 'error'" class="err-msg">
          {{ errorMsg }}——你也可以
          <a href="#" @click.prevent="mailtoFallback">改用 Email 寄送</a>
          或加 LINE <strong>@936pvpoq</strong>。
        </p>
        <p v-else-if="state !== 'sent'" class="hint">
          填表送出後我們會盡快回覆；也可直接寄到
          <a href="mailto:service@e-life-ai.com">service@e-life-ai.com</a>。
        </p>
      </form>
    </div>
  </section>
</template>

<style scoped>
.contact-grid {
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: clamp(36px, 6vw, 72px);
  align-items: start;
}
.section-title {
  margin-top: 18px;
}

.channels {
  list-style: none;
  margin-top: 38px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.channels a {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--bg-1);
  transition: all 0.3s var(--ease);
}
.channels a:hover {
  border-color: var(--accent-line);
  background: var(--bg-2);
  transform: translateX(4px);
}
.ch-prefix {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent);
  flex: none;
  width: 4.6em;
}
.ch-body {
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}
.ch-label {
  font-size: 0.78rem;
  color: var(--ink-2);
}
.ch-value {
  font-size: 0.96rem;
  color: var(--ink-0);
  font-weight: 500;
}
.ch-go {
  margin-left: auto;
  color: var(--ink-3);
  transition: color 0.3s var(--ease);
}
.channels a:hover .ch-go {
  color: var(--accent);
}

/* form */
.form {
  padding: clamp(26px, 3vw, 38px);
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
label {
  display: flex;
  flex-direction: column;
  gap: 9px;
}
label > span {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  color: var(--ink-1);
}
label em {
  color: var(--ink-3);
  font-style: normal;
}
input,
textarea {
  font-family: var(--font-cjk);
  font-size: 0.96rem;
  color: var(--ink-0);
  background: var(--bg-0);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 0.78em 0.9em;
  transition: border-color 0.25s var(--ease);
  resize: vertical;
  width: 100%;
}
input::placeholder,
textarea::placeholder {
  color: var(--ink-3);
}
input:focus,
textarea:focus {
  outline: none;
  border-color: var(--accent-line);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chips .chip {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--ink-1);
  background: var(--bg-0);
  border: 1px solid var(--line);
  border-radius: 7px;
  padding: 0.5em 0.85em;
  transition: all 0.25s var(--ease);
}
.chips .chip:hover {
  border-color: var(--line-bright);
  color: var(--ink-0);
}
.chips .chip.on {
  background: var(--accent-soft);
  border-color: var(--accent-line);
  color: var(--accent);
}

.submit {
  justify-content: center;
  margin-top: 6px;
}
.submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.hint {
  font-size: 0.8rem;
  color: var(--ink-2);
  text-align: center;
}
.hint a {
  color: var(--accent);
}
.hp {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
.ok-msg {
  text-align: center;
  font-family: var(--font-mono);
  font-size: 0.92rem;
  color: var(--accent);
  padding: 0.86em;
  border: 1px solid var(--accent-line);
  border-radius: var(--radius-sm);
  background: var(--accent-soft);
}
.err-msg {
  font-size: 0.82rem;
  color: var(--ink-1);
  text-align: center;
}
.err-msg a {
  color: var(--accent);
}
.err-msg strong {
  color: var(--accent);
}

@media (max-width: 800px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 460px) {
  .row {
    grid-template-columns: 1fr;
  }
}
</style>
