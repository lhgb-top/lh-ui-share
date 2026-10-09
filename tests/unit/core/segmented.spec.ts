import { describe, expect, it } from 'vitest'
import {
  getSegmentedClassNames,
  isSegmentedDisabled,
  moveSegmentedIndex,
  normalizeSegmentedOptions,
  getSegmentedAria,
  getSegmentedItemAria,
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

  it('isSegmentedDisabled is true only when the prop says so or every option is disabled', () => {
    const mixed = normalizeSegmentedOptions(['a', { label: 'B', value: 'b', disabled: true }])
    const allDisabled = normalizeSegmentedOptions([
      { label: 'A', value: 'a', disabled: true },
      { label: 'B', value: 'b', disabled: true },
    ])
    expect(isSegmentedDisabled(mixed, false)).toBe(false)
    expect(isSegmentedDisabled(allDisabled)).toBe(true)
    expect(isSegmentedDisabled(mixed, true)).toBe(true)
    // 空组不视为禁用
    expect(isSegmentedDisabled([])).toBe(false)
  })
})

describe('LhSegmented accessibility', () => {
  it('binds radiogroup aria attributes', () => {
    expect(getSegmentedAria()).toEqual({ role: 'radiogroup' })
    expect(getSegmentedAria({ disabled: true, label: '视图' })).toEqual({
      role: 'radiogroup',
      'aria-disabled': true,
      'aria-label': '视图',
    })
  })

  it('binds radio item aria attributes', () => {
    expect(getSegmentedItemAria({ selected: true })).toEqual({
      role: 'radio',
      'aria-checked': true,
    })
    expect(getSegmentedItemAria({ selected: false, disabled: true })).toEqual({
      role: 'radio',
      'aria-checked': false,
      'aria-disabled': true,
    })
  })
})