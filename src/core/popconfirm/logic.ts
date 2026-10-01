/**
 * Popconfirm 纯函数逻辑（无框架依赖）
 */

import type { LhPlacement } from '../shared/popper'

/** 确认语气 */
export type LhPopconfirmType = 'info' | 'warning' | 'danger'

/** 触发方式 */
export type LhPopconfirmTrigger = 'click' | 'hover' | 'focus' | 'manual'

/** Popconfirm 组件状态（供纯函数消费的子集） */
export interface LhPopconfirmState {
  type?: LhPopconfirmType
  trigger?: LhPopconfirmTrigger
  placement?: LhPlacement
  visible?: boolean
  disabled?: boolean
  showIcon?: boolean
}

/** 默认语气 */
export const DEFAULT_POPCONFIRM_TYPE: LhPopconfirmType = 'warning'

/** 默认方位 */
export const DEFAULT_POPCONFIRM_PLACEMENT: LhPlacement = 'top'

/** 各语气对应的图标名 */
const POPCONFIRM_ICONS: Record<LhPopconfirmType, string> = {
  info: 'info',
  warning: 'warning',
  danger: 'error',
}

export function getPopconfirmIconName(type: LhPopconfirmType): string {
  return POPCONFIRM_ICONS[type] ?? POPCONFIRM_ICONS.warning
}

export function getPopconfirmClass(state: {
  type: LhPopconfirmType
  placement: LhPlacement
  popperClass?: string
}): string[] {
  const cls = [
    'lh-popconfirm__popper',
    `lh-popconfirm__popper--${state.type}`,
    `lh-popconfirm__popper--${state.placement}`,
  ]
  if (state.popperClass) cls.push(state.popperClass)
  return cls
}

/**
 * 默认显隐延迟：确认气泡跟随 Popover 的节奏
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
