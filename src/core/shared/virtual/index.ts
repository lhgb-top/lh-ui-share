/**
 * 虚拟滚动共享算法（内核）
 *
 * 定高虚拟滚动原本在 virtual-list 与 table 各有一份实现，连默认过扫描量都不同（2 vs 3），
 * 任一处的修复都不会同步到另一处。这里抽出唯一算法，两处薄封装复用。
 */

export interface LhVirtualRange {
  start: number
  end: number
  offsetY: number
  totalHeight: number
}

/** 默认过扫描行数 */
export const LH_VIRTUAL_OVERSCAN = 2

/**
 * 定高虚拟区间：[start, end) 为实际渲染的下标区间。
 *
 * `first` 钳到 `total - 1`，避免数据收缩后 scrollTop 尚未钳制的那一帧
 * 出现 `start > end`（slice 返回空数组 → 白屏）。
 * 全部入参做非有限净化：NaN 的 scrollTop/viewportHeight/overscan 一旦进入
 * Math.max/floor 会产出 NaN 窗口（slice(NaN) → 白屏）。
 */
export function computeRange(
  scrollTop: number,
  viewportHeight: number,
  itemHeight: number,
  total: number,
  overscan: number = LH_VIRTUAL_OVERSCAN
): LhVirtualRange {
  if (
    !Number.isFinite(itemHeight) ||
    itemHeight <= 0 ||
    !Number.isFinite(total) ||
    total <= 0
  ) {
    return { start: 0, end: 0, offsetY: 0, totalHeight: 0 }
  }
  const safeTop = Number.isFinite(scrollTop) ? scrollTop : 0
  const safeViewport = Number.isFinite(viewportHeight) ? viewportHeight : 0
  const safeOverscan = Number.isFinite(overscan) ? overscan : LH_VIRTUAL_OVERSCAN
  const totalHeight = total * itemHeight
  const first = Math.min(total - 1, Math.floor(Math.max(0, safeTop) / itemHeight))
  const visible = Math.ceil(Math.max(0, safeViewport) / itemHeight)
  const start = Math.max(0, first - safeOverscan)
  const end = Math.min(total, start + visible + safeOverscan * 2)
  return { start, end, offsetY: start * itemHeight, totalHeight }
}

/**
 * 动态高度模式下取指定项的滚动偏移（用于滚动到指定项）。
 *
 * 定高模式调用方直接 `index * itemHeight` 即可，无需本函数。
 * 越界或空列表返回 0。
 */
export function getItemOffsetAt(
  items: { offset: number }[],
  index: number
): number {
  const item = items[index]
  if (!item) return 0
  return item.offset
}

/** 轴无关区间：offset / totalSize 与 LhVirtualRange 的 offsetY / totalHeight 同义 */
export interface LhAxisRange {
  start: number
  end: number
  offset: number
  totalSize: number
}

/**
 * 轴无关定高窗口：纵向虚拟滚动传 scrollTop/viewportHeight/itemHeight，
 * 水平虚拟滚动传 scrollLeft/viewportWidth/itemWidth，算法同一份。
 *
 * 纵向调用方也可继续用 computeRange（同一实现，字段名沿用 offsetY）。
 */
export function computeWindow(
  scrollOffset: number,
  viewportSize: number,
  itemSize: number,
  total: number,
  overscan: number = LH_VIRTUAL_OVERSCAN
): LhAxisRange {
  const range = computeRange(scrollOffset, viewportSize, itemSize, total, overscan)
  return { start: range.start, end: range.end, offset: range.offsetY, totalSize: range.totalHeight }
}
