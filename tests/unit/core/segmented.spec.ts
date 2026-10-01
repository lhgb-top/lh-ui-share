import { describe, expect, it } from 'vitest'
import {
  getSegmentedClassNames,
  moveSegmentedIndex,
  normalizeSegmentedOptions,
} from '../../../src/core/segmented'

describe('LhSegmented core', () => {
  it('normalizes string shorthand and objects', () => {
    expect(normalizeSegmentedOptions(['a', { label: 'B', value: 'b', disabled: true }])).toEqual([
      { label: 'a', value: 'a', disabled: false },
      { label: 'B', value: 'b', disabled: true },
    ])
  })

  it('moves with roving tabindex skipping disabled options', () => {
    const options = normalizeSegmentedOptions([
      { label: '1', value: 1 },
      { label: '2', value: 2, disabled: true },
      { label: '3', value: 3 },
    ])
    expect(moveSegmentedIndex(options, 0, 1)).toBe(2)
    expect(moveSegmentedIndex(options, 2, 1)).toBe(0)
    expect(moveSegmentedIndex(options, 2, -1)).toBe(0)
  })

  it('computes class names', () => {
    expect(getSegmentedClassNames({ disabled: false, block: true })).toEqual([
      'lh-segmented',
      'lh-segmented--block',
    ])
  })
})
