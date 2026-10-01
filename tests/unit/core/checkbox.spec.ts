import { describe, expect, it } from 'vitest'
import { isCheckboxChecked, toggleCheckboxValue } from '../../../src/core/checkbox'

describe('checkbox/core/logic', () => {
  it('checks values with Object.is semantics', () => {
    expect(isCheckboxChecked([1, 'two'], 1)).toBe(true)
    expect(isCheckboxChecked([1, 'two'], 2)).toBe(false)
  })

  it('adds and removes values without duplicates', () => {
    expect(toggleCheckboxValue([1], 2, true)).toEqual([1, 2])
    expect(toggleCheckboxValue([1, 2], 1, true)).toEqual([2, 1])
    expect(toggleCheckboxValue([1, 2], 1, false)).toEqual([2])
  })
})
