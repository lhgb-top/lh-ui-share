import { describe, it, expect } from 'vitest'
import {
  getBreadcrumbItemClassNames,
  getCollapsedHiddenIndexes,
  getEllipsisBeforeIndex,
} from '../../../src/core/breadcrumb'

describe('core/breadcrumb', () => {
  it('computes item class names for link and last states', () => {
    expect(getBreadcrumbItemClassNames({ isLast: false, isLink: true })).toEqual([
      'lh-breadcrumb__item',
      'lh-breadcrumb__item--link',
    ])
    expect(getBreadcrumbItemClassNames({ isLast: true, isLink: false })).toEqual([
      'lh-breadcrumb__item',
      'lh-breadcrumb__item--last',
    ])
  })

  it('does not collapse when maxItems is under 2 or total fits', () => {
    expect(getEllipsisBeforeIndex({ total: 5, maxItems: 0 })).toBe(-1)
    expect(getEllipsisBeforeIndex({ total: 5, maxItems: 1 })).toBe(-1)
    expect(getEllipsisBeforeIndex({ total: 5, maxItems: 5 })).toBe(-1)
    expect(getCollapsedHiddenIndexes({ total: 5, maxItems: 5 })).toEqual([])
  })

  it('collapses middle items keeping first and tail', () => {
    // 首项 + 省略号 + 末尾 2 项
    expect(getEllipsisBeforeIndex({ total: 5, maxItems: 3 })).toBe(3)
    expect(getCollapsedHiddenIndexes({ total: 5, maxItems: 3 })).toEqual([1, 2])
  })

  it('scales the visible tail with maxItems', () => {
    expect(getEllipsisBeforeIndex({ total: 6, maxItems: 4 })).toBe(3)
    expect(getCollapsedHiddenIndexes({ total: 6, maxItems: 4 })).toEqual([1, 2])
    expect(getEllipsisBeforeIndex({ total: 2, maxItems: 2 })).toBe(-1)
  })
})
