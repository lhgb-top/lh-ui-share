import type { LhDatePickerDayData, LhDatePickerMonthData, LhDatePickerYearData } from './types'

/**
 * 获取月份的天数
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * 获取月份的第一天是星期几
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

/**
 * 比较两个日期是否同一天
 */
export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

/**
 * 比较两个日期是否同年同月
 */
export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

/**
 * 比较两个日期（只比较日期部分）
 */
export function compareDate(a: Date, b: Date): number {
  const aTime = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
  const bTime = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
  return aTime - bTime
}

/**
 * 格式化日期
 */
export function formatDate(date: Date, format: string): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('yyyy', String(year))
    .replace('MM', month)
    .replace('dd', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 解析日期字符串
 */
export function parseDate(str: string, format: string): Date | null {
  try {
    const year = parseInt(format.includes('yyyy') ? str.substring(0, 4) : String(new Date().getFullYear()))
    const monthIdx = format.indexOf('MM')
    const dayIdx = format.indexOf('dd')
    const month = monthIdx >= 0 ? parseInt(str.substring(monthIdx, monthIdx + 2)) - 1 : 0
    const day = dayIdx >= 0 ? parseInt(str.substring(dayIdx, dayIdx + 2)) : 1

    return new Date(year, month, day)
  } catch {
    return null
  }
}

/**
 * 生成日历数据
 */
export function generateCalendarDays(
  year: number,
  month: number,
  selected: Date | null,
  rangeStart: Date | null,
  rangeEnd: Date | null,
  today: Date
): LhDatePickerDayData[] {
  const days: LhDatePickerDayData[] = []
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  // 上个月的填充
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth)

  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const date = new Date(prevYear, prevMonth, day)
    days.push({
      date,
      day,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
      isToday: false,
      isSelected: selected ? isSameDay(date, selected) : false,
      isInRange: false,
      isStart: false,
      isEnd: false,
    })
  }

  // 当前月
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const isSelected = selected ? isSameDay(date, selected) : false
    const isStart = rangeStart ? isSameDay(date, rangeStart) : false
    const isEnd = rangeEnd ? isSameDay(date, rangeEnd) : false
    const isInRange = !!(rangeStart && rangeEnd && date > rangeStart && date < rangeEnd)

    days.push({
      date,
      day,
      month,
      year,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      isSelected,
      isInRange,
      isStart,
      isEnd,
    })
  }

  // 下个月的填充
  const totalCells = Math.ceil(days.length / 7) * 7
  const nextMonth = month === 11 ? 0 : month + 1
  const nextYear = month === 11 ? year + 1 : year

  for (let day = 1; days.length < totalCells; day++) {
    const date = new Date(nextYear, nextMonth, day)
    days.push({
      date,
      day,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      isInRange: false,
      isStart: false,
      isEnd: false,
    })
  }

  return days
}

/**
 * 生成月份数据
 */
export function generateMonths(year: number, selected: Date | null): LhDatePickerMonthData[] {
  const months: LhDatePickerMonthData[] = []
  for (let month = 0; month < 12; month++) {
    months.push({
      month,
      year,
      isSelected: selected ? selected.getMonth() === month && selected.getFullYear() === year : false,
    })
  }
  return months
}

/**
 * 生成年份数据
 */
export function generateYears(startYear: number, selected: Date | null): LhDatePickerYearData[] {
  const years: LhDatePickerYearData[] = []
  const endYear = startYear + 11
  for (let year = startYear; year <= endYear; year++) {
    years.push({
      year,
      isSelected: selected ? selected.getFullYear() === year : false,
    })
  }
  return years
}

/**
 * 检查日期是否禁用
 */
export function isDateDisabled(
  date: Date,
  minDate: Date | null,
  maxDate: Date | null,
  disabledDate: ((date: Date) => boolean) | null
): boolean {
  if (disabledDate && disabledDate(date)) return true
  if (minDate && compareDate(date, minDate) < 0) return true
  if (maxDate && compareDate(date, maxDate) > 0) return true
  return false
}

/**
 * 获取选择器类名
 */
export function getDatePickerClassNames(state: {
  size: string
  disabled: boolean
  visible: boolean
}): string[] {
  const classes = ['lh-date-picker']
  if (state.size) classes.push(`lh-date-picker--${state.size}`)
  if (state.disabled) classes.push('lh-date-picker--disabled')
  if (state.visible) classes.push('lh-date-picker--visible')
  return classes
}