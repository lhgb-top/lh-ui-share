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

  it('preserves precision for big-number strings beyond MAX_SAFE_INTEGER', () => {
    // Number 强转会把末位 3 丢成 2，字符串路径必须原样保留
    expect(formatStatisticValue('9007199254740993', { precision: 0, separator: ',' })).toBe(
      '9,007,199,254,740,993',
    )
    expect(formatStatisticValue('123456789012345678901', { precision: 0, separator: ' ' })).toBe(
      '123 456 789 012 345 678 901',
    )
  })

  it('pads decimals for big-number strings at fixed precision', () => {
    expect(formatStatisticValue('9007199254740993', { precision: 2, separator: ',' })).toBe(
      '9,007,199,254,740,993.00',
    )
  })

  it('rounds big-number strings without Number coercion', () => {
    expect(formatStatisticValue('9007199254740993.7', { precision: 0, separator: ',' })).toBe(
      '9,007,199,254,740,994',
    )
    expect(formatStatisticValue('99999999999999999.99', { precision: 1, separator: '' })).toBe(
      '100000000000000000.0',
    )
  })

  it('respects sign for big-number strings', () => {
    expect(formatStatisticValue('-9007199254740993', { precision: 0, separator: ',' })).toBe(
      '-9,007,199,254,740,993',
    )
  })

  it('keeps safe-range strings on the number path', () => {
    expect(formatStatisticValue('182.50', { precision: 2, separator: ',' })).toBe('182.50')
  })

  it('sanitizes dirty precision instead of throwing RangeError', () => {
    // 回归：precision 超过 100 位（toFixed 合法域上限）或为负时曾直接抛 RangeError
    expect(() => formatStatisticValue(1.5, { precision: 150, separator: '' })).not.toThrow()
    expect(formatStatisticValue(1.5, { precision: 150, separator: '' })).toBe(
      `1.5${'0'.repeat(99)}`,
    )
    expect(() => formatStatisticValue(1.5, { precision: -4, separator: '' })).not.toThrow()
    expect(formatStatisticValue(1.5, { precision: -4, separator: '' })).toBe('2')
    // 超大数字符串路径同样净化
    expect(() =>
      formatStatisticValue('9007199254740993', { precision: 150, separator: ',' }),
    ).not.toThrow()
  })

  it('builds base class list', () => {
    expect(getStatisticClassNames()).toEqual(['lh-statistic'])
  })
})
