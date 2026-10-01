import { describe, expect, it } from 'vitest'
import { findSelectOption, getNextEnabledIndex } from '../../../src/core/select'

describe('select/core/logic', () => {
  const options = [
    { label: 'One', value: 1 },
    { label: 'Two', value: 2, disabled: true },
    { label: 'Three', value: 3 },
  ]

  it('finds an option by value', () => {
    expect(findSelectOption(options, 3)?.label).toBe('Three')
    expect(findSelectOption(options, 4)).toBeUndefined()
  })

  it('skips disabled options and wraps around', () => {
    expect(getNextEnabledIndex(options, 0, 1)).toBe(2)
    expect(getNextEnabledIndex(options, 2, 1)).toBe(0)
    expect(getNextEnabledIndex(options, 0, -1)).toBe(2)
  })
})
