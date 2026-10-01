import type { LhTimeColumn, LhTimeColumnType, LhTimeData, LhTimePickerOptions } from './types'

/**
 * 格式化数字为两位数
 */
export function padNumber(n: number): string {
  return String(n).padStart(2, '0')
}

/**
 * 格式化时间为字符串
 */
export function formatTime(
  hours: number,
  minutes: number,
  seconds: number,
  format: string = 'HH:mm:ss'
): string {
  return format
    .replace('HH', padNumber(hours))
    .replace('mm', padNumber(minutes))
    .replace('ss', padNumber(seconds))
}

/**
 * 解析时间字符串
 */
export function parseTime(timeStr: string, format: string = 'HH:mm:ss'): LhTimeData | null {
  try {
    const hhIdx = format.indexOf('HH')
    const mmIdx = format.indexOf('mm')
    const ssIdx = format.indexOf('ss')

    if (hhIdx < 0 || mmIdx < 0) {
      return null
    }

    const hours = hhIdx >= 0 ? parseInt(timeStr.substring(hhIdx, hhIdx + 2), 10) : 0
    const minutes = mmIdx >= 0 ? parseInt(timeStr.substring(mmIdx, mmIdx + 2), 10) : 0
    const seconds = ssIdx >= 0 ? parseInt(timeStr.substring(ssIdx, ssIdx + 2), 10) : 0

    if (isNaN(hours) || isNaN(minutes)) {
      return null
    }

    return { hours, minutes, seconds }
  } catch {
    return null
  }
}

/**
 * 从 Date 对象提取时间
 */
export function extractTime(date: Date): LhTimeData {
  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
  }
}

/**
 * 生成指定列的时间选项
 */
export function generateTimeColumn(
  type: LhTimeColumnType,
  step = 1,
  disabledValues: number[] = []
): LhTimeColumn[] {
  const columns: LhTimeColumn[] = []
  const max = type === 'hour' ? 23 : 59

  for (let i = 0; i <= max; i += step) {
    columns.push({
      value: i,
      text: padNumber(i),
      isSelected: false,
      isDisabled: disabledValues.includes(i),
    })
  }

  return columns
}

/**
 * 创建指定时间的 Date 对象
 */
export function createDateTime(
  baseDate: Date | null,
  hours: number,
  minutes: number,
  seconds: number
): Date {
  const date = baseDate ? new Date(baseDate) : new Date()
  date.setHours(hours, minutes, seconds, 0)
  return date
}

/**
 * 检查时间是否有效
 */
export function isValidTime(hours: number, minutes: number, seconds: number): boolean {
  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return false
  if (hours < 0 || hours > 23) return false
  if (minutes < 0 || minutes > 59) return false
  if (seconds < 0 || seconds > 59) return false
  return true
}

/**
 * 获取选择面板的 class 名
 */
export function getTimePickerClassNames(state: {
  size: string
  disabled: boolean
  visible: boolean
}): string[] {
  const classes: string[] = ['lh-time-picker']
  if (state.size) classes.push(`lh-time-picker--${state.size}`)
  if (state.disabled) classes.push('lh-time-picker--disabled')
  if (state.visible) classes.push('lh-time-picker--visible')
  return classes
}

/**
 * 根据 options 获取小时 step
 */
export function getHourStep(options: LhTimePickerOptions | undefined): number {
  return options?.hours?.step ?? 1
}

/**
 * 根据 options 获取分钟 step
 */
export function getMinuteStep(options: LhTimePickerOptions | undefined): number {
  return options?.minutes?.step ?? 1
}

/**
 * 根据 options 获取秒 step
 */
export function getSecondStep(options: LhTimePickerOptions | undefined): number {
  return options?.seconds?.step ?? 1
}

/**
 * 获取禁用的小时
 */
export function getDisabledHours(options: LhTimePickerOptions | undefined): number[] {
  return options?.hours?.disabledHours?.() ?? []
}

/**
 * 获取禁用的分钟
 */
export function getDisabledMinutes(
  hour: number,
  options: LhTimePickerOptions | undefined
): number[] {
  return options?.minutes?.disabledMinutes?.(hour) ?? []
}

/**
 * 获取禁用的秒
 */
export function getDisabledSeconds(
  hour: number,
  minute: number,
  options: LhTimePickerOptions | undefined
): number[] {
  return options?.seconds?.disabledSeconds?.(hour, minute) ?? []
}

/**
 * 格式化 Date 对象为时间字符串
 */
export function formatDateToTimeString(date: Date, format: string): string {
  const { hours, minutes, seconds } = extractTime(date)
  return formatTime(hours, minutes, seconds, format)
}