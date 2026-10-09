import { describe, expect, it } from 'vitest'
import {
  collectAnchorIds,
  flattenAnchorItems,
  getAnchorClassNames,
  getAnchorLinkClassNames,
  resolveActiveAnchor,
} from '../../../src/core/anchor'

const items = [
  { id: 'a', title: '甲' },
  { id: 'b', title: '乙', children: [{ id: 'b-1', title: '乙一' }] },
]

describe('LhAnchor core', () => {
  it('flattens nested anchors with levels', () => {
    expect(flattenAnchorItems(items)).toEqual([
      { id: 'a', title: '甲', level: 0 },
      { id: 'b', title: '乙', level: 0 },
      { id: 'b-1', title: '乙一', level: 1 },
    ])
  })

  it('collects ids in document order', () => {
    expect(collectAnchorIds(items)).toEqual(['a', 'b', 'b-1'])
  })

  it('resolves the active anchor by offsets', () => {
    const ids = ['a', 'b', 'c']
    const offsets = [-200, -50, 100]
    expect(resolveActiveAnchor(ids, offsets, 0)).toBe('b')
    expect(resolveActiveAnchor(ids, offsets, -300)).toBe('a')
    expect(resolveActiveAnchor(ids, offsets, 200)).toBe('c')
    expect(resolveActiveAnchor([], [], 0)).toBe('')
  })

  it('computes class names', () => {
    expect(getAnchorClassNames({ direction: 'horizontal' })).toEqual(['lh-anchor', 'lh-anchor--horizontal'])
    expect(getAnchorLinkClassNames({ active: true, level: 1 })).toEqual([
      'lh-anchor__link',
      'lh-anchor__link--level-1',
      'lh-anchor__link--active',
    ])
  })

  it('terminates on cyclic anchor items (round 2)', () => {
    // 回归：tree/cascader/table 都有环守卫，anchor 的递归被遗漏
    const cyclic = [{ id: 'a', title: '甲', children: [] as never[] }] as Parameters<
      typeof flattenAnchorItems
    >[0]
    cyclic[0].children = cyclic
    expect(collectAnchorIds(cyclic)).toEqual(['a'])
    expect(flattenAnchorItems(cyclic)).toHaveLength(1)
  })
})
