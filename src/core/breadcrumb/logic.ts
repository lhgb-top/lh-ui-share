/**
 * Breadcrumb 组件纯函数逻辑（无框架依赖、无用户文案）
 */

import type { LhAriaAttrs } from '../shared/a11y'

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

/**
 * 面包屑项的无障碍属性包：最后一项标记为当前位置（aria-current="page"）
 *
 * @param isLast 是否末项
 * @param href 有链接时输出 role="link" 语义由 UI 层用原生 a 承载，无需此处输出
 */
export function getBreadcrumbItemAria(isLast: boolean): LhAriaAttrs {
  return isLast ? { 'aria-current': 'page' } : {}
}
