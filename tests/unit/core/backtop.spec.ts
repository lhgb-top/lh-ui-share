import { describe, expect, it } from 'vitest'
import {
  backToTop,
  supportsScrollEnd,
  LH_BACKTOP_SCROLLEND_DELAY,
  getBackTopClassNames,
  getScrollTop,
  isBackTopVisible,
  resolveScrollTarget,
} from '../../../src/core/backtop'

describe('LhBackTop core', () => {
  it('computes class names', () => {
    expect(getBackTopClassNames({ visible: true })).toEqual(['lh-backtop', 'lh-backtop--visible'])
    expect(getBackTopClassNames({ visible: false })).toEqual(['lh-backtop'])
  })

  it('falls back to the window as the scroll root', () => {
    expect(resolveScrollTarget(undefined)).toBe(window)
    expect(resolveScrollTarget('#missing')).toBe(window)
    const el = document.createElement('div')
    expect(resolveScrollTarget(el)).toBe(el)
  })

  it('reads scroll position from container or root', () => {
    const el = document.createElement('div')
    el.scrollTop = 300
    expect(getScrollTop(el)).toBe(300)
    expect(getScrollTop(window)).toBe(document.scrollingElement?.scrollTop ?? 0)
  })

  it('compares against the visibility threshold', () => {
    expect(isBackTopVisible(200, 200)).toBe(true)
    expect(isBackTopVisible(199, 200)).toBe(false)
  })

  it('scrolls back to top without throwing', () => {
    const el = document.createElement('div')
    el.scrollTop = 500
    backToTop(el, true)
    expect(el.scrollTop).toBe(0)
  })
  it('detects native scrollend support and exposes the debounce delay', () => {
    expect(supportsScrollEnd(window)).toBe(false) // jsdom 无原生 scrollend
    expect(supportsScrollEnd(document.createElement('div'))).toBe(false)
    expect(supportsScrollEnd({ scrollend: () => {} } as unknown as Window)).toBe(true)
    expect(LH_BACKTOP_SCROLLEND_DELAY).toBe(150)
  })
})
