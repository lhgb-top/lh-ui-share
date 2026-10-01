import type { LhComponentSize } from '../shared/types'

/**
 * TimePicker 模式
 */
export type LhTimePickerMode = 'time' | 'date-time'

/**
 * TimePicker 时间数据
 */
export interface LhTimeData {
  hours: number
  minutes: number
  seconds: number
}

/**
 * TimePicker 面板列数据
 */
export interface LhTimeColumn {
  value: number
  text: string
  isSelected: boolean
  isDisabled: boolean
}

/**
 * TimePicker 状态
 */
export interface LhTimePickerState {
  value: Date | null
  mode: LhTimePickerMode
  size: LhComponentSize
  disabled: boolean
  clearable: boolean
  placeholder: string
  format: string
  visible: boolean
  hour: number
  minute: number
  second: number
  isRange: boolean
  rangeStart: LhTimeData | null
  rangeEnd: LhTimeData | null
}

/**
 * TimePicker 选项配置
 */
export interface LhTimePickerOptions {
  hours?: { step: number; disabledHours: () => number[] }
  minutes?: { step: number; disabledMinutes: (hour: number) => number[] }
  seconds?: { step: number; disabledSeconds: (hour: number, minute: number) => number[] }
}

/**
 * TimePicker 滚动列索引
 */
export type LhTimeColumnType = 'hour' | 'minute' | 'second'

/**
 * TimePicker 点击事件数据
 */
export interface LhTimeSelectEventData {
  column: LhTimeColumnType
  value: number
}