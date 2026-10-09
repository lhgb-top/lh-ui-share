/**
 * Pagination 组件纯函数逻辑（无框架依赖、无用户文案）
 */

import type { LhAriaAttrs } from '../shared/a11y'

import type { LhPaginationRangeItem, LhPaginationRangeState } from './types'
import { sanitizeNumber } from '../shared/sanitize'

// 文案插值唯一实现在 core/shared/format（共享内核）；这里以同绑定再导出保持原有导入路径兼容
export { formatMessage } from '../shared/format'

/**
 * 由总数与每页条数计算总页数（最小为 1）
 *
 * 双参数都过 sanitizeNumber：NaN/Infinity 的 total/pageSize 不会穿透成 NaN 页数
 */
export function getPageCount(total: number, pageSize: number): number {
  const safeTotal = sanitizeNumber(total, 0, { min: 0, integer: true })
  const safePageSize = sanitizeNumber(pageSize, 1, { min: 1, integer: true })
  return Math.max(1, Math.ceil(safeTotal / safePageSize))
}

/**
 * 将任意页码钳制到 [1, pageCount]。
 *
 * 非有限数（NaN 等）回退到 1，避免 NaN 传播到下游 slice / 渲染；
 * pageCount 自身钳到 >= 1。
 */
export function clampPage(page: number, pageCount: number): number {
  // pageCount 非有限时视为 1 页，避免 Math.max(1, NaN) 仍为 NaN 污染返回值
  const pc = sanitizeNumber(pageCount, 1, { min: 1, integer: true })
  // 仅 NaN 视为非法回到首页；±Infinity 交给后面的钳制，Infinity 落到末页
  if (Number.isNaN(page)) return 1
  return Math.min(Math.max(1, Math.floor(page)), pc)
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
 *
 * current 先经 clampPage 归一到 [1, pageCount]：UI 层透传的 innerCurrent
 * 可能短暂越界（受控模式下外部值不同步、总数变小未同步 current），
 * 不钳制会导致当前页落在显示窗口之外、省略号判定反转。
 */
export function getPaginationRange(state: LhPaginationRangeState): LhPaginationRangeItem[] {
  const pageCount = state.pageCount
  const current = clampPage(state.current, pageCount)
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
 * 页码按钮的无障碍属性包：当前页输出 aria-current="page"，其余给 aria-label
 *
 * @param page 该按钮代表的页码（1 起）
 * @param current 当前页
 * @param labelTemplate 可达名称模板（如「第 {page} 页」，由 UI 层从 locale 取并替换）
 */
export function getPaginationItemAria(options: {
  page: number
  current: number
  labelTemplate?: string
}): LhAriaAttrs {
  const { page, current, labelTemplate } = options
  const attrs: LhAriaAttrs = {}
  if (page === current) attrs['aria-current'] = 'page'
  if (labelTemplate) attrs['aria-label'] = labelTemplate.replace('{page}', String(page))
  return attrs
}
