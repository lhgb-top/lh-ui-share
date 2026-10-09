import type { LhMenuMode } from './types'
import { getNextListIndex } from '../shared/keyboard'
import type { LhAriaAttrs } from '../shared/a11y'

/** 菜单容器类名 */
export function getMenuClassNames(state: { mode: LhMenuMode; collapse: boolean }): string[] {
  const classes = ['lh-menu']
  classes.push(`lh-menu--${state.mode}`)
  if (state.collapse) classes.push('lh-menu--collapse')
  return classes
}

/** 叶子项类名 */
export function getMenuItemClassNames(state: { active: boolean; disabled: boolean }): string[] {
  const classes = ['lh-menu-item']
  if (state.active) classes.push('lh-menu-item--active')
  if (state.disabled) classes.push('lh-menu-item--disabled')
  return classes
}

/** 子菜单类名 */
export function getSubMenuClassNames(state: { active: boolean; disabled: boolean; opened: boolean }): string[] {
  const classes = ['lh-sub-menu']
  if (state.active) classes.push('lh-sub-menu--active')
  if (state.disabled) classes.push('lh-sub-menu--disabled')
  if (state.opened) classes.push('lh-sub-menu--opened')
  return classes
}

/** 分组类名 */
export function getMenuItemGroupClassNames(): string[] {
  return ['lh-menu-item-group']
}

/**
 * 切换子菜单展开态：
 * - 手风琴：只保留目标（再次点击收起，允许零开）
 * - 常规：增删
 */
export function toggleMenuOpen(openeds: string[], key: string, uniqueOpened: boolean): string[] {
  if (uniqueOpened) {
    return openeds.includes(key) ? [] : [key]
  }
  return openeds.includes(key) ? openeds.filter((k) => k !== key) : [...openeds, key]
}

/** 子菜单是否展开 */
export function isMenuOpen(openeds: string[], key: string): boolean {
  return openeds.includes(key)
}

/**
 * 垂直内联模式的 ↑/↓ 焦点移动：在传入的可见项（叶子项 + 子菜单标题，DOM 序）
 * 间循环移动，跳过禁用项（tabindex 为 -1）。纯函数，DOM 查询与 focus 由调用方负责。
 *
 * currentEl 不在列表中（如已被收起面板移出）时回退到首项。
 *
 * @deprecated 循环导航算法已收敛到 `core/shared/keyboard` 的 `getNextListIndex`，
 * 本外壳保留旧签名与 DOM 元素入参，供下游既有引用。
 */
export function moveMenuFocus(
  items: HTMLElement[],
  currentEl: HTMLElement | null,
  direction: 1 | -1,
): HTMLElement | null {
  // tabindex 为 -1 的项不在 Tab 序列中，等价于内核的 disabled 项
  const focusable = items.filter((el) => el.tabIndex !== -1)
  if (focusable.length === 0) return null
  if (!currentEl) return focusable[0]
  const index = focusable.indexOf(currentEl)
  if (index === -1) return focusable[0]

  const next = getNextListIndex(focusable, index, direction)
  return next < 0 ? null : focusable[next]
}

/**
 * 菜单容器的无障碍属性包：role="menu"
 *
 * @param id 菜单元素 id（菜单项的 aria-controls 等引用，按需传）
 */
export function getMenuAria(id?: string): LhAriaAttrs {
  const attrs: LhAriaAttrs = { role: 'menu' }
  if (id) attrs.id = id
  return attrs
}

/**
 * 菜单项的无障碍属性包：role="menuitem"，禁用时输出 aria-disabled
 */
export function getMenuItemAria(state: { disabled?: boolean }): LhAriaAttrs {
  const attrs: LhAriaAttrs = { role: 'menuitem' }
  if (state.disabled) attrs['aria-disabled'] = true
  return attrs
}

/**
 * 子菜单标题的无障碍属性包：role="menuitem" + aria-expanded（声明子级展开态）
 *
 * @param opened 子级是否展开
 * @param disabled 是否禁用
 * @param menuId 子级菜单元素 id（未传时不输出 aria-controls）
 */
export function getSubMenuAria(options: {
  opened: boolean
  disabled?: boolean
  menuId?: string
}): LhAriaAttrs {
  const { opened, disabled, menuId } = options
  const attrs: LhAriaAttrs = { role: 'menuitem', 'aria-expanded': opened }
  if (menuId) attrs['aria-controls'] = menuId
  if (disabled) attrs['aria-disabled'] = true
  return attrs
}
