/**
 * Dropdown 纯函数逻辑（无框架依赖）
 */

import type { LhPlacement } from '../shared/popper'
import { getPopupTriggerAria } from '../shared/a11y'
import type { LhAriaAttrs } from '../shared/a11y'

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

/**
 * 触发器的无障碍属性包：下拉菜单以 menu 语义弹出
 *
 * @param visible 是否可见
 * @param menuId 菜单元素 id（未传时不输出 aria-controls）
 */
export function getDropdownTriggerAria(visible: boolean, menuId?: string): LhAriaAttrs {
  return getPopupTriggerAria({ expanded: visible, popupId: menuId, haspopup: 'menu' })
}

/**
 * 菜单容器的无障碍属性包：role="menu"
 *
 * @param id 菜单元素 id，与触发器的 aria-controls 对应
 */
export function getDropdownMenuAria(id?: string): LhAriaAttrs {
  const attrs: LhAriaAttrs = { role: 'menu' }
  if (id) attrs.id = id
  return attrs
}

/**
 * 菜单项的无障碍属性包：role="menuitem"，禁用项输出 aria-disabled
 */
export function getDropdownItemAria(state: Pick<LhDropdownItemState, 'disabled'>): LhAriaAttrs {
  const attrs: LhAriaAttrs = { role: 'menuitem' }
  if (state.disabled) attrs['aria-disabled'] = true
  return attrs
}
