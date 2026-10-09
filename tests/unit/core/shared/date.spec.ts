import { describe, expect, it } from 'vitest'
import {
  compareDate,
  getDaysInMonth,
  getFirstDayOfMonth,
  isDateDisabled,
  isSameDay,
  isSameMonth,
} from '../../../../src/core/shared/date'

describe('core/shared/date', () => {
  it('getDaysInMonth handles month lengths and leap years', () => {
    expect(getDaysInMonth(2024, 0)).toBe(31)
    expect(getDaysInMonth(2024, 1)).toBe(29)
    expect(getDaysInMonth(2023, 1)).toBe(28)
    expect(getDaysInMonth(2024, 3)).toBe(30)
  })

  it('getDaysInMonth normalizes two-digit years to 1900+', () => {
    // JS 的 new Date(99, ...) 会把 99 当作 1999；24 是闰年
    expect(getDaysInMonth(24, 1)).toBe(29)
    expect(getDaysInMonth(99, 1)).toBe(28)
  })

  it('getFirstDayOfMonth returns weekday (0=Sunday)', () => {
    expect(getFirstDayOfMonth(2024, 0)).toBe(1) // 2024-01-01 是周一
    expect(getFirstDayOfMonth(2024, 1)).toBe(4) // 2024-02-01 是周四
  })

  it('isSameDay / isSameMonth compare date parts only', () => {
    expect(isSameDay(new Date(2024, 0, 1), new Date(2024, 0, 1, 23, 59))).toBe(true)
    expect(isSameDay(new Date(2024, 0, 1), new Date(2024, 0, 2))).toBe(false)
    expect(isSameMonth(new Date(2024, 0, 1), new Date(2024, 0, 31))).toBe(true)
    expect(isSameMonth(new Date(2024, 0, 1), new Date(2024, 1, 1))).toBe(false)
  })

  it('compareDate ignores time components', () => {
    const morning = new Date(2024, 5, 3, 0, 0, 0)
    const evening = new Date(2024, 5, 3, 23, 59, 59)
    expect(compareDate(morning, evening)).toBe(0)
    expect(compareDate(new Date(2024, 5, 2), new Date(2024, 5, 3))).toBeLessThan(0)
    expect(compareDate(new Date(2024, 5, 4), new Date(2024, 5, 3))).toBeGreaterThan(0)
  })

  it('isDateDisabled respects min / max / predicate', () => {
    const min = new Date(2024, 0, 5)
    const max = new Date(2024, 0, 10)
    expect(isDateDisabled(new Date(2024, 0, 4), min, max, null)).toBe(true)
    expect(isDateDisabled(new Date(2024, 0, 11), min, max, null)).toBe(true)
    expect(isDateDisabled(new Date(2024, 0, 7), min, max, null)).toBe(false)
    // 无约束恒可用
    expect(isDateDisabled(new Date(2024, 0, 4), null, null, null)).toBe(false)
    // 谓词优先级最高
    expect(isDateDisabled(new Date(2024, 0, 7), min, max, () => true)).toBe(true)
  })
})
