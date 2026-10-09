import type { LhBackTopState } from './types'

/** 默认滚动阈值 px */
export const LH_BACKTOP_VISIBILITY_HEIGHT_DEFAULT = 200

/** 类名 */
export function getBackTopClassNames(state: LhBackTopState): string[] {
  const classes = ['lh-backtop']
  if (state.visible) classes.push('lh-backtop--visible')
  return classes
}

/**
 * 滚动目标解析：选择器 → 元素；未命中/未传回退滚动根。
 * 滚动根优先 document.scrollingElement（兼容 body 滚动）。
 */
export function resolveScrollTarget(target?: string | HTMLElement): HTMLElement | Window {
  if (target) {
    if (typeof target === 'string') {
      const el = document.querySelector<HTMLElement>(target)
      if (el) return el
    } else {
      return target
    }
  }
  return window
}

/** 当前滚动距离（容器/视口自适应；用 HTMLElement 判定而非 Window 全局，跨 realm 安全） */
export function getScrollTop(target: HTMLElement | Window): number {
  if (target instanceof HTMLElement) return target.scrollTop
  return document.scrollingElement?.scrollTop ?? document.documentElement.scrollTop ?? 0
}

/**
 * 回顶：优先原生平滑滚动；prefers-reduced-motion 降级为 auto。
 * 元素无 scrollTo（旧 jsdom 等）时直接写 scrollTop。
 */
export function backToTop(target: HTMLElement | Window, smooth: boolean): void {
  // SSR / 非浏览器环境守卫：无 window 时直接降级为 auto（与 shared/popper 的守卫风格一致）
  const reducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const behavior: ScrollBehavior = smooth && !reducedMotion ? 'smooth' : 'auto'
  if (!(target instanceof HTMLElement)) {
    window.scrollTo({ top: 0, behavior })
  } else if (typeof target.scrollTo === 'function') {
    target.scrollTo({ top: 0, behavior })
  } else {
    target.scrollTop = 0
  }
}

/** 可见性判定 */
export function isBackTopVisible(scrollTop: number, visibilityHeight: number): boolean {
  return scrollTop >= visibilityHeight
}

/** scrollend 防抖兜底的静止阈值 ms（仅在不支持原生 scrollend 的浏览器使用） */
export const LH_BACKTOP_SCROLLEND_DELAY = 150

/**
 * 特性探测：目标是否派发原生 scrollend（Chromium 114+ / Safari 18.2+）。
 * 不支持时由调用方退回 scroll + 防抖模拟。
 */
export function supportsScrollEnd(target: HTMLElement | Window): boolean {
  return 'scrollend' in target
}
