/**
 * Tabs 组件纯函数逻辑（无框架依赖、无用户文案）
 */

import type { LhTabNavDirection, LhTabRecord, LhTabsPosition, LhTabsType } from './types'
import { getNextListIndex } from '../shared/keyboard'
import type { LhAriaAttrs } from '../shared/a11y'
import type { LhListDirection } from '../shared/keyboard'

/**
 * 计算标签页根类名
 */
export function getTabsClassNames(state: { type: LhTabsType; position: LhTabsPosition }): string[] {
  return ['lh-tabs', `lh-tabs--${state.type}`, `lh-tabs--${state.position}`]
}

/**
 * 解析默认激活页签名：modelValue 有效（存在且未禁用）则用之，否则取第一个可用页签
 *
 * 用 `!= null` 而非真值短路：显式绑定到 name 为空串的页签时也能激活
 * （页签名是业务标识，空串是合法值，不应被当作「未传值」处理）。
 */
export function resolveActiveName(
  records: LhTabRecord[],
  modelValue: string | undefined | null,
): string | null {
  if (
    modelValue != null &&
    records.some((record) => record.name === modelValue && !record.disabled)
  ) {
    return modelValue
  }
  const enabled = records.filter((record) => !record.disabled)
  return enabled.length > 0 ? enabled[0].name : null
}

/**
 * 计算 roving tabindex 键盘导航的目标页签名（无可用目标时返回 null），
 * 仅在可用页签中循环，跳过禁用项
 *
 * @deprecated 导航算法已收敛到 `core/shared/keyboard` 的 `getNextListIndex`，
 * 本外壳保留旧签名与「未知当前值回退首项」的既有语义，供下游既有引用。
 */
export function getNextActiveName(
  records: LhTabRecord[],
  currentName: string,
  direction: LhTabNavDirection,
): string | null {
  const enabled = records.filter((record) => !record.disabled).map((record) => record.name)
  if (enabled.length === 0) return null

  const index = enabled.indexOf(currentName)
  // 当前页签被禁用或未知时，无论方向都回到首个可用页签（保持旧行为）
  if (index < 0) return enabled[0]

  // 旧签名用 next / prev，内核用 1 / -1，在此转换
  const listDirection: LhListDirection =
    direction === 'next' ? 1 : direction === 'prev' ? -1 : direction
  const next = getNextListIndex(enabled, index, listDirection)
  return next < 0 ? null : enabled[next]
}

/**
 * 计算移除页签后的建议激活页签：被移除项激活时，优先其右侧最近可用项，否则左侧最近可用项；
 * 被移除项未激活时维持 currentName；无可用页签返回 null
 */
export function getNameAfterRemove(
  records: LhTabRecord[],
  removedName: string,
  currentName: string,
): string | null {
  if (removedName !== currentName) return currentName
  const names = records.map((record) => record.name)
  const removedIndex = names.indexOf(removedName)
  const rest = records.filter((record) => record.name !== removedName && !record.disabled)
  if (rest.length === 0) return null
  const next = rest.find((record) => names.indexOf(record.name) > removedIndex)
  return next ? next.name : rest[rest.length - 1].name
}

/**
 * 页签栏的无障碍属性包：role="tablist"
 *
 * @param id 页签栏元素 id（页签的 aria-controls 与面板的 aria-labelledby 各自引用，按需传）
 */
export function getTablistAria(id?: string): LhAriaAttrs {
  const attrs: LhAriaAttrs = { role: 'tablist' }
  if (id) attrs.id = id
  return attrs
}

/**
 * 页签的无障碍属性包：role="tab" + aria-selected + aria-controls（指向面板）
 *
 * @param active 是否激活
 * @param disabled 是否禁用
 * @param panelId 面板元素 id（未传时不输出 aria-controls）
 * @param id 页签元素 id（供面板的 aria-labelledby 引用，按需传）
 */
export function getTabAria(options: {
  active: boolean
  disabled?: boolean
  panelId?: string
  id?: string
}): LhAriaAttrs {
  const { active, disabled, panelId, id } = options
  const attrs: LhAriaAttrs = { role: 'tab' }
  if (id) attrs.id = id
  if (panelId) attrs['aria-controls'] = panelId
  if (active) attrs['aria-selected'] = true
  if (disabled) attrs['aria-disabled'] = true
  return attrs
}

/**
 * 面板的无障碍属性包：role="tabpanel" + aria-labelledby（指向激活页签）
 *
 * @param tabId 激活页签元素 id（未传时不输出 aria-labelledby）
 * @param id 面板元素 id（供页签的 aria-controls 引用，按需传）
 */
export function getTabpanelAria(options: { tabId?: string; id?: string } = {}): LhAriaAttrs {
  const { tabId, id } = options
  const attrs: LhAriaAttrs = { role: 'tabpanel' }
  if (id) attrs.id = id
  if (tabId) attrs['aria-labelledby'] = tabId
  return attrs
}
