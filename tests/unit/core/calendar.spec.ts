import { describe, expect, it } from 'vitest'
import {
  clampDateToRange,
  isCalendarDateDisabled,
  shiftCalendarDate,
  shiftCalendarMonth,
} from '../../../src/core/calendar'

describe('LhCalendar core', () => {
  it('shifts dates without cross-month overflow', () => {
    expect(shiftCalendarDate(new Date(2026, 0, 1), -1).getDate()).toBe(31)
    expect(shiftCalendarDate(new Date(2026, 0, 31), 1).getMonth()).toBe(1)
  })

  it('shifts months across year boundaries', () => {
    expect(shiftCalendarMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 })
    expect(shiftCalendarMonth(2025, 11, 1)).toEqual({ year: 2026, month: 0 })
  })

  it('disables dates outside the optional range', () => {
    const range: [Date, Date] = [new Date(2026, 0, 2), new Date(2026, 0, 29)]
    expect(isCalendarDateDisabled(new Date(2026, 0, 1), range)).toBe(true)
    expect(isCalendarDateDisabled(new Date(2026, 0, 15), range)).toBe(false)
    expect(isCalendarDateDisabled(new Date(2026, 0, 15), undefined)).toBe(false)
  })

  it('clamps dates into the range', () => {
    const range: [Date, Date] = [new Date(2026, 0, 2), new Date(2026, 0, 29)]
    expect(clampDateToRange(new Date(2025, 5, 1), range)).toEqual(range[0])
    expect(clampDateToRange(new Date(2027, 5, 1), range)).toEqual(range[1])
  })
})
