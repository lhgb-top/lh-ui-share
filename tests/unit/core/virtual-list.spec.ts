import { describe, expect, it } from 'vitest'
import {
  buildVirtualItems,
  computeVirtualRange,
  computeWindow,
  findVirtualRange,
  getItemOffset,
  getVirtualListClassNames,
  patchMeasuredSize,
} from '../../../src/core/virtual-list'

describe('LhVirtualList core', () => {
  it('computes a fixed-height window', () => {
    const range = computeVirtualRange(100, 200, 50, 100, 2)
    expect(range.start).toBe(0)
    expect(range.end).toBe(8)
    expect(range.totalHeight).toBe(5000)
  })

  it('handles degenerate input', () => {
    expect(computeVirtualRange(0, 100, 0, 10)).toEqual({ start: 0, end: 0, offsetY: 0, totalHeight: 0 })
    expect(computeVirtualRange(0, 100, 50, 0).totalHeight).toBe(0)
  })

  it('builds offsets with a default size fallback', () => {
    const { items, totalHeight } = buildVirtualItems(3, [30, 0, 60], 20)
    expect(items.map((i) => i.size)).toEqual([30, 20, 60])
    expect(items.map((i) => i.offset)).toEqual([0, 30, 50])
    expect(totalHeight).toBe(110)
  })

  it('binary-searches a dynamic window', () => {
    const { items } = buildVirtualItems(100, Array.from({ length: 100 }, () => 40))
    const range = findVirtualRange(items, 400, 200, 2)
    expect(range.start).toBe(8)
    expect(range.end).toBe(17)
    expect(range.offsetY).toBe(320)
    expect(range.totalHeight).toBe(4000)
  })

  it('handles empty lists', () => {
    expect(findVirtualRange([], 0, 100)).toEqual({ start: 0, end: 0, offsetY: 0, totalHeight: 0 })
  })

  it('clamps to the last item when scrolled past the end', () => {
    // 回归：过度滚动时二分搜索停在 0，会渲染出列表头部而非尾部；
    // 钳到末项后 start 落在「末项 - overscan」，与定高路径 computeRange 的行为一致
    const { items } = buildVirtualItems(10, Array.from({ length: 10 }, () => 40))
    const range = findVirtualRange(items, 1000, 200, 2)
    expect(range.start).toBe(items.length - 1 - 2)
    expect(range.end).toBe(items.length)
    expect(range.offsetY).toBe(items[items.length - 1 - 2].offset)
  })

  it('clamps the fixed-height window when scrollTop is past the last row', () => {
    const range = computeVirtualRange(50 * 100, 200, 50, 10, 2)
    expect(range.start).toBeLessThanOrEqual(range.end)
    expect(range.end).toBeLessThanOrEqual(10)
  })

  it('returns the container class', () => {
    expect(getVirtualListClassNames()).toEqual(['lh-virtual-list'])
  })

  it('patchMeasuredSize updates one item and shifts later offsets (round 2)', () => {
    const { items } = buildVirtualItems(4, [40, 40, 40, 40])
    const delta = patchMeasuredSize(items, 0, 80)
    expect(delta).toBe(40)
    expect(items[0].size).toBe(80)
    // 后续项偏移顺移，无需全量重建
    expect(items.map((i) => i.offset)).toEqual([0, 80, 120, 160])
    // 收缩同样成立
    expect(patchMeasuredSize(items, 0, 10)).toBe(-70)
    expect(items.map((i) => i.offset)).toEqual([0, 10, 50, 90])
  })

  it('patchMeasuredSize guards invalid index and non-positive sizes', () => {
    const { items } = buildVirtualItems(2, [40, 40])
    expect(patchMeasuredSize(items, 99, 80)).toBe(0)
    // 非正/非法尺寸回退 defaultSize
    expect(patchMeasuredSize(items, 0, 0, 25)).toBe(-15)
    expect(items[0].size).toBe(25)
    expect(patchMeasuredSize(items, 0, NaN, 30)).toBe(5)
    expect(items[0].size).toBe(30)
  })

  it('exposes the deprecated getItemOffset alias and axis-neutral computeWindow', () => {
    const { items } = buildVirtualItems(3, [40, 40, 40])
    expect(getItemOffset(items, 2)).toBe(80)
    expect(computeWindow(100, 200, 40, 10)).toEqual({
      start: 0,
      end: 9,
      offset: 0,
      totalSize: 400,
    })
  })

  // 非有限入参会产出 NaN/小数下标，items[NaN].offset 直接 TypeError 中断渲染
  it('findVirtualRange tolerates NaN / negative / fractional overscan', () => {
    const { items } = buildVirtualItems(10, Array(10).fill(40))
    const baseline = findVirtualRange(items, 120, 80, 2)
    // NaN 回落默认值
    expect(findVirtualRange(items, 120, 80, NaN)).toEqual(baseline)
    // 负数钳到 0，仍在合法区间内
    const neg = findVirtualRange(items, 120, 80, -5)
    expect(neg.start).toBeGreaterThanOrEqual(0)
    expect(neg.end).toBeLessThanOrEqual(items.length)
    // 小数向下取整（小数下标会让 items[start] 为 undefined）
    const frac = findVirtualRange(items, 120, 80, 1.5)
    expect(Number.isInteger(frac.start)).toBe(true)
    expect(Number.isInteger(frac.end)).toBe(true)
  })

  it('findVirtualRange tolerates NaN scrollTop / viewportHeight without crashing', () => {
    const { items } = buildVirtualItems(5, Array(5).fill(40))
    const range = findVirtualRange(items, NaN, NaN, 1)
    expect(range.start).toBe(0)
    expect(range.end).toBeGreaterThanOrEqual(0)
    expect(Number.isFinite(range.offsetY)).toBe(true)
  })

  it('buildVirtualItems falls back when defaultSize is NaN or non-positive', () => {
    const nanItems = buildVirtualItems(3, [0, 0, 0], NaN).items
    expect(nanItems.every((i) => Number.isFinite(i.size) && i.size > 0)).toBe(true)
    expect(nanItems.every((i) => Number.isFinite(i.offset))).toBe(true)
    expect(buildVirtualItems(2, [0, 0], -10).items.map((i) => i.size)).toEqual([40, 40])
  })
})
