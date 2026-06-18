<script setup lang="ts">
const year = new Date().getFullYear()
function go(href: string) {
  // "聯絡" opens the chat widget instead of scrolling to the form
  if (href === '#contact' && typeof (window as any).openChat === 'function') {
    ;(window as any).openChat()
    return
  }
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <footer class="footer">
    <div class="wrap foot-grid">
      <div class="foot-brand">
        <span class="brand"><span class="dot" /><span class="brand-name">e-life<span class="ai">-ai</span></span></span>
        <p>再難的工程，都能一起搞定。</p>
        <span class="mono">service.e-life-ai.com</span>
      </div>

      <nav class="foot-links">
        <a href="#services" @click.prevent="go('#services')">服務</a>
        <a href="#work" @click.prevent="go('#work')">作品</a>
        <a href="#about" @click.prevent="go('#about')">關於</a>
        <a href="#pricing" @click.prevent="go('#pricing')">合作</a>
        <a href="#contact" @click.prevent="go('#contact')">聯絡</a>
      </nav>
    </div>

    <div class="wrap foot-bottom">
      <span>© {{ year }} e-life-ai · All rights reserved.</span>
      <span class="mono">built with Vue · Vite · ❤ for hard problems</span>
    </div>
  </footer>

  <!-- always-on slim dock pinned to the viewport bottom -->
  <div class="dock">
    <div class="wrap dock-row">
      <a href="#top" class="dock-brand" @click.prevent="go('#top')">
        <span class="dot" /><span class="brand-name">e-life<span class="ai">-ai</span></span>
      </a>
      <nav class="dock-links">
        <a href="#services" @click.prevent="go('#services')">服務</a>
        <a href="#work" @click.prevent="go('#work')">作品</a>
        <a href="#about" @click.prevent="go('#about')">關於</a>
        <a href="#contact" @click.prevent="go('#contact')">聯絡</a>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--line);
  padding-top: clamp(48px, 7vw, 72px);
  padding-bottom: 32px;
  background:
    radial-gradient(700px 300px at 50% 0%, rgba(52, 227, 196, 0.05), transparent 70%);
}
.foot-grid {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 32px;
  padding-bottom: 40px;
  border-bottom: 1px solid var(--line);
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6em;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.4rem;
}
/* echoes the pulsing dot in the header brand */
.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 14px var(--accent);
  animation: pulse 2.6s var(--ease-in-out) infinite;
}
.ai {
  color: var(--accent);
}
.foot-brand p {
  color: var(--ink-1);
  margin-top: 12px;
  max-width: 32ch;
}
.mono {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--ink-2);
  display: inline-block;
  margin-top: 14px;
}
.foot-links {
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
  font-family: var(--font-mono);
  font-size: 0.88rem;
}
.foot-links a {
  position: relative;
  color: var(--ink-1);
  transition: color 0.25s var(--ease);
}
.foot-links a:hover {
  color: var(--ink-0);
}
/* echoes the nav link underline-on-hover in the header */
.foot-links a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -6px;
  width: 0;
  height: 1px;
  background: var(--accent);
  transition: width 0.3s var(--ease);
}
.foot-links a:hover::after {
  width: 100%;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}
.foot-bottom {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 28px;
  font-size: 0.8rem;
  color: var(--ink-2);
}

/* always-on slim dock */
.dock {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 90;
  background: rgba(7, 11, 16, 0.78);
  backdrop-filter: blur(14px) saturate(140%);
  border-top: 1px solid var(--line);
}
.dock-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
}
.dock-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.55em;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.95rem;
}
.dock-brand .dot {
  width: 7px;
  height: 7px;
}
.dock-links {
  display: flex;
  gap: clamp(16px, 2.2vw, 26px);
  font-family: var(--font-mono);
  font-size: 0.82rem;
}
.dock-links a {
  color: var(--ink-1);
  transition: color 0.25s var(--ease);
}
.dock-links a:hover {
  color: var(--accent);
}
@media (max-width: 520px) {
  .dock-links {
    gap: 14px;
    font-size: 0.78rem;
  }
}
</style>
