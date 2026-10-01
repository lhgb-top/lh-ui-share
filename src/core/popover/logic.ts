/**
 * Popover 纯函数逻辑（无框架依赖）
 */

import type { LhPlacement } from '../shared/popper'

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
 */
export function getDefaultDelay(
  showAfter: number | undefined,
  hideAfter: number | undefined
): { show: number; hide: number } {
  return {
    show: showAfter ?? 200,
    hide: hideAfter ?? 100,
  }
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
