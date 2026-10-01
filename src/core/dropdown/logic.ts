/**
 * Dropdown 纯函数逻辑（无框架依赖）
 */

import type { LhPlacement } from '../shared/popper'

/** 触发方式 */
export type LhDropdownTrigger = 'hover' | 'click' | 'contextmenu'

/** Dropdown 组件状态（供纯函数消费的子集） */
export interface LhDropdownState {
  trigger?: LhDropdownTrigger
  placement?: LhPlacement
  visible?: boolean
  disabled?: boolean
  hideOnClick?: boolean
}

/** 菜单项状态 */
export interface LhDropdownItemState {
  command?: string | number
  disabled?: boolean
  divided?: boolean
}

export const DEFAULT_DROPDOWN_PLACEMENT: LhPlacement = 'bottom-start'

export const DROPDOWN_TRIGGERS: readonly LhDropdownTrigger[] = [
  'hover',
  'click',
  'contextmenu',
] as const

export function getDropdownClass(state: {
  placement: LhPlacement
  popperClass?: string
}): string[] {
  const cls = ['lh-dropdown__menu', `lh-dropdown__menu--${state.placement}`]
  if (state.popperClass) cls.push(state.popperClass)
  return cls
}

export function getDropdownItemClass(state: {
  disabled?: boolean
  divided?: boolean
}): string[] {
  const cls = ['lh-dropdown__item']
  if (state.disabled) cls.push('lh-dropdown__item--disabled')
  if (state.divided) cls.push('lh-dropdown__item--divided')
  return cls
}

export function getDropdownMenuStyle(maxHeight: string | number | undefined): Record<string, string> {
  if (maxHeight === undefined || maxHeight === null || maxHeight === '') return {}
  return { maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight, overflow: 'auto' }
}
