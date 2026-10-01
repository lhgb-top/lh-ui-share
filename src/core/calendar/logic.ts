import { compareDate, isDateDisabled, isSameDay } from '../date-picker'
import type { LhCalendarRange } from './types'

export { generateCalendarDays, isSameDay } from '../date-picker'

/** 日历容器类名 */
export function getCalendarClassNames(): string[] {
  return ['lh-calendar']
}

/** 日期平移（键盘导航的基础；用年月日构造避免跨月溢出副作用） */
export function shiftCalendarDate(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

/** 月份平移（保持日序号，越界自动归化） */
export function shiftCalendarMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const total = year * 12 + month + delta
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 }
}

/** 范围约束下的禁用判定（无约束恒 false） */
export function isCalendarDateDisabled(date: Date, range: LhCalendarRange | undefined): boolean {
  if (!range) return false
  return isDateDisabled(date, range[0], range[1], null)
}

/** 把日期钳制进可选范围 */
export function clampDateToRange(date: Date, range: LhCalendarRange | undefined): Date {
  if (!range) return date
  if (compareDate(date, range[0]) < 0) return range[0]
  if (compareDate(date, range[1]) > 0) return range[1]
  return date
}

/** 选中态（同日判定，供 aria-current 与类名共用） */
export function isCalendarSelected(date: Date, selected: Date | null): boolean {
  return selected ? isSameDay(date, selected) : false
}

/**
 * 一段时间的两端归一（保证 start <= end）
 */
export function normalizeCalendarSpan(a: Date, b: Date): [Date, Date] {
  return compareDate(a, b) <= 0 ? [a, b] : [b, a]
}

/**
 * 日期是否落在 [start, end] 闭区间内（任一端为 null 返回 false）
 */
export function isCalendarInSpan(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false
  return compareDate(date, start) >= 0 && compareDate(date, end) <= 0
}

/**
 * 多选切换：命中则移除，否则加入并按时间排序
 */
export function toggleCalendarDate(dates: Date[], date: Date): Date[] {
  const rest = dates.filter((d) => !isSameDay(d, date))
  if (rest.length !== dates.length) return rest
  return [...rest, date].sort(compareDate)
}
