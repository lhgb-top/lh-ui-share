import type { LhVirtualItem, LhVirtualRange } from './types'

/** 默认过扫描行数 */
export const LH_VIRTUAL_OVERSCAN = 2

/** 默认估算项高 */
export const LH_VIRTUAL_ITEM_SIZE = 40

/**
 * 定高虚拟区间（与 Table 同算法，抽出来供纯列表复用）
 */
export function computeVirtualRange(
  scrollTop: number,
  viewportHeight: number,
  itemHeight: number,
  total: number,
  overscan: number = LH_VIRTUAL_OVERSCAN,
): LhVirtualRange {
  if (itemHeight <= 0 || total <= 0) {
    return { start: 0, end: 0, offsetY: 0, totalHeight: 0 }
  }
  const totalHeight = total * itemHeight
  const first = Math.floor(Math.max(0, scrollTop) / itemHeight)
  const visible = Math.ceil(Math.max(0, viewportHeight) / itemHeight)
  const start = Math.max(0, first - overscan)
  const end = Math.min(total, start + visible + overscan * 2)
  return { start, end, offsetY: start * itemHeight, totalHeight }
}

/**
 * 预计算每项的偏移与总高（动态高度模式）。
 * sizes 缺省项按 defaultSize 估算。
 */
export function buildVirtualItems(
  count: number,
  sizes: number[],
  defaultSize: number = LH_VIRTUAL_ITEM_SIZE,
): { items: LhVirtualItem[]; totalHeight: number } {
  const items: LhVirtualItem[] = []
  let offset = 0
  for (let i = 0; i < count; i++) {
    const size = sizes[i] > 0 ? sizes[i] : defaultSize
    items.push({ size, offset })
    offset += size
  }
  return { items, totalHeight: offset }
}

/**
 * 动态高度模式下按 scrollTop 二分查找可视区间。
 */
export function findVirtualRange(
  items: LhVirtualItem[],
  scrollTop: number,
  viewportHeight: number,
  overscan: number = LH_VIRTUAL_OVERSCAN,
): LhVirtualRange {
  if (items.length === 0) return { start: 0, end: 0, offsetY: 0, totalHeight: 0 }
  const totalHeight = items[items.length - 1].offset + items[items.length - 1].size
  const top = Math.max(0, scrollTop)
  const bottom = top + Math.max(0, viewportHeight)

  // 二分找第一个「底部越过视口顶」的项
  let low = 0
  let high = items.length - 1
  let firstVisible = 0
  while (low <= high) {
    const mid = (low + high) >> 1
    if (items[mid].offset + items[mid].size > top) {
      firstVisible = mid
      high = mid - 1
    } else {
      low = mid + 1
    }
  }

  // 向后扩展直到越过视口底
  let lastVisible = firstVisible
  while (lastVisible + 1 < items.length && items[lastVisible + 1].offset < bottom) {
    lastVisible += 1
  }

  const start = Math.max(0, firstVisible - overscan)
  const end = Math.min(items.length, lastVisible + 1 + overscan)
  return { start, end, offsetY: items[start].offset, totalHeight }
}

/** 容器类名 */
export function getVirtualListClassNames(): string[] {
  return ['lh-virtual-list']
}
