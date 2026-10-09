import { describe, it, expect } from 'vitest'
import {
  computeRange,
  computeWindow,
  getItemOffsetAt,
  LH_VIRTUAL_OVERSCAN,
} from '../../../../src/core/shared/virtual'

describe('shared / computeRange', () => {
  it('returns an empty range for degenerate inputs', () => {
    expect(computeRange(0, 100, 0, 10)).toEqual({ start: 0, end: 0, offsetY: 0, totalHeight: 0 })
    expect(computeRange(0, 100, 20, 0)).toEqual({ start: 0, end: 0, offsetY: 0, totalHeight: 0 })
    expect(computeRange(0, 100, -5, 10)).toEqual({ start: 0, end: 0, offsetY: 0, totalHeight: 0 })
  })

  it('computes the visible window at the top', () => {
    // 20 项、行高 50、视口 200 → 可见 4 行，默认过扫描 2
    const range = computeRange(0, 200, 50, 20)
    expect(range.start).toBe(0)
    expect(range.end).toBe(4 + LH_VIRTUAL_OVERSCAN * 2)
    expect(range.offsetY).toBe(0)
    expect(range.totalHeight).toBe(1000)
  })

  it('advances the window as scrollTop grows', () => {
    const range = computeRange(500, 200, 50, 20)
    // first = 10, start = 8, end = min(20, 8 + 4 + 4) = 16
    expect(range).toEqual({ start: 8, end: 16, offsetY: 400, totalHeight: 1000 })
  })

  it('clamps start so it never exceeds the data (no start > end white screen)', () => {
    // 数据收缩到 5 项，但 scrollTop 仍停在旧位置（2000）：first 钳到 4，end 不超过 total
    const range = computeRange(2000, 200, 50, 5)
    expect(range.start).toBeLessThanOrEqual(range.end)
    expect(range.end).toBe(5)
    expect(range.offsetY).toBe(range.start * 50)
  })

  it('clamps negative scrollTop to the top', () => {
    const range = computeRange(-100, 200, 50, 20)
    expect(range.start).toBe(0)
    expect(range.offsetY).toBe(0)
  })

  it('honours a custom overscan', () => {
    const range = computeRange(0, 200, 50, 20, 0)
    expect(range.start).toBe(0)
    expect(range.end).toBe(4)
  })
})

describe('shared / getItemOffsetAt', () => {
  it('returns the stored offset for a valid index', () => {
    const items = [{ offset: 0 }, { offset: 50 }, { offset: 120 }]
    expect(getItemOffsetAt(items, 1)).toBe(50)
    expect(getItemOffsetAt(items, 2)).toBe(120)
  })

  it('returns 0 for out-of-range indices or empty lists', () => {
    expect(getItemOffsetAt([], 0)).toBe(0)
    expect(getItemOffsetAt([{ offset: 10 }], -1)).toBe(0)
    expect(getItemOffsetAt([{ offset: 10 }], 5)).toBe(0)
  })
})

describe('shared / computeRange NaN purification & computeWindow (round 2)', () => {
  it('sanitizes NaN inputs instead of producing a NaN window', () => {
    // 回归：Math.max(0, NaN) 为 NaN，曾产出 slice(NaN, NaN) → 白屏
    expect(computeRange(NaN, 200, 50, 20)).toEqual({ start: 0, end: 8, offsetY: 0, totalHeight: 1000 })
    expect(computeRange(500, NaN, 50, 20)).toEqual({ start: 8, end: 12, offsetY: 400, totalHeight: 1000 })
    expect(computeRange(0, 200, NaN, 20)).toEqual({ start: 0, end: 0, offsetY: 0, totalHeight: 0 })
    expect(computeRange(0, 200, 50, NaN)).toEqual({ start: 0, end: 0, offsetY: 0, totalHeight: 0 })
    expect(computeRange(0, 200, Infinity, 20)).toEqual({ start: 0, end: 0, offsetY: 0, totalHeight: 0 })
    // NaN overscan 回退默认
    expect(computeRange(500, 200, 50, 20, NaN)).toEqual({
      start: 8,
      end: 16,
      offsetY: 400,
      totalHeight: 1000,
    })
    expect(LH_VIRTUAL_OVERSCAN).toBe(2)
  })

  it('computeWindow is axis-neutral and matches computeRange on the vertical axis', () => {
    expect(computeWindow(500, 200, 50, 20)).toEqual({
      start: 8,
      end: 16,
      offset: 400,
      totalSize: 1000,
    })
    // 水平虚拟滚动：scrollLeft / viewportWidth / itemWidth 传同一算法
    expect(computeWindow(500, 300, 50, 20)).toEqual({
      start: 8,
      end: 18,
      offset: 400,
      totalSize: 1000,
    })
    // 纵向旧入口与轴无关入口结果一致
    const vertical = computeRange(500, 200, 50, 20)
    expect(computeWindow(500, 200, 50, 20).start).toBe(vertical.start)
  })
})
