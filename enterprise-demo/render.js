/**
 * Marketing index — paints the skill grid and drives a *simulated* runner.
 * Interaction is real but output is canned (see skills-data.js). No API/key.
 */
const SKILLS = window.SKILLS

/* ---------- Render skill grid ---------- */
const grid = document.getElementById('skillGrid')
const cards = SKILLS.map(
  (s, i) => `
  <article class="card" data-i="${i}">
    <span class="card-icon">${s.icon}</span>
    <span class="card-tag">${s.tag}</span>
    <h3>${s.title}</h3>
    <p>${s.blurb}</p>
    <span class="card-go">開始使用 →</span>
  </article>`
).join('')

const ghost = `
  <article class="card ghost">
    <span class="card-icon">＋</span>
    <h3>需要其他功能？</h3>
    <p>告訴我們貴公司的需求，量身打造專屬助理。</p>
  </article>`

grid.innerHTML = cards + ghost

/* ---------- Simulated runner ---------- */
const $ = (id) => document.getElementById(id)
const runner = $('runner')
let current = null

function openRunner(skill) {
  current = skill
  $('runIcon').textContent = skill.icon
  $('runTag').textContent = skill.tag
  $('runTitle').textContent = skill.title
  $('runLabel').textContent = skill.label
  $('runInput').value = skill.sample || ''
  $('runResult').hidden = true
  $('runBtn').disabled = false
  $('runBtn').textContent = '✨ 產生結果'
  runner.hidden = false
  document.body.style.overflow = 'hidden'
}

function closeRunner() {
  runner.hidden = true
  document.body.style.overflow = ''
}

function generate() {
  const btn = $('runBtn')
  btn.disabled = true
  btn.textContent = 'AI 處理中…'
  // simulated latency — purely cosmetic
  setTimeout(() => {
    $('runOutput').textContent = current.output || '（範例結果）'
    $('runResult').hidden = false
    btn.disabled = false
    btn.textContent = '✨ 重新產生'
    $('runResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, 900)
}

grid.addEventListener('click', (e) => {
  const card = e.target.closest('.card:not(.ghost)')
  if (card) openRunner(SKILLS[+card.dataset.i])
})
$('runnerClose').addEventListener('click', closeRunner)
$('runBtn').addEventListener('click', generate)
runner.addEventListener('click', (e) => {
  if (e.target === runner) closeRunner()
})
