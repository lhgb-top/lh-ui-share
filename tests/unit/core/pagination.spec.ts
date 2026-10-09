import { describe, it, expect } from 'vitest'
import {
  clampPage,
  formatMessage,
  getPaginationRange,
  getPageCount,
  getPaginationItemAria,
} from '../../../src/core/pagination'

describe('core/pagination', () => {
  it('computes page count from total and page size', () => {
    expect(getPageCount(100, 10)).toBe(10)
    expect(getPageCount(101, 10)).toBe(11)
    expect(getPageCount(95, 10)).toBe(10)
    expect(getPageCount(0, 10)).toBe(1)
    expect(getPageCount(100, 0)).toBe(100)
  })

  it('clamps page into [1, pageCount]', () => {
    expect(clampPage(5, 10)).toBe(5)
    expect(clampPage(0, 10)).toBe(1)
    expect(clampPage(-3, 10)).toBe(1)
    expect(clampPage(99, 10)).toBe(10)
  })

  it('falls back to page 1 for non-finite pages or page counts', () => {
    // NaN 页码曾经直接穿透 Math.min/max 污染下游 slice
    expect(clampPage(NaN, 10)).toBe(1)
    expect(clampPage(Infinity, 10)).toBe(10)
    // pageCount 至少为 1，避免 0 页时分母/边界失效
    expect(clampPage(5, 0)).toBe(1)
    expect(clampPage(5, NaN)).toBe(1)
  })

  it('returns all pages when pageCount fits the slot budget', () => {
    const range = getPaginationRange({ current: 2, pageCount: 7 })
    expect(range.map((item) => item.page)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(range.every((item) => item.type === 'page')).toBe(true)
  })

  it('snaps to leading pages near the left edge', () => {
    const range = getPaginationRange({ current: 1, pageCount: 10 })
    expect(range).toEqual([
      { type: 'page', page: 1 },
      { type: 'page', page: 2 },
      { type: 'page', page: 3 },
      { type: 'page', page: 4 },
      { type: 'page', page: 5 },
      { type: 'ellipsis', page: 0 },
      { type: 'page', page: 10 },
    ])
  })

  it('shows both ellipses in the middle', () => {
    const range = getPaginationRange({ current: 5, pageCount: 10 })
    expect(range).toEqual([
      { type: 'page', page: 1 },
      { type: 'ellipsis', page: 0 },
      { type: 'page', page: 4 },
      { type: 'page', page: 5 },
      { type: 'page', page: 6 },
      { type: 'ellipsis', page: 0 },
      { type: 'page', page: 10 },
    ])
  })

  it('snaps to trailing pages near the right edge', () => {
    const range = getPaginationRange({ current: 10, pageCount: 10 })
    expect(range).toEqual([
      { type: 'page', page: 1 },
      { type: 'ellipsis', page: 0 },
      { type: 'page', page: 6 },
      { type: 'page', page: 7 },
      { type: 'page', page: 8 },
      { type: 'page', page: 9 },
      { type: 'page', page: 10 },
    ])
  })

  it('widens the window with siblingCount', () => {
    const range = getPaginationRange({ current: 10, pageCount: 20, siblingCount: 2 })
    expect(range).toEqual([
      { type: 'page', page: 1 },
      { type: 'ellipsis', page: 0 },
      { type: 'page', page: 8 },
      { type: 'page', page: 9 },
      { type: 'page', page: 10 },
      { type: 'page', page: 11 },
      { type: 'page', page: 12 },
      { type: 'ellipsis', page: 0 },
      { type: 'page', page: 20 },
    ])
  })

  it('clamps an out-of-range current so the active page stays in the window', () => {
    // 受控模式下外部 current 可能短暂越界（总数变小未同步），不钳制会让
    // 当前页落在窗口外、省略号判定反转
    const over = getPaginationRange({ current: 99, pageCount: 10 })
    expect(over).toEqual(getPaginationRange({ current: 10, pageCount: 10 }))
    expect(over.some((i) => i.type === 'page' && i.page === 10)).toBe(true)

    const under = getPaginationRange({ current: -5, pageCount: 10 })
    expect(under).toEqual(getPaginationRange({ current: 1, pageCount: 10 }))
    expect(under.some((i) => i.type === 'page' && i.page === 1)).toBe(true)
  })

  it('interpolates message templates and keeps unknown placeholders', () => {
    expect(formatMessage('共 {total} 条', { total: 100 })).toBe('共 100 条')
    expect(formatMessage('Page {page} of {pageCount}', { page: 2, pageCount: 9 })).toBe(
      'Page 2 of 9',
    )
    expect(formatMessage('共 {total} 条', {})).toBe('共 {total} 条')
  })

  it('purifies non-finite total/pageSize instead of leaking NaN (round 2)', () => {
    // 回归：getPageCount 曾对 NaN/Infinity 直接透传，污染下游 slice / 渲染
    expect(getPageCount(NaN, 10)).toBe(1)
    expect(getPageCount(Infinity, 10)).toBe(1)
    // pageSize 非法回退 1 条/页
    expect(getPageCount(100, NaN)).toBe(100)
  })
})

describe('LhPagination accessibility', () => {
  it('marks the current page and labels buttons', () => {
    expect(getPaginationItemAria({ page: 2, current: 2, labelTemplate: '第 {page} 页' })).toEqual({
      'aria-current': 'page',
      'aria-label': '第 2 页',
    })
    expect(getPaginationItemAria({ page: 1, current: 2 })).toEqual({})
  })
})