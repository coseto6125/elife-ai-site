/**
 * Back-office console — sidebar skill list + workspace.
 *
 * Simulated: pressing 產生結果 shows the skill's canned `output` after a
 * cosmetic delay. No API, no key. Pure demo of "what the staff sees daily".
 */
const SKILLS = window.SKILLS
const $ = (id) => document.getElementById(id)

let active = 0

/* ---------- Sidebar (grouped by tag) ---------- */
function renderNav(filter = '') {
  const nav = $('sideNav')
  const q = filter.trim()
  const groups = {}
  SKILLS.forEach((s, i) => {
    if (q && !(s.title + s.blurb + s.tag).includes(q)) return
    ;(groups[s.tag] ||= []).push({ s, i })
  })

  nav.innerHTML =
    Object.entries(groups)
      .map(
        ([tag, items]) =>
          `<div class="nav-group-label">${tag}</div>` +
          items
            .map(
              ({ s, i }) => `
        <div class="nav-item${i === active ? ' active' : ''}" data-i="${i}">
          <span class="ni-icon">${s.icon}</span>
          <span>${s.title}</span>
        </div>`
            )
            .join('')
      )
      .join('') || '<div class="nav-group-label">找不到符合的功能</div>'
}

/* ---------- Load a skill into the workspace ---------- */
function loadSkill(i) {
  active = i
  const s = SKILLS[i]
  $('wIcon').textContent = s.icon
  $('wTitle').textContent = s.title
  $('wBlurb').textContent = s.blurb
  $('wTag').textContent = s.tag
  $('wLabel').textContent = s.label
  $('wInput').value = s.sample || ''
  // reset output
  $('wEmpty').hidden = false
  $('wLoading').hidden = true
  $('wText').hidden = true
  $('wText').textContent = ''
  $('wCopy').hidden = true
  $('wRun').disabled = false
  $('wRun').textContent = '✨ 產生結果'
  renderNav($('search').value)
}

/* ---------- Simulated generation ---------- */
function generate() {
  const s = SKILLS[active]
  $('wEmpty').hidden = true
  $('wText').hidden = true
  $('wLoading').hidden = false
  $('wRun').disabled = true
  $('wRun').textContent = '處理中…'
  setTimeout(() => {
    $('wLoading').hidden = true
    $('wText').textContent = s.output || '（範例結果）'
    $('wText').hidden = false
    $('wCopy').hidden = false
    $('wRun').disabled = false
    $('wRun').textContent = '✨ 重新產生'
  }, 1000)
}

/* ---------- Wire up ---------- */
$('sideNav').addEventListener('click', (e) => {
  const item = e.target.closest('.nav-item')
  if (item) loadSkill(+item.dataset.i)
})
$('search').addEventListener('input', (e) => renderNav(e.target.value))
$('wRun').addEventListener('click', generate)
$('wClear').addEventListener('click', () => {
  $('wInput').value = ''
  $('wInput').focus()
})
$('wCopy').addEventListener('click', () => {
  navigator.clipboard?.writeText($('wText').textContent)
  $('wCopy').textContent = '已複製'
  setTimeout(() => ($('wCopy').textContent = '複製'), 1500)
})

loadSkill(0)
