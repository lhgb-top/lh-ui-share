import { describe, expect, it } from 'vitest'
import {
  computeStackOffsets,
  getNotificationClassNames,
  getNotificationIconName,
  groupNotificationsByPosition,
  isRightPosition,
  isTopPosition,
} from '../../../src/core/notification'

describe('LhNotification core', () => {
  it('maps semantics to icon names', () => {
    expect(getNotificationIconName('success')).toBe('check')
    expect(getNotificationIconName('danger')).toBe('error')
  })

  it('computes card class names', () => {
    expect(
      getNotificationClassNames({ type: 'info', showClose: true, clickable: true }),
    ).toEqual([
      'lh-notification__item',
      'lh-notification__item--info',
      'lh-notification__item--closable',
      'lh-notification__item--clickable',
    ])
  })

  it('classifies positions by edge', () => {
    expect(isTopPosition('top-right')).toBe(true)
    expect(isTopPosition('bottom-left')).toBe(false)
    expect(isRightPosition('top-right')).toBe(true)
    expect(isRightPosition('bottom-left')).toBe(false)
  })

  it('groups records by position preserving order', () => {
    const groups = groupNotificationsByPosition([
      { id: 1, position: 'top-right' },
      { id: 2, position: 'bottom-left' },
      { id: 3, position: 'top-right' },
    ])
    expect(groups['top-right'].map((r) => r.id)).toEqual([1, 3])
    expect(groups['bottom-left'].map((r) => r.id)).toEqual([2])
    expect(groups['top-left']).toEqual([])
    expect(groups['bottom-right']).toEqual([])
  })

  it('computes cumulative stacking offsets with a gap', () => {
    expect(computeStackOffsets([40, 60, 30], 10)).toEqual([0, 50, 120])
    expect(computeStackOffsets([])).toEqual([])
  })
})
