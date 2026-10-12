/**
 * Popconfirm 纯函数逻辑（无框架依赖）
 */

import type { LhPlacement } from '../shared/popper'
import { resolveDelay } from '../shared/delay'
import { getPopupTriggerAria } from '../shared/a11y'
import type { LhAriaAttrs } from '../shared/a11y'

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
export const LH_POPCONFIRM_TYPE_DEFAULT: LhPopconfirmType = 'warning'

/** 默认方位 */
export const LH_POPCONFIRM_PLACEMENT_DEFAULT: LhPlacement = 'top'

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
 * 触发器的无障碍属性包（UI 层 v-bind 到触发元素）
 *
 * @param visible 是否可见
 * @param popperId 浮层元素 id（未传时不输出 aria-controls）
 */
export function getPopconfirmTriggerAria(visible: boolean, popperId?: string): LhAriaAttrs {
  return getPopupTriggerAria({ expanded: visible, popupId: popperId, haspopup: 'true' })
}

/**
 * 浮层的无障碍属性包：确认气泡以 dialog 语义呈现
 *
 * @param id 浮层元素 id，与触发器的 aria-controls 对应
 */
export function getPopconfirmPopperAria(id?: string): LhAriaAttrs {
  const attrs: LhAriaAttrs = { role: 'alertdialog' }
  if (id) attrs.id = id
  return attrs
}

/**
 * 是否允许按 Esc 关闭（默认允许；disabled 时阻止）
 */
export function canCloseOnEscape(state: Pick<LhPopconfirmState, 'disabled'>): boolean {
  return !state.disabled
}
