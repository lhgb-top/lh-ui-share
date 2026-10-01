import type { LhCollapseKey } from './types'

/** 归一激活键为数组（受控 v-model 可能传单值 / 数组 / undefined） */
export function normalizeActiveKeys(value: LhCollapseKey | LhCollapseKey[] | undefined): LhCollapseKey[] {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

/**
 * 切换一个键的激活态：
 * - 手风琴：同时只保留一个（再次点击收起，允许零开）
 * - 常规：在数组中增删
 */
export function toggleCollapseKey(
  keys: LhCollapseKey[],
  key: LhCollapseKey,
  accordion: boolean,
): LhCollapseKey[] {
  if (accordion) {
    return keys.includes(key) ? [] : [key]
  }
  return keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key]
}

/** 面板项类名 */
export function getCollapseItemClassNames(state: { active: boolean; disabled: boolean }): string[] {
  const classes = ['lh-collapse__item']
  if (state.active) classes.push('lh-collapse__item--active')
  if (state.disabled) classes.push('lh-collapse__item--disabled')
  return classes
}
