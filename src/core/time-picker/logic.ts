import type { LhTimeColumn, LhTimeColumnType, LhTimeData, LhTimePickerOptions } from './types'
import { getPopupTriggerAria } from '../shared/a11y'
import type { LhAriaAttrs } from '../shared/a11y'

/**
 * 格式化数字为两位数
 */
export function padNumber(n: number): string {
  return String(n).padStart(2, '0')
}

/**
 * 格式化时间为字符串
 *
 * 支持任意顺序的定宽 token（HH / mm / ss），同一 token 出现多次时全部替换。
 */
export function formatTime(
  hours: number,
  minutes: number,
  seconds: number,
  format: string = 'HH:mm:ss'
): string {
  return format
    .replace(/HH/g, padNumber(hours))
    .replace(/mm/g, padNumber(minutes))
    .replace(/ss/g, padNumber(seconds))
}

/**
 * 解析时间字符串
 *
 * 与 formatTime 对称：各 token 按 format 中的位置取值，缺失的分量按 0 补
 * （formatTime 只写出出现的分量，parseTime 也要能解回仅含部分分量的串）。
 * 解析失败（NaN）或值域非法（如 99:99:99）一律返回 null。
 */
export function parseTime(timeStr: string, format: string = 'HH:mm:ss'): LhTimeData | null {
  const hhIdx = format.indexOf('HH')
  const mmIdx = format.indexOf('mm')
  const ssIdx = format.indexOf('ss')

  // format 中一个时间 token 都没有，无法解析
  if (hhIdx < 0 && mmIdx < 0 && ssIdx < 0) {
    return null
  }

  const hours = hhIdx >= 0 ? parseInt(timeStr.substring(hhIdx, hhIdx + 2), 10) : 0
  const minutes = mmIdx >= 0 ? parseInt(timeStr.substring(mmIdx, mmIdx + 2), 10) : 0
  const seconds = ssIdx >= 0 ? parseInt(timeStr.substring(ssIdx, ssIdx + 2), 10) : 0

  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
    return null
  }
  if (!isValidTime(hours, minutes, seconds)) {
    return null
  }

  return { hours, minutes, seconds }
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
 *
 * step 非正数（0 会导致死循环）归一到 1；小数步长取整。
 */
export function generateTimeColumn(
  type: LhTimeColumnType,
  step = 1,
  disabledValues: number[] = []
): LhTimeColumn[] {
  const columns: LhTimeColumn[] = []
  const max = type === 'hour' ? 23 : 59
  const safeStep = step > 0 ? Math.floor(step) : 1

  for (let i = 0; i <= max; i += safeStep) {
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

/**
 * 计算小时列的有效范围：start/end 与 0~23 求交集
 * （默认 start=0 / end=24，即全量程，保持既有行为）
 */
export function getHourRange(start: number, end: number): { start: number; end: number } {
  return { start: Math.max(0, start), end: Math.min(23, end) }
}

/**
 * 过滤时间列，仅保留 [start, end] 范围内的选项
 */
export function filterTimeColumnByRange(
  columns: LhTimeColumn[],
  start: number,
  end: number
): LhTimeColumn[] {
  return columns.filter((c) => c.value >= start && c.value <= end)
}

/**
 * 将滚动后的数值收拢回 [start, end]：越过上界回到 start，越过下界回到 end。
 * 范围覆盖全量程时原值返回，保持既有回绕行为。
 */
export function wrapTimeValueInRange(value: number, start: number, end: number): number {
  if (value > end) return start
  if (value < start) return end
  return value
}

/**
 * 将数值钳制到 [start, end] 范围内（用于把范围外的已有选中值收敛回可选区间）
 */
export function clampTimeValue(value: number, start: number, end: number): number {
  return Math.min(Math.max(value, start), end)
}

/**
 * 触发器的无障碍属性包：时间面板以 dialog 语义弹出
 *
 * @param visible 面板是否展开
 * @param panelId 面板元素 id（未传时不输出 aria-controls）
 */
export function getTimePickerTriggerAria(visible: boolean, panelId?: string): LhAriaAttrs {
  return getPopupTriggerAria({ expanded: visible, popupId: panelId, haspopup: 'dialog' })
}

/**
 * 面板容器的无障碍属性包：role="dialog"
 *
 * @param id 面板元素 id，与触发器的 aria-controls 对应
 */
export function getTimePickerPanelAria(id?: string): LhAriaAttrs {
  const attrs: LhAriaAttrs = { role: 'dialog' }
  if (id) attrs.id = id
  return attrs
}

/**
 * 时间列的无障碍属性包：每列是一个 listbox，aria-label 标注「时/分/秒」
 *
 * @param label 列语义文案（如「小时」）
 */
export function getTimePickerColumnAria(label?: string): LhAriaAttrs {
  const attrs: LhAriaAttrs = { role: 'listbox' }
  if (label) attrs['aria-label'] = label
  return attrs
}
