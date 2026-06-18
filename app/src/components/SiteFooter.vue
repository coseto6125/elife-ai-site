<script setup lang="ts">
const year = new Date().getFullYear()
function go(href: string) {
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <footer class="footer">
    <div class="wrap foot-grid">
      <div class="foot-brand">
        <span class="brand">e-life<span class="ai">.ai</span></span>
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
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.4rem;
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
  color: var(--ink-1);
  transition: color 0.25s var(--ease);
}
.foot-links a:hover {
  color: var(--accent);
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
</style>
