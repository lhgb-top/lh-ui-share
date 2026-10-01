import { describe, it, expect } from 'vitest'
import { formatStatisticValue, getStatisticClassNames } from '../../../src/core/statistic'

describe('Statistic Core Logic', () => {
  it('formats value with fixed precision', () => {
    expect(formatStatisticValue(3.14159, { precision: 2, separator: '' })).toBe('3.14')
    expect(formatStatisticValue(3, { precision: 2, separator: '' })).toBe('3.00')
  })

  it('groups integer digits with separator', () => {
    expect(formatStatisticValue(1234567, { precision: 0, separator: ',' })).toBe('1,234,567')
  })

  it('groups with custom separator', () => {
    expect(formatStatisticValue(1234567, { precision: 0, separator: ' ' })).toBe('1 234 567')
  })

  it('keeps decimals after grouping', () => {
    expect(formatStatisticValue(1234567.89, { precision: 2, separator: ',' })).toBe('1,234,567.89')
  })

  it('returns raw string when value is not numeric', () => {
    expect(formatStatisticValue('abc', { precision: 2, separator: ',' })).toBe('abc')
  })

  it('returns string for non-finite numbers', () => {
    expect(formatStatisticValue(Infinity, { precision: 2, separator: '' })).toBe('Infinity')
  })

  it('builds base class list', () => {
    expect(getStatisticClassNames()).toEqual(['lh-statistic'])
  })
})
