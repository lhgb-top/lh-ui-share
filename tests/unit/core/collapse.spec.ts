import { describe, expect, it } from 'vitest'
import { getCollapseItemClassNames, normalizeActiveKeys, toggleCollapseKey } from '../../../src/core/collapse'

describe('LhCollapse core', () => {
  it('normalizes active keys from all v-model shapes', () => {
    expect(normalizeActiveKeys(undefined)).toEqual([])
    expect(normalizeActiveKeys('a')).toEqual(['a'])
    expect(normalizeActiveKeys(['a', 2])).toEqual(['a', 2])
  })

  it('toggles in regular mode', () => {
    expect(toggleCollapseKey(['a'], 'b', false)).toEqual(['a', 'b'])
    expect(toggleCollapseKey(['a', 'b'], 'a', false)).toEqual(['b'])
  })

  it('keeps a single key in accordion mode and allows zero', () => {
    expect(toggleCollapseKey(['a'], 'b', true)).toEqual(['b'])
    expect(toggleCollapseKey(['b'], 'b', true)).toEqual([])
  })

  it('computes item class names', () => {
    expect(getCollapseItemClassNames({ active: true, disabled: false })).toEqual([
      'lh-collapse__item',
      'lh-collapse__item--active',
    ])
  })
})
