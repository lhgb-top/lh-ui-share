import { describe, it, expect } from 'vitest'
import {
  padNumber,
  formatTime,
  parseTime,
  extractTime,
  generateTimeColumn,
  createDateTime,
  isValidTime,
  getTimePickerClassNames,
  getHourStep,
  getMinuteStep,
  getSecondStep,
  getDisabledHours,
  getDisabledMinutes,
  getDisabledSeconds,
  formatDateToTimeString,
  getTimePickerColumnAria,
  getTimePickerPanelAria,
  getTimePickerTriggerAria,
} from '../../../src/core/time-picker'

describe('TimePicker Core Logic', () => {
  describe('padNumber', () => {
    it('should pad single digit', () => {
      expect(padNumber(5)).toBe('05')
    })

    it('should not pad double digit', () => {
      expect(padNumber(15)).toBe('15')
    })

    it('should handle zero', () => {
      expect(padNumber(0)).toBe('00')
    })
  })

  describe('formatTime', () => {
    it('should format with default format', () => {
      expect(formatTime(9, 5, 30)).toBe('09:05:30')
    })

    it('should format with HH:mm', () => {
      expect(formatTime(14, 30, 0, 'HH:mm')).toBe('14:30')
    })

    it('should format with custom separator', () => {
      expect(formatTime(9, 5, 30, 'HH-mm-ss')).toBe('09-05-30')
    })
  })

  describe('parseTime', () => {
    it('should parse HH:mm:ss', () => {
      const result = parseTime('09:05:30', 'HH:mm:ss')
      expect(result).not.toBeNull()
      expect(result?.hours).toBe(9)
      expect(result?.minutes).toBe(5)
      expect(result?.seconds).toBe(30)
    })

    it('should parse HH:mm', () => {
      const result = parseTime('14:30', 'HH:mm')
      expect(result?.hours).toBe(14)
      expect(result?.minutes).toBe(30)
    })

    it('should return null for invalid input', () => {
      expect(parseTime('', 'HH:mm:ss')).toBeNull()
    })

    it('should return null for out-of-range time', () => {
      // 回归：99:99:99 曾被解析成 { hours: 99 } 并一路透传给 Date
      expect(parseTime('99:99:99', 'HH:mm:ss')).toBeNull()
      expect(parseTime('24:00:00', 'HH:mm:ss')).toBeNull()
      expect(parseTime('12:60:00', 'HH:mm:ss')).toBeNull()
    })

    it('should return null for garbage strings', () => {
      expect(parseTime('not-a-time', 'HH:mm:ss')).toBeNull()
    })

    it('should round-trip partial formats (only hours / only minutes)', () => {
      // 回归：formatTime 只写出出现的分量，parseTime 曾因 mm 缺失直接拒绝，
      // 导致 formatTime(10, 0, 0, 'HH') 产出的串解不回去
      expect(parseTime('10', 'HH')).toEqual({ hours: 10, minutes: 0, seconds: 0 })
      expect(parseTime('30', 'mm')).toEqual({ hours: 0, minutes: 30, seconds: 0 })
      expect(parseTime('45', 'ss')).toEqual({ hours: 0, minutes: 0, seconds: 45 })
    })

    it('should return null when format has no time tokens', () => {
      expect(parseTime('anything', 'other')).toBeNull()
    })
  })

  describe('extractTime', () => {
    it('should extract time from Date', () => {
      const date = new Date(2024, 0, 1, 9, 5, 30)
      const result = extractTime(date)
      expect(result.hours).toBe(9)
      expect(result.minutes).toBe(5)
      expect(result.seconds).toBe(30)
    })
  })

  describe('generateTimeColumn', () => {
    it('should generate 24 hours', () => {
      const hours = generateTimeColumn('hour')
      expect(hours).toHaveLength(24)
    })

    it('should generate 60 minutes', () => {
      const minutes = generateTimeColumn('minute')
      expect(minutes).toHaveLength(60)
    })

    it('should support step', () => {
      const minutes = generateTimeColumn('minute', 5)
      expect(minutes.length).toBe(12)
    })

    it('should support disabled values', () => {
      const hours = generateTimeColumn('hour', 1, [0, 1, 2])
      expect(hours[0].isDisabled).toBe(true)
      expect(hours[3].isDisabled).toBe(false)
    })

    it('should not loop forever when step is 0 or negative', () => {
      // 回归：step 0 曾造成 i += 0 的死循环
      expect(generateTimeColumn('minute', 0)).toHaveLength(60)
      expect(generateTimeColumn('hour', -5)).toHaveLength(24)
      // 非整数 step 向下取整
      expect(generateTimeColumn('minute', 2.5).length).toBe(30)
    })
  })

  describe('createDateTime', () => {
    it('should create date with time', () => {
      const base = new Date(2024, 0, 1)
      const result = createDateTime(base, 9, 5, 30)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(0)
      expect(result.getDate()).toBe(1)
      expect(result.getHours()).toBe(9)
      expect(result.getMinutes()).toBe(5)
      expect(result.getSeconds()).toBe(30)
    })

    it('should use current date when base is null', () => {
      const result = createDateTime(null, 12, 0, 0)
      const today = new Date()
      expect(result.getFullYear()).toBe(today.getFullYear())
      expect(result.getMonth()).toBe(today.getMonth())
      expect(result.getDate()).toBe(today.getDate())
    })
  })

  describe('isValidTime', () => {
    it('should return true for valid time', () => {
      expect(isValidTime(12, 30, 45)).toBe(true)
    })

    it('should return false for invalid hours', () => {
      expect(isValidTime(25, 0, 0)).toBe(false)
      expect(isValidTime(-1, 0, 0)).toBe(false)
    })

    it('should return false for invalid minutes', () => {
      expect(isValidTime(0, 60, 0)).toBe(false)
    })

    it('should return false for NaN', () => {
      expect(isValidTime(NaN, 0, 0)).toBe(false)
    })
  })

  describe('getTimePickerClassNames', () => {
    it('should return base class', () => {
      expect(getTimePickerClassNames({ size: '', disabled: false, visible: false })).toContain('lh-time-picker')
    })

    it('should add size class', () => {
      expect(getTimePickerClassNames({ size: 'small', disabled: false, visible: false })).toContain('lh-time-picker--small')
    })

    it('should add disabled class', () => {
      expect(getTimePickerClassNames({ size: '', disabled: true, visible: false })).toContain('lh-time-picker--disabled')
    })
  })

  describe('getHourStep', () => {
    it('should return default step', () => {
      expect(getHourStep(undefined)).toBe(1)
    })

    it('should return custom step', () => {
      expect(getHourStep({ hours: { step: 2, disabledHours: () => [] } })).toBe(2)
    })
  })

  describe('getMinuteStep', () => {
    it('should return default step', () => {
      expect(getMinuteStep(undefined)).toBe(1)
    })

    it('should return custom step', () => {
      expect(getMinuteStep({ minutes: { step: 5, disabledMinutes: () => [] } })).toBe(5)
    })
  })

  describe('getSecondStep', () => {
    it('should return default step', () => {
      expect(getSecondStep(undefined)).toBe(1)
    })
  })

  describe('getDisabledHours', () => {
    it('should return empty array by default', () => {
      expect(getDisabledHours(undefined)).toEqual([])
    })

    it('should return disabled hours', () => {
      const options = { hours: { step: 1, disabledHours: () => [0, 1, 2] } }
      expect(getDisabledHours(options)).toEqual([0, 1, 2])
    })
  })

  describe('getDisabledMinutes', () => {
    it('should return empty array by default', () => {
      expect(getDisabledMinutes(0, undefined)).toEqual([])
    })
  })

  describe('getDisabledSeconds', () => {
    it('should return empty array by default', () => {
      expect(getDisabledSeconds(0, 0, undefined)).toEqual([])
    })
  })

  describe('formatDateToTimeString', () => {
    it('should format date to time string', () => {
      const date = new Date(2024, 0, 1, 9, 5, 30)
      expect(formatDateToTimeString(date, 'HH:mm:ss')).toBe('09:05:30')
    })
  })
})
describe('LhTimePicker accessibility', () => {
  it('binds trigger aria attributes for a dialog popup', () => {
    expect(getTimePickerTriggerAria(true, 'tp')).toEqual({
      'aria-expanded': true,
      'aria-controls': 'tp',
      'aria-haspopup': 'dialog',
    })
  })

  it('marks the panel and its columns', () => {
    expect(getTimePickerPanelAria('tp')).toEqual({ role: 'dialog', id: 'tp' })
    expect(getTimePickerColumnAria('小时')).toEqual({ role: 'listbox', 'aria-label': '小时' })
  })
})