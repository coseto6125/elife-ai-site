import { onMounted, onBeforeUnmount, useTemplateRef } from 'vue'

/**
 * Adds `.is-in` to the element bound via `ref="<refKey>"` (and staggers its
 * `[data-reveal]` children) when it scrolls into view. CSS does the transition.
 *
 * Usage: `useReveal('root')` in setup + `ref="root"` on the section element.
 */
export function useReveal(
  refKey: string,
  options?: { threshold?: number; stagger?: number; once?: boolean },
): void {
  const el = useTemplateRef<HTMLElement>(refKey)
  const { threshold = 0, stagger = 90, once = true } = options ?? {}
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    const node = el.value
    if (!node || typeof IntersectionObserver === 'undefined') {
      node?.classList.add('is-in')
      return
    }

    const children = Array.from(node.querySelectorAll<HTMLElement>('[data-reveal]'))
    children.forEach((child, i) => {
      child.style.setProperty('--reveal-delay', `${i * stagger}ms`)
    })

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            children.forEach((c) => c.classList.add('is-in'))
            if (once) observer?.unobserve(entry.target)
          } else if (!once) {
            entry.target.classList.remove('is-in')
            children.forEach((c) => c.classList.remove('is-in'))
          }
        }
      },
      { threshold, rootMargin: '0px 0px -12% 0px' },
    )
    observer.observe(node)
  })

  // Safety net: never leave content invisible if the observer somehow
  // doesn't fire (fast scroll past, tab restore, etc.).
  onMounted(() => {
    window.setTimeout(() => {
      const node = el.value
      if (node && !node.classList.contains('is-in')) {
        node.classList.add('is-in')
        node.querySelectorAll('[data-reveal]').forEach((c) => c.classList.add('is-in'))
      }
    }, 2600)
  })

  onBeforeUnmount(() => observer?.disconnect())
}
