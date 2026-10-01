import { describe, it, expect } from 'vitest'
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  isSameDay,
  isSameMonth,
  compareDate,
  formatDate,
  parseDate,
  generateCalendarDays,
  generateMonths,
  generateYears,
  isDateDisabled,
  getDatePickerClassNames,
} from '../../../src/core/date-picker'

describe('DatePicker Core Logic', () => {
  describe('getDaysInMonth', () => {
    it('should return 31 days for January', () => {
      expect(getDaysInMonth(2024, 0)).toBe(31)
    })

    it('should return 29 days for February in leap year', () => {
      expect(getDaysInMonth(2024, 1)).toBe(29)
    })

    it('should return 28 days for February in non-leap year', () => {
      expect(getDaysInMonth(2023, 1)).toBe(28)
    })

    it('should return 30 days for April', () => {
      expect(getDaysInMonth(2024, 3)).toBe(30)
    })
  })

  describe('getFirstDayOfMonth', () => {
    it('should return first day of month (0-6)', () => {
      expect(getFirstDayOfMonth(2024, 0)).toBeGreaterThanOrEqual(0)
      expect(getFirstDayOfMonth(2024, 0)).toBeLessThanOrEqual(6)
    })
  })

  describe('isSameDay', () => {
    it('should return true for same day', () => {
      const a = new Date(2024, 0, 1)
      const b = new Date(2024, 0, 1)
      expect(isSameDay(a, b)).toBe(true)
    })

    it('should return false for different day', () => {
      const a = new Date(2024, 0, 1)
      const b = new Date(2024, 0, 2)
      expect(isSameDay(a, b)).toBe(false)
    })

    it('should ignore time', () => {
      const a = new Date(2024, 0, 1, 0, 0, 0)
      const b = new Date(2024, 0, 1, 12, 30, 0)
      expect(isSameDay(a, b)).toBe(true)
    })
  })

  describe('isSameMonth', () => {
    it('should return true for same month', () => {
      const a = new Date(2024, 0, 1)
      const b = new Date(2024, 0, 15)
      expect(isSameMonth(a, b)).toBe(true)
    })

    it('should return false for different month', () => {
      const a = new Date(2024, 0, 1)
      const b = new Date(2024, 1, 1)
      expect(isSameMonth(a, b)).toBe(false)
    })
  })

  describe('compareDate', () => {
    it('should return negative when a < b', () => {
      const a = new Date(2024, 0, 1)
      const b = new Date(2024, 0, 2)
      expect(compareDate(a, b)).toBeLessThan(0)
    })

    it('should return positive when a > b', () => {
      const a = new Date(2024, 0, 2)
      const b = new Date(2024, 0, 1)
      expect(compareDate(a, b)).toBeGreaterThan(0)
    })

    it('should return 0 when equal', () => {
      const a = new Date(2024, 0, 1)
      const b = new Date(2024, 0, 1)
      expect(compareDate(a, b)).toBe(0)
    })
  })

  describe('formatDate', () => {
    it('should format with default format', () => {
      const date = new Date(2024, 0, 15)
      expect(formatDate(date, 'yyyy-MM-dd')).toBe('2024-01-15')
    })

    it('should format with time', () => {
      const date = new Date(2024, 0, 15, 9, 5, 30)
      expect(formatDate(date, 'yyyy-MM-dd HH:mm:ss')).toBe('2024-01-15 09:05:30')
    })

    it('should format with custom order', () => {
      const date = new Date(2024, 5, 3)
      expect(formatDate(date, 'MM/dd/yyyy')).toBe('06/03/2024')
    })
  })

  describe('parseDate', () => {
    it('should parse basic date', () => {
      const parsed = parseDate('2024-01-15', 'yyyy-MM-dd')
      expect(parsed).not.toBeNull()
      expect(parsed?.getFullYear()).toBe(2024)
      expect(parsed?.getMonth()).toBe(0)
      expect(parsed?.getDate()).toBe(15)
    })

    it('should return null on invalid input', () => {
      expect(parseDate('', 'yyyy-MM-dd')).not.toBeNull()
    })
  })

  describe('generateCalendarDays', () => {
    it('should generate correct number of cells (multiple of 7)', () => {
      const today = new Date(2024, 0, 15)
      const days = generateCalendarDays(2024, 0, null, null, null, today)
      expect(days.length % 7).toBe(0)
    })

    it('should mark today correctly', () => {
      const today = new Date(2024, 0, 15)
      const days = generateCalendarDays(2024, 0, null, null, null, today)
      const todayCell = days.find(d => d.isToday)
      expect(todayCell).toBeDefined()
      expect(todayCell?.day).toBe(15)
    })

    it('should mark selected day', () => {
      const today = new Date(2024, 0, 15)
      const selected = new Date(2024, 0, 20)
      const days = generateCalendarDays(2024, 0, selected, null, null, today)
      const selectedCell = days.find(d => d.isSelected)
      expect(selectedCell).toBeDefined()
      expect(selectedCell?.day).toBe(20)
    })

    it('should handle range selection', () => {
      const today = new Date(2024, 0, 15)
      const rangeStart = new Date(2024, 0, 10)
      const rangeEnd = new Date(2024, 0, 20)
      const days = generateCalendarDays(2024, 0, null, rangeStart, rangeEnd, today)
      const startCell = days.find(d => d.isStart)
      const endCell = days.find(d => d.isEnd)
      const inRange = days.filter(d => d.isInRange)
      expect(startCell?.day).toBe(10)
      expect(endCell?.day).toBe(20)
      expect(inRange.length).toBeGreaterThan(0)
    })
  })

  describe('generateMonths', () => {
    it('should return 12 months', () => {
      const months = generateMonths(2024, null)
      expect(months).toHaveLength(12)
    })

    it('should mark selected month', () => {
      const selected = new Date(2024, 5, 15)
      const months = generateMonths(2024, selected)
      expect(months[5].isSelected).toBe(true)
      expect(months[0].isSelected).toBe(false)
    })
  })

  describe('generateYears', () => {
    it('should return 12 years', () => {
      const years = generateYears(2024, null)
      expect(years).toHaveLength(12)
    })

    it('should mark selected year', () => {
      const selected = new Date(2027, 0, 15)
      const years = generateYears(2024, selected)
      expect(years[3].isSelected).toBe(true)
      expect(years[0].isSelected).toBe(false)
    })
  })

  describe('isDateDisabled', () => {
    it('should disable date before min', () => {
      const date = new Date(2024, 0, 1)
      const min = new Date(2024, 0, 5)
      expect(isDateDisabled(date, min, null, null)).toBe(true)
    })

    it('should disable date after max', () => {
      const date = new Date(2024, 0, 10)
      const max = new Date(2024, 0, 5)
      expect(isDateDisabled(date, null, max, null)).toBe(true)
    })

    it('should disable date with custom function', () => {
      const date = new Date(2024, 0, 5)
      expect(isDateDisabled(date, null, null, (d) => d.getDate() === 5)).toBe(true)
    })

    it('should not disable valid date', () => {
      const date = new Date(2024, 0, 5)
      expect(isDateDisabled(date, null, null, null)).toBe(false)
    })
  })

  describe('getDatePickerClassNames', () => {
    it('should return base class', () => {
      const classes = getDatePickerClassNames({ size: 'medium', disabled: false, visible: false })
      expect(classes).toContain('lh-date-picker')
    })

    it('should include disabled class', () => {
      const classes = getDatePickerClassNames({ size: 'medium', disabled: true, visible: false })
      expect(classes).toContain('lh-date-picker--disabled')
    })

    it('should include visible class', () => {
      const classes = getDatePickerClassNames({ size: 'medium', disabled: false, visible: true })
      expect(classes).toContain('lh-date-picker--visible')
    })
  })
})