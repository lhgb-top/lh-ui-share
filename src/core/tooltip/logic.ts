/**
 * Tooltip 纯函数逻辑（无框架依赖）
 */

import type { LhTooltipState } from './types'
import { resolveDelay } from '../shared/delay'
import { ariaDescribedby } from '../shared/a11y'
import type { LhAriaAttrs } from '../shared/a11y'

/**
 * @deprecated 保留兼容别名（vue2 等下游在用）；新代码用 {@link getPopperClassNames}（getXxxClassNames 约定）
 */
export function getPopperClass(state: Pick<LhTooltipState, 'effect' | 'placement'>): string[] {
  return [
    'lh-tooltip__popper',
    `lh-tooltip__popper--${state.effect}`,
    `lh-tooltip__popper--${state.placement}`,
  ]
}

/** 弹出层类名（getXxxClassNames 命名约定） */
export function getPopperClassNames(state: Pick<LhTooltipState, 'effect' | 'placement'>): string[] {
  return getPopperClass(state)
}

/**
 * @deprecated 保留兼容别名（vue2 等下游在用）；命名随 {@link getPopperClassNames} 一并审视
 */
export function getPopperStyle(state: Pick<LhTooltipState, 'maxWidth'>): Record<string, string> {
  const style: Record<string, string> = {}
  if (state.maxWidth) {
    style.maxWidth = typeof state.maxWidth === 'number' ? `${state.maxWidth}px` : state.maxWidth
  }
  return style
}

/**
 * 默认显隐延迟：显示 200ms 防误触，隐藏 0ms（移出立即隐藏）
 *
 * 归一逻辑在 core/shared/delay，此处只声明该组件的默认节奏。
 */
export function getDefaultDelay(showDelay: number | undefined, hideDelay: number | undefined): { show: number; hide: number } {
  return resolveDelay(showDelay, hideDelay, { show: 200, hide: 0 })
}

/**
 * 浮层的无障碍属性包：role="tooltip" 让读屏软件识别为文本提示
 *
 * @param id 浮层元素 id，需与触发器的 aria-describedby 指向同一元素
 */
export function getTooltipPopperAria(id?: string): LhAriaAttrs {
  const attrs: LhAriaAttrs = { role: 'tooltip' }
  if (id) attrs.id = id
  return attrs
}

/**
 * 触发器的无障碍属性包：aria-describedby 把浮层文案挂到触发元素上，
 * 读屏软件在播报触发器时会一并读出提示内容
 *
 * @param tooltipId 浮层元素 id（未传时不输出，此时应改用 aria-label 兜底）
 */
export function getTooltipTriggerAria(tooltipId?: string): LhAriaAttrs {
  return ariaDescribedby(tooltipId)
}