import type { LhLoadingState } from './types'
import { getDecorativeAria } from '../shared/a11y'
import type { LhAriaAttrs } from '../shared/a11y'

/** 计算遮罩类名 */
export function getLoadingClassNames(state: LhLoadingState): string[] {
  const classes = ['lh-loading']
  if (state.fullscreen) classes.push('lh-loading--fullscreen')
  if (state.withText) classes.push('lh-loading--with-text')
  return classes
}

/**
 * 解析挂载目标：元素原样返回；字符串走 querySelector，未命中回退 body。
 * 不传 target 即全屏（body）。
 */
export function resolveLoadingTarget(target: string | HTMLElement | undefined): HTMLElement {
  if (!target) return document.body
  if (target instanceof HTMLElement) return target
  return document.querySelector<HTMLElement>(target) ?? document.body
}

/** 是否全屏遮罩（目标是 body 即视为全屏） */
export function isLoadingFullscreen(target: HTMLElement): boolean {
  // SSR / 非 DOM 环境守卫：无 document 时无从比较 body，按非全屏处理
  if (typeof document === 'undefined') return false
  return target === document.body
}

/**
 * 指令挂载前确保目标可作为遮罩定位祖先：
 * static 定位的元素补 position: relative，并记录原值供卸载时还原
 */
export function ensurePositioned(target: HTMLElement): { restore: () => void } {
  // SSR / 非浏览器环境守卫：getComputedStyle 依赖 window，无 window 时跳过定位修补
  if (typeof window === 'undefined') return { restore: () => {} }
  const original = target.style.position
  const computed = getComputedStyle(target).position
  if (computed === 'static' || computed === '') {
    target.style.position = 'relative'
    return { restore: () => { target.style.position = original } }
  }
  return { restore: () => {} }
}

/**
 * 加载遮罩的无障碍属性包：
 * - 旋转图标为装饰图形 → aria-hidden
 * - 被遮罩区域标记 aria-busy="true"，读屏软件在加载完成前不播报其陈旧内容
 *
 * @param busy 是否正在加载（false 时返回空对象，供 UI 层无条件 v-bind）
 */
export function getLoadingAria(busy = true): LhAriaAttrs {
  if (!busy) return {}
  return { ...getDecorativeAria(true), 'aria-busy': true }
}
