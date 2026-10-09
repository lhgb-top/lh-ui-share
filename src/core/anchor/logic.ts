import type { LhAnchorItem, LhFlatAnchorItem } from './types'

/** 扁平化锚点（深度优先，保持文档顺序）。祖先链判重保护循环引用 */
export function flattenAnchorItems(
  items: LhAnchorItem[],
  level = 0,
  seen: Set<LhAnchorItem> = new Set()
): LhFlatAnchorItem[] {
  const result: LhFlatAnchorItem[] = []
  for (const item of items) {
    if (seen.has(item)) continue
    seen.add(item)
    result.push({ id: item.id, title: item.title, level })
    if (item.children?.length) {
      result.push(...flattenAnchorItems(item.children, level + 1, seen))
    }
  }
  return result
}

/** 全部锚点 id（扁平顺序） */
export function collectAnchorIds(items: LhAnchorItem[]): string[] {
  return flattenAnchorItems(items).map((item) => item.id)
}

/**
 * 滚动联动：在「各锚点相对容器顶部的偏移」中找出最后一个 <= currentTop 的锚点。
 * offsets 需与 ids 同序（文档顺序）。未命中任何锚点时返回第一个 id。
 */
export function resolveActiveAnchor(ids: string[], offsets: number[], currentTop: number): string {
  if (ids.length === 0) return ''
  let active = ids[0]
  for (let i = 0; i < ids.length; i++) {
    if (offsets[i] <= currentTop) active = ids[i]
    else break
  }
  return active
}

/** 容器的活动标记类名 */
export function getAnchorClassNames(state: { direction: string }): string[] {
  return ['lh-anchor', `lh-anchor--${state.direction}`]
}

/** 锚点链接类名 */
export function getAnchorLinkClassNames(state: { active: boolean; level: number }): string[] {
  const classes = ['lh-anchor__link', `lh-anchor__link--level-${state.level}`]
  if (state.active) classes.push('lh-anchor__link--active')
  return classes
}
