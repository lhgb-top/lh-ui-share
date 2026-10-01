import { describe, it, expect } from 'vitest'
import {
  clampPage,
  formatMessage,
  getPaginationRange,
  getPageCount,
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

  it('interpolates message templates and keeps unknown placeholders', () => {
    expect(formatMessage('共 {total} 条', { total: 100 })).toBe('共 100 条')
    expect(formatMessage('Page {page} of {pageCount}', { page: 2, pageCount: 9 })).toBe(
      'Page 2 of 9',
    )
    expect(formatMessage('共 {total} 条', {})).toBe('共 {total} 条')
  })
})
