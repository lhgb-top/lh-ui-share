import { describe, expect, it } from 'vitest'
import {
  buildVirtualItems,
  computeVirtualRange,
  findVirtualRange,
  getVirtualListClassNames,
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

  it('returns the container class', () => {
    expect(getVirtualListClassNames()).toEqual(['lh-virtual-list'])
  })
})
