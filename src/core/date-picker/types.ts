import type { LhComponentSize } from '../shared/types'

/**
 * DatePicker 模式
 *
 * range 为日期段模式：面板内两次点击确定起止，绑定值为 `[Date, Date]`。
 */
export type LhDatePickerMode = 'date' | 'month' | 'year' | 'datetime' | 'range'

/**
 * DatePicker 日期面板数据类型
 */
export interface LhDatePickerDayData {
  date: Date
  day: number
  month: number
  year: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  isInRange: boolean
  isStart: boolean
  isEnd: boolean
}

/**
 * DatePicker 月份数据
 */
export interface LhDatePickerMonthData {
  month: number
  year: number
  isSelected: boolean
}

/**
 * DatePicker 年份数据
 */
export interface LhDatePickerYearData {
  year: number
  isSelected: boolean
}

/**
 * DatePicker 状态
 */
export interface LhDatePickerState {
  value: Date | null
  mode: LhDatePickerMode
  size: LhComponentSize
  disabled: boolean
  clearable: boolean
  placeholder: string
  format: string
  visible: boolean
  currentDate: Date
  isRange: boolean
  rangeStart: Date | null
  rangeEnd: Date | null
  minDate: Date | null
  maxDate: Date | null
  disabledDate: ((date: Date) => boolean) | null
}