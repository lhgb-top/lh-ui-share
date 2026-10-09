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
  getDateAdapter,
  getDatePickerClassNames,
  setDateAdapter,
  getDatePickerPanelAria,
  getDatePickerTriggerAria,
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
      expect(parseDate('', 'yyyy-MM-dd')).toBeNull()
    })

    it('should return null on overflow date', () => {
      // 2023-02-30 不存在，回读校验应拒绝，而不是静默滚到 3 月
      expect(parseDate('2023-02-30', 'yyyy-MM-dd')).toBeNull()
    })

    it('should return null on garbage string', () => {
      expect(parseDate('not-a-date', 'yyyy-MM-dd')).toBeNull()
    })

    it('should round-trip MM/dd/yyyy', () => {
      const formatted = '06/03/2024'
      const parsed = parseDate(formatted, 'MM/dd/yyyy')
      expect(parsed).not.toBeNull()
      expect(parsed?.getFullYear()).toBe(2024)
      expect(parsed?.getMonth()).toBe(5)
      expect(parsed?.getDate()).toBe(3)
      expect(formatDate(parsed!, 'MM/dd/yyyy')).toBe(formatted)
    })

    it('should parse time components in datetime format', () => {
      // 回归：曾只取日期分量，时间分量被静默丢弃，datetime 往返丢失时刻
      const parsed = parseDate('2023-01-01 10:30:45', 'yyyy-MM-dd HH:mm:ss')
      expect(parsed).not.toBeNull()
      expect(parsed?.getFullYear()).toBe(2023)
      expect(parsed?.getMonth()).toBe(0)
      expect(parsed?.getDate()).toBe(1)
      expect(parsed?.getHours()).toBe(10)
      expect(parsed?.getMinutes()).toBe(30)
      expect(parsed?.getSeconds()).toBe(45)
    })

    it('should round-trip datetime format', () => {
      const date = new Date(2024, 5, 3, 8, 5, 9)
      const formatted = formatDate(date, 'yyyy-MM-dd HH:mm:ss')
      const parsed = parseDate(formatted, 'yyyy-MM-dd HH:mm:ss')
      expect(parsed).not.toBeNull()
      expect(formatDate(parsed!, 'yyyy-MM-dd HH:mm:ss')).toBe(formatted)
    })

    it('should default time components to zero when the format omits them', () => {
      // format 不含时间 token 时，时间分量按 0 补齐
      const parsed = parseDate('2024-01-15', 'yyyy-MM-dd')
      expect(parsed?.getHours()).toBe(0)
      expect(parsed?.getMinutes()).toBe(0)
      expect(parsed?.getSeconds()).toBe(0)
    })

    it('should reject a string shorter than the format requires', () => {
      // format 含时间 token 但串里缺分量，属于「串与格式不对应」，返回 null
      // 而不是静默把缺失分量补成 0——那会掩盖 value-format 与实际值不匹配的 bug
      expect(parseDate('2024-01-15', 'yyyy-MM-dd HH:mm:ss')).toBeNull()
    })

    it('should return null on out-of-range time components', () => {
      expect(parseDate('2024-01-01 25:00:00', 'yyyy-MM-dd HH:mm:ss')).toBeNull()
      expect(parseDate('2024-01-01 00:99:00', 'yyyy-MM-dd HH:mm:ss')).toBeNull()
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

  describe('round 2: 年份补零 / firstDayOfWeek / 日期适配器', () => {
    it('pads years below 1000 so formatted output stays parseable', () => {
      const text = formatDate(new Date(999, 0, 2), 'yyyy-MM-dd')
      expect(text).toBe('0999-01-02')
      expect(parseDate(text, 'yyyy-MM-dd')).not.toBeNull()
      // 常规年份不受影响
      expect(formatDate(new Date(2026, 0, 2), 'yyyy-MM-dd')).toBe('2026-01-02')
    })

    it('generateCalendarDays honors firstDayOfWeek', () => {
      // 2025-06-01 是周日：周日起始时首格即当月 1 日；周一起始时首行需 6 格上月填充
      const today = new Date(2025, 5, 15)
      const sundayFirst = generateCalendarDays(2025, 5, null, null, null, today, 0)
      const mondayFirst = generateCalendarDays(2025, 5, null, null, null, today, 1)
      expect(sundayFirst[0].date.getDate()).toBe(1)
      expect(mondayFirst[0].date.getDay()).toBe(1)
      const leadingOf = (days: ReturnType<typeof generateCalendarDays>): number =>
        days.findIndex((d) => d.isCurrentMonth)
      expect(leadingOf(sundayFirst)).toBe(0)
      expect(leadingOf(mondayFirst)).toBe(6)
    })

    it('setDateAdapter reroutes grid generation and restores with undefined', () => {
      const today = new Date(2025, 5, 15)
      const original = generateCalendarDays(2025, 5, null, null, null, today)
      setDateAdapter({ ...getDateAdapter(), getFirstDayOfMonth: () => 1 })
      const shifted = generateCalendarDays(2025, 5, null, null, null, today)
      // 注入后首行前置填充变为 1 格（2025-05-31，周六）
      expect(shifted[0].date.getDate()).toBe(31)
      expect(shifted[0].date.getDay()).toBe(6)
      expect(shifted).not.toEqual(original)
      // 传 undefined 恢复默认实现
      setDateAdapter(undefined)
      expect(generateCalendarDays(2025, 5, null, null, null, today)).toEqual(original)
    })

    it('accepts an explicit adapter without touching the global singleton', () => {
      const today = new Date(2025, 5, 15)
      // 显式参数优先于全局单例：此处把周一启始透传进去
      const explicit = generateCalendarDays(2025, 5, null, null, null, today, 0, {
        ...getDateAdapter(),
        getFirstDayOfMonth: () => 1,
      })
      expect(explicit[0].date.getDate()).toBe(31)
      expect(explicit[0].date.getDay()).toBe(6)

      // 全局状态未被污染：默认实现仍是周日启始（2025-06-01 为周日）
      const after = generateCalendarDays(2025, 5, null, null, null, today)
      expect(after[0].date.getDate()).toBe(1)
      expect(after[0].date.getDay()).toBe(0)
    })
  })
})
describe('LhDatePicker accessibility', () => {
  it('binds trigger aria attributes for a dialog popup', () => {
    expect(getDatePickerTriggerAria(true, 'dp')).toEqual({
      'aria-expanded': true,
      'aria-controls': 'dp',
      'aria-haspopup': 'dialog',
    })
    expect(getDatePickerTriggerAria(false)).toEqual({
      'aria-expanded': false,
      'aria-haspopup': 'dialog',
    })
  })

  it('marks the panel as a dialog', () => {
    expect(getDatePickerPanelAria('dp')).toEqual({ role: 'dialog', id: 'dp' })
  })
})