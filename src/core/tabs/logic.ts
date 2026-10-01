/**
 * Tabs 组件纯函数逻辑（无框架依赖、无用户文案）
 */

import type { LhTabNavDirection, LhTabRecord, LhTabsPosition, LhTabsType } from './types'

/**
 * 计算标签页根类名
 */
export function getTabsClassNames(state: { type: LhTabsType; position: LhTabsPosition }): string[] {
  return ['lh-tabs', `lh-tabs--${state.type}`, `lh-tabs--${state.position}`]
}

/**
 * 解析默认激活页签名：modelValue 有效（存在且未禁用）则用之，否则取第一个可用页签
 */
export function resolveActiveName(
  records: LhTabRecord[],
  modelValue: string | undefined | null,
): string | null {
  if (modelValue && records.some((record) => record.name === modelValue && !record.disabled)) {
    return modelValue
  }
  const enabled = records.filter((record) => !record.disabled)
  return enabled.length > 0 ? enabled[0].name : null
}

/**
 * 计算 roving tabindex 键盘导航的目标页签名（无可用目标时返回 null），
 * 仅在可用页签中循环，跳过禁用项
 */
export function getNextActiveName(
  records: LhTabRecord[],
  currentName: string,
  direction: LhTabNavDirection,
): string | null {
  const enabled = records.filter((record) => !record.disabled).map((record) => record.name)
  if (enabled.length === 0) return null

  switch (direction) {
    case 'first':
      return enabled[0]
    case 'last':
      return enabled[enabled.length - 1]
    case 'next': {
      const index = enabled.indexOf(currentName)
      return index < 0 ? enabled[0] : enabled[(index + 1) % enabled.length]
    }
    case 'prev': {
      const index = enabled.indexOf(currentName)
      return index < 0 ? enabled[0] : enabled[(index - 1 + enabled.length) % enabled.length]
    }
  }
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
