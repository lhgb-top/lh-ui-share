import { describe, it, expect } from 'vitest'
import {
  getNameAfterRemove,
  getNextActiveName,
  getTabsClassNames,
  resolveActiveName,
} from '../../../src/core/tabs'
import type { LhTabRecord } from '../../../src/core/tabs'

const records: LhTabRecord[] = [
  { name: 'a', label: 'A', disabled: false },
  { name: 'b', label: 'B', disabled: true },
  { name: 'c', label: 'C', disabled: false },
  { name: 'd', label: 'D', disabled: false },
]

describe('core/tabs', () => {
  it('computes root class names by type and position', () => {
    expect(getTabsClassNames({ type: 'line', position: 'top' })).toEqual([
      'lh-tabs',
      'lh-tabs--line',
      'lh-tabs--top',
    ])
    expect(getTabsClassNames({ type: 'card', position: 'bottom' })).toEqual([
      'lh-tabs',
      'lh-tabs--card',
      'lh-tabs--bottom',
    ])
  })

  it('resolves the active name with valid modelValue first', () => {
    expect(resolveActiveName(records, 'c')).toBe('c')
  })

  it('falls back to the first enabled tab for missing or disabled modelValue', () => {
    expect(resolveActiveName(records, undefined)).toBe('a')
    expect(resolveActiveName(records, 'b')).toBe('a')
    expect(resolveActiveName(records, 'missing')).toBe('a')
  })

  it('returns null when every tab is disabled', () => {
    const allDisabled: LhTabRecord[] = [{ name: 'a', label: 'A', disabled: true }]
    expect(resolveActiveName(allDisabled, undefined)).toBe(null)
  })

  it('moves focus through enabled tabs only', () => {
    expect(getNextActiveName(records, 'a', 'next')).toBe('c')
    expect(getNextActiveName(records, 'c', 'next')).toBe('d')
    expect(getNextActiveName(records, 'd', 'next')).toBe('a')
    expect(getNextActiveName(records, 'a', 'prev')).toBe('d')
    expect(getNextActiveName(records, 'c', 'prev')).toBe('a')
    expect(getNextActiveName(records, 'c', 'first')).toBe('a')
    expect(getNextActiveName(records, 'c', 'last')).toBe('d')
  })

  it('falls back to the first enabled tab for unknown current name', () => {
    expect(getNextActiveName(records, 'b', 'next')).toBe('a')
  })

  it('returns null when no enabled tabs exist', () => {
    const allDisabled: LhTabRecord[] = [{ name: 'a', label: 'A', disabled: true }]
    expect(getNextActiveName(allDisabled, 'a', 'next')).toBe(null)
  })

  it('keeps the current name when another tab is removed', () => {
    expect(getNameAfterRemove(records, 'c', 'a')).toBe('a')
  })

  it('activates the nearest enabled neighbour after removing the active tab', () => {
    // 移除 a（激活中）：右侧最近可用是 c
    expect(getNameAfterRemove(records, 'a', 'a')).toBe('c')
    // 移除 d（激活中）：右侧无可用，回退左侧 c
    expect(getNameAfterRemove(records, 'd', 'd')).toBe('c')
  })

  it('returns null when removal leaves no enabled tabs', () => {
    const single: LhTabRecord[] = [{ name: 'a', label: 'A', disabled: false }]
    expect(getNameAfterRemove(single, 'a', 'a')).toBe(null)
  })
})
