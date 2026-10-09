import { describe, expect, it } from 'vitest'
import {
  computeStackOffsets,
  getNotificationClassNames,
  getNotificationIconName,
  groupNotificationsByPosition,
  isRightPosition,
  isTopPosition,
  getNotificationAria,
  getNotificationRole,
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

  it('routes unknown positions into top-right instead of throwing (round 2)', () => {
    // 回归：JS 侧脏 position（undefined / 非法串）曾让 groups[item.position] 为
    // undefined → TypeError，殃及整队合法通知的分组
    const dirty = [{ id: 1, position: 'nowhere' }] as Parameters<
      typeof groupNotificationsByPosition
    >[0]
    const groups = groupNotificationsByPosition(dirty)
    expect(groups['top-right']).toHaveLength(1)
    expect(groups['top-right'][0].id).toBe(1)
  })
})

describe('LhNotification accessibility', () => {
  it('maps semantics to live region roles like alert and message do', () => {
    expect(getNotificationRole('danger')).toBe('alert')
    expect(getNotificationRole('warning')).toBe('alert')
    expect(getNotificationRole('info')).toBe('status')
    expect(getNotificationAria('error')).toEqual({ role: 'alert' })
  })
})