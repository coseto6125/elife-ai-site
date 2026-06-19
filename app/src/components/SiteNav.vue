<script setup lang="ts">
import { ref } from 'vue'
import { useWindowScroll } from '@vueuse/core'

const { y } = useWindowScroll()
const open = ref(false)

const links = [
  { href: '#services', label: '服務' },
  { href: '#work', label: '作品' },
  { href: '#showcase', label: '範例' },
  { href: '#about', label: '關於' },
  { href: '#pricing', label: '合作' },
  { href: '#contact', label: '聯絡' },
]

function scrollTo(href: string) {
  open.value = false
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
}
function go(href: string) {
  open.value = false
  // the "聯絡" nav link opens the chat widget instead of scrolling to the form
  if (href === '#contact' && typeof (window as any).openChat === 'function') {
    ;(window as any).openChat()
    return
  }
  scrollTo(href)
}
</script>

<template>
  <header class="nav" :class="{ solid: y > 40 }">
    <div class="wrap nav-row">
      <a href="#top" class="brand" @click.prevent="go('#top')">
        <span class="dot" />
        <span class="brand-name">e-life<span class="brand-ai">-ai</span></span>
      </a>

      <nav class="links" :class="{ open }">
        <a
          v-for="l in links"
          :key="l.href"
          :href="l.href"
          @click.prevent="go(l.href)"
          >{{ l.label }}</a
        >
        <a class="btn btn-primary nav-cta" href="#contact" @click.prevent="scrollTo('#contact')">
          開始合作
        </a>
      </nav>

      <button
        class="burger"
        :class="{ open }"
        aria-label="選單"
        @click="open = !open"
      >
        <span /><span /><span />
      </button>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  transition: all 0.4s var(--ease);
  border-bottom: 1px solid transparent;
}
.nav.solid {
  background: rgba(7, 11, 16, 0.72);
  backdrop-filter: blur(14px) saturate(140%);
  border-bottom-color: var(--line);
}
.nav-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6em;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.18rem;
  letter-spacing: -0.01em;
}
.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 14px var(--accent);
  animation: pulse 2.6s var(--ease-in-out) infinite;
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
.brand-ai {
  color: var(--accent);
}
.links {
  display: flex;
  align-items: center;
  gap: clamp(18px, 2.4vw, 34px);
  font-family: var(--font-mono);
  font-size: 0.88rem;
}
.links > a:not(.nav-cta) {
  color: var(--ink-1);
  transition: color 0.25s var(--ease);
  position: relative;
}
.links > a:not(.nav-cta):hover {
  color: var(--ink-0);
}
.links > a:not(.nav-cta)::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -6px;
  width: 0;
  height: 1px;
  background: var(--accent);
  transition: width 0.3s var(--ease);
}
.links > a:not(.nav-cta):hover::after {
  width: 100%;
}
.nav-cta {
  padding: 0.62em 1.1em;
  font-size: 0.82rem;
}

.burger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: 0;
  padding: 8px;
}
.burger span {
  width: 22px;
  height: 2px;
  background: var(--ink-0);
  transition: all 0.3s var(--ease);
}
.burger.open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.burger.open span:nth-child(2) {
  opacity: 0;
}
.burger.open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

@media (max-width: 760px) {
  .burger {
    display: flex;
  }
  .links {
    position: fixed;
    inset: 68px 0 auto 0;
    flex-direction: column;
    gap: 22px;
    padding: 34px var(--gutter) 40px;
    background: rgba(7, 11, 16, 0.97);
    backdrop-filter: blur(18px);
    border-bottom: 1px solid var(--line);
    transform: translateY(-130%);
    transition: transform 0.45s var(--ease);
    font-size: 1.1rem;
  }
  .links.open {
    transform: translateY(0);
  }
  .nav-cta {
    align-self: flex-start;
  }
}
</style>
