/**
 * Popover 纯函数逻辑（无框架依赖）
 */

import type { LhPlacement } from '../shared/popper'
import { resolveDelay } from '../shared/delay'
import { getPopupTriggerAria } from '../shared/a11y'
import type { LhAriaAttrs } from '../shared/a11y'

/** 触发方式 */
export type LhPopoverTrigger = 'click' | 'hover' | 'focus' | 'manual'

/** Popover 组件状态（供纯函数消费的子集） */
export interface LhPopoverState {
  placement?: LhPlacement
  trigger?: LhPopoverTrigger
  width?: string | number
  title?: string
  visible?: boolean
  disabled?: boolean
  arrow?: boolean
  showAfter?: number
  hideAfter?: number
}

/** 合法的触发方式，用于 props 校验 */
export const POPOVER_TRIGGERS: readonly LhPopoverTrigger[] = [
  'click',
  'hover',
  'focus',
  'manual',
] as const

/** 默认方位 */
export const DEFAULT_POPOVER_PLACEMENT: LhPlacement = 'top'

/**
 * 默认显隐延迟：显示沿用 200ms 防误触，隐藏留 100ms
 * 让使用者能把指针从触发器移进弹出层而不触发关闭
 *
 * 归一逻辑在 core/shared/delay，此处只声明该组件的默认节奏。
 */
export function getDefaultDelay(
  showAfter: number | undefined,
  hideAfter: number | undefined
): { show: number; hide: number } {
  return resolveDelay(showAfter, hideAfter, { show: 200, hide: 100 })
}

/**
 * 弹出层类名（方位类名用实际生效的方位，翻转后箭头位置跟着切换）
 */
export function getPopoverClass(state: {
  placement: LhPlacement
  arrow?: boolean
  popperClass?: string
}): string[] {
  const cls = ['lh-popover__popper', `lh-popover__popper--${state.placement}`]
  if (state.arrow !== false) cls.push('lh-popover__popper--arrow')
  if (state.popperClass) cls.push(state.popperClass)
  return cls
}

/**
 * 宽度 prop → 样式
 */
export function getPopoverWidthStyle(width: string | number | undefined): Record<string, string> {
  if (width === undefined || width === null || width === '') return {}
  return { width: typeof width === 'number' ? `${width}px` : width }
}

/**
 * 触发器的无障碍属性包（UI 层 v-bind 到触发元素）：
 * aria-expanded 声明展开态，aria-controls 关联浮层，aria-haspopup 声明弹出类型
 *
 * @param visible 是否可见
 * @param popperId 浮层元素 id（未传时不输出 aria-controls）
 */
export function getPopoverTriggerAria(visible: boolean, popperId?: string): LhAriaAttrs {
  return getPopupTriggerAria({ expanded: visible, popupId: popperId, haspopup: 'true' })
}

/**
 * 浮层的无障碍属性包：role="dialog" 让读屏软件识别为弹出层
 *
 * @param id 浮层元素 id，与触发器的 aria-controls 对应
 * @param titleId 标题元素 id，输出 aria-labelledby 供读屏播报标题
 */
export function getPopoverPopperAria(id?: string, titleId?: string): LhAriaAttrs {
  const attrs: LhAriaAttrs = { role: 'dialog' }
  if (id) attrs.id = id
  if (titleId) attrs['aria-labelledby'] = titleId
  return attrs
}

/**
 * 是否允许按 Esc 关闭（默认允许；disabled 时阻止）
 */
export function canCloseOnEscape(state: Pick<LhPopoverState, 'disabled'>): boolean {
  return !state.disabled
}
