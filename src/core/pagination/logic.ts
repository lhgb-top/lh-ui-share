/**
 * Pagination 组件纯函数逻辑（无框架依赖、无用户文案）
 */

import type { LhPaginationMessageParams, LhPaginationRangeItem, LhPaginationRangeState } from './types'

/**
 * 由总数与每页条数计算总页数（最小为 1）
 */
export function getPageCount(total: number, pageSize: number): number {
  const safeTotal = Math.max(0, Math.floor(total))
  const safePageSize = Math.max(1, Math.floor(pageSize))
  return Math.max(1, Math.ceil(safeTotal / safePageSize))
}

/**
 * 将任意页码钳制到 [1, pageCount]
 */
export function clampPage(page: number, pageCount: number): number {
  return Math.min(Math.max(1, Math.floor(page)), pageCount)
}

function range(start: number, end: number): LhPaginationRangeItem[] {
  const items: LhPaginationRangeItem[] = []
  for (let i = start; i <= end; i++) items.push({ type: 'page', page: i })
  return items
}

function ellipsis(): LhPaginationRangeItem {
  return { type: 'ellipsis', page: 0 }
}

/**
 * 计算页码区间（含省略号），综合各开源库通行的窗口收缩算法：
 * 首末页常驻；当前页两侧各显示 siblingCount 个页码；不足时向边缘吸附；
 * 仅在真正产生间隙时输出省略号
 */
export function getPaginationRange(state: LhPaginationRangeState): LhPaginationRangeItem[] {
  const { current, pageCount } = state
  const siblingCount = Math.max(0, Math.floor(state.siblingCount ?? 1))
  const totalSlots = siblingCount * 2 + 5

  if (pageCount <= totalSlots) return range(1, pageCount)

  const leftSibling = Math.max(1, current - siblingCount)
  const rightSibling = Math.min(pageCount, current + siblingCount)
  const showLeftEllipsis = leftSibling > 2
  const showRightEllipsis = rightSibling < pageCount - 1

  // 当前页靠近左侧：多显示左侧页码 + 右侧省略号
  if (!showLeftEllipsis && showRightEllipsis) {
    const leftCount = 3 + siblingCount * 2
    return [...range(1, leftCount), ellipsis(), { type: 'page', page: pageCount }]
  }

  // 当前页靠近右侧：左侧省略号 + 多显示右侧页码
  if (showLeftEllipsis && !showRightEllipsis) {
    const rightCount = 3 + siblingCount * 2
    return [
      { type: 'page', page: 1 },
      ellipsis(),
      ...range(pageCount - rightCount + 1, pageCount),
    ]
  }

  // 中间：首末 + 双侧省略号 + 当前窗口
  if (showLeftEllipsis && showRightEllipsis) {
    return [
      { type: 'page', page: 1 },
      ellipsis(),
      ...range(leftSibling, rightSibling),
      ellipsis(),
      { type: 'page', page: pageCount },
    ]
  }

  return range(1, pageCount)
}

/**
 * 文案模板插值：'{total}' 形式的占位符替换为参数值；未知占位符原样保留
 */
export function formatMessage(template: string, params: LhPaginationMessageParams): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  )
}
