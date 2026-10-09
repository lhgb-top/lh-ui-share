import type { LhVirtualItem, LhVirtualRange } from './types'
import { computeRange, computeWindow, getItemOffsetAt, LH_VIRTUAL_OVERSCAN } from '../shared/virtual'

/** 轴无关定高窗口（水平虚拟化：scrollLeft/viewportWidth/itemWidth，纵向：computeRange） */
export { computeWindow }

/** 默认过扫描行数（共享内核同一绑定，不再本地重复声明） */
export { LH_VIRTUAL_OVERSCAN }

/** 默认估算项高 */
export const LH_VIRTUAL_ITEM_SIZE = 40

/**
 * 定高虚拟区间（委托共享内核算法，与 Table 同源，修复同步）
 *
 * @deprecated 保留兼容别名（vue2 等下游在用）；新代码直接用共享内核 `computeRange`
 */
export function computeVirtualRange(
  scrollTop: number,
  viewportHeight: number,
  itemHeight: number,
  total: number,
  overscan: number = LH_VIRTUAL_OVERSCAN,
): LhVirtualRange {
  return computeRange(scrollTop, viewportHeight, itemHeight, total, overscan)
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
  // 与共享内核 computeRange 同规则：非有限/非正的 defaultSize 会一路污染
  // size / offset / totalHeight（NaNpx 定位失效），回落到默认项高
  const safeDefault =
    Number.isFinite(defaultSize) && defaultSize > 0 ? defaultSize : LH_VIRTUAL_ITEM_SIZE
  const items: LhVirtualItem[] = []
  let offset = 0
  for (let i = 0; i < count; i++) {
    const size = sizes[i] > 0 ? sizes[i] : safeDefault
    items.push({ size, offset })
    offset += size
  }
  return { items, totalHeight: offset }
}

/**
 * 增量更新某一项的实测尺寸并顺移后续偏移（动态测量模式）。
 *
 * 就地修改 items（buildVirtualItems 产出的数组），返回尺寸变化量 delta，
 * 调用方可据此校正 scrollTop。相比全量重建 buildVirtualItems（O(n) 新数组），
 * 这里只遍历一次修正偏移，且不触发未变化项的重渲染 diff。
 */
export function patchMeasuredSize(
  items: LhVirtualItem[],
  index: number,
  size: number,
  defaultSize: number = LH_VIRTUAL_ITEM_SIZE
): number {
  const item = items[index]
  if (!item) return 0
  const next = Number.isFinite(size) && size > 0 ? size : defaultSize
  const delta = next - item.size
  if (delta === 0) return 0
  item.size = next
  for (let i = index + 1; i < items.length; i++) {
    items[i].offset += delta
  }
  return delta
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
  // 与共享内核 computeRange 同规则净化：NaN 进入 Math.max / 二分比较会产出
  // NaN 下标，items[NaN].offset 直接 TypeError 中断渲染。
  // scrollTop 的 +Infinity 保持透传——过度滚动经下面的末项钳制正确渲染尾部
  const top = Number.isNaN(scrollTop) ? 0 : Math.max(0, scrollTop)
  const bottom = top + (Number.isNaN(viewportHeight) ? 0 : viewportHeight)
  // overscan 是「项数」，必须是非负整数：小数会产出小数下标，items[小数] 为
  // undefined，下面 items[start].offset 直接 TypeError
  const safeOverscan = Number.isFinite(overscan)
    ? Math.max(0, Math.floor(overscan))
    : LH_VIRTUAL_OVERSCAN

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

  // 过度滚动（top 超过总高）时没有任何项满足条件，firstVisible 会停在 0，
  // 渲染出列表头部而非尾部——钳到末项
  const last = items[items.length - 1]
  if (last.offset + last.size <= top) {
    firstVisible = items.length - 1
  }

  // 向后扩展直到越过视口底
  let lastVisible = firstVisible
  while (lastVisible + 1 < items.length && items[lastVisible + 1].offset < bottom) {
    lastVisible += 1
  }

  const start = Math.max(0, firstVisible - safeOverscan)
  const end = Math.min(items.length, lastVisible + 1 + safeOverscan)
  return { start, end, offsetY: items[start].offset, totalHeight }
}

/**
 * 动态高度模式下取指定项的滚动偏移（供「滚动到指定项」使用）。
 *
 * 定高模式调用方直接 `index * itemHeight` 即可。
 *
 * @deprecated 保留兼容别名；新代码用共享内核 `getItemOffsetAt`
 */
export function getItemOffset(items: LhVirtualItem[], index: number): number {
  return getItemOffsetAt(items, index)
}

/** 容器类名 */
export function getVirtualListClassNames(): string[] {
  return ['lh-virtual-list']
}
