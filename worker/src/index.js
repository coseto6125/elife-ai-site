/**
 * e-life-ai 聯絡表單寄信 Worker
 *
 * 流程：官網表單 POST → 此 Worker → Cloudflare Email Routing (send_email binding)
 *       → service@e-life-ai.com → 轉發到你的 gmail。
 *
 * 零成本：Worker 免費額度 + Email Routing 免費，不依賴 Resend。
 *
 * binding `SEND_EMAIL` 在 wrangler.toml 設定；destination 必須是已驗證地址
 * （service@e-life-ai.com 已透過 Email Routing 驗證並轉發）。
 */

import { EmailMessage } from 'cloudflare:email'
import { createMimeMessage } from 'mimetext'

const ALLOWED_ORIGINS = new Set([
  'https://service.e-life-ai.com',
  'http://localhost:5179',
  'http://localhost:5173',
])

// TO 必須是 Email Routing 已驗證的 destination 位址
const TO = 'digital.oasis.tw@gmail.com'
// from 必須在本 zone（e-life-ai.com）以滿足 send_email binding 的同網域限制
const FROM = 'noreply@e-life-ai.com'

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : 'https://service.e-life-ai.com'
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  })
}

const clean = (s, max) => String(s ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max)
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)

// 提案瀏覽追蹤：只記「開了幾次 + 時間」，不存任何個資。
// 資料放 Workers KV (binding VIEWS)：
//   count:<hash>  → 累計次數
//   ts:<hash>     → 最近 50 筆 ISO 時間戳的 JSON 陣列
// hash 僅接受 demo 路徑用的 12 位 hex，過濾任意 key 寫入。
const isHash = (s) => /^[0-9a-f]{12}$/.test(s)

async function recordView(hash, env) {
  const [rawCount, rawTs] = await Promise.all([
    env.VIEWS.get(`count:${hash}`),
    env.VIEWS.get(`ts:${hash}`),
  ])
  const count = (parseInt(rawCount, 10) || 0) + 1
  const ts = rawTs ? JSON.parse(rawTs) : []
  ts.unshift(new Date().toISOString())
  await Promise.all([
    env.VIEWS.put(`count:${hash}`, String(count)),
    env.VIEWS.put(`ts:${hash}`, JSON.stringify(ts.slice(0, 50))),
  ])
}

// 1×1 透明 GIF，作為 /track 的回應 body（即使 JS 被擋，<img> fallback 也能記）
const PIXEL = Uint8Array.from(
  atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'),
  (c) => c.charCodeAt(0),
)

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''
    const url = new URL(request.url)

    // --- 提案瀏覽追蹤（GET，與寄信獨立）---
    if (request.method === 'GET' && url.pathname === '/track') {
      const hash = url.searchParams.get('p') || ''
      if (isHash(hash)) await recordView(hash, env)
      return new Response(PIXEL, {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      })
    }
    if (request.method === 'GET' && url.pathname === '/track/stats') {
      const hash = url.searchParams.get('p') || ''
      if (!isHash(hash)) return json({ error: 'bad hash' }, 400, origin)
      const [rawCount, rawTs] = await Promise.all([
        env.VIEWS.get(`count:${hash}`),
        env.VIEWS.get(`ts:${hash}`),
      ])
      return json(
        { hash, count: parseInt(rawCount, 10) || 0, recent: rawTs ? JSON.parse(rawTs) : [] },
        200,
        origin,
      )
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }
    if (request.method !== 'POST') {
      return json({ error: 'method not allowed' }, 405, origin)
    }

    let data
    try {
      data = await request.json()
    } catch {
      return json({ error: '格式錯誤' }, 400, origin)
    }

    // honeypot: bots fill hidden fields; humans don't
    if (clean(data.company_url, 100)) {
      return json({ ok: true }, 200, origin) // silently accept, drop
    }

    const name = clean(data.name, 80)
    const email = clean(data.email, 120)
    const phone = clean(data.phone, 40)
    const line = clean(data.line, 60)
    const kind = clean(data.kind, 40)
    const budget = clean(data.budget, 80)
    const msg = String(data.msg ?? '').trim().slice(0, 4000)

    if (!name || !isEmail(email) || msg.length < 5) {
      return json({ error: '請填寫姓名、正確的 Email 與需求描述' }, 400, origin)
    }

    const subject = `[接案洽詢] ${kind || '一般'} - ${name}`
    const text = [
      `姓名 / 公司：${name}`,
      `Email：${email}`,
      `電話：${phone || '未填'}`,
      `LINE ID：${line || '未填'}`,
      `專案類型：${kind || '未填'}`,
      `預算範圍：${budget || '未填'}`,
      '',
      '需求描述：',
      msg,
      '',
      '來自 service.e-life-ai.com 聯絡表單',
    ].join('\n')

    const mime = createMimeMessage()
    mime.setSender({ name: 'e-life-ai 官網表單', addr: FROM })
    mime.setRecipient(TO)
    mime.setSubject(subject)
    mime.addMessage({ contentType: 'text/plain', data: text })
    // Reply-To is a validated standard header; it needs an RFC5322 mailbox
    // (angle-bracketed). Bare "a@b.com" fails validation — "<a@b.com>" passes.
    // Customer name stays out (non-ASCII would also fail); it's in the body.
    try {
      mime.setHeader('Reply-To', `<${email}>`)
    } catch {
      /* best-effort; the customer email is in the body regardless */
    }

    try {
      const message = new EmailMessage(FROM, TO, mime.asRaw())
      await env.SEND_EMAIL.send(message)
    } catch (err) {
      return json({ error: '寄送失敗，請改用 Email 或 LINE 聯絡', detail: String(err).slice(0, 120) }, 502, origin)
    }

    return json({ ok: true }, 200, origin)
  },
}
