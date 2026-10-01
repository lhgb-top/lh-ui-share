/**
 * Breadcrumb 组件纯函数逻辑（无框架依赖、无用户文案）
 */

import type { LhBreadcrumbCollapseState, LhBreadcrumbItemState } from './types'

/**
 * 计算面包屑项类名
 */
export function getBreadcrumbItemClassNames(state: LhBreadcrumbItemState): string[] {
  return [
    'lh-breadcrumb__item',
    state.isLink && 'lh-breadcrumb__item--link',
    state.isLast && 'lh-breadcrumb__item--last',
  ].filter(Boolean) as string[]
}

/**
 * 计算省略号应插在哪个项之前（返回该项索引；不折叠时返回 -1）
 * 折叠规则：保留首项 + 省略号 + 末尾 maxItems-1 项
 */
export function getEllipsisBeforeIndex(state: LhBreadcrumbCollapseState): number {
  const { total, maxItems } = state
  if (maxItems < 2 || total <= maxItems) return -1
  return total - (maxItems - 1)
}

/**
 * 计算折叠时应隐藏的项索引集合（首项与省略号之后的项可见）
 */
export function getCollapsedHiddenIndexes(state: LhBreadcrumbCollapseState): number[] {
  const ellipsisIndex = getEllipsisBeforeIndex(state)
  if (ellipsisIndex < 0) return []
  const hidden: number[] = []
  for (let i = 1; i < ellipsisIndex; i++) hidden.push(i)
  return hidden
}
