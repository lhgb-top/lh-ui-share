import { compareDate, isDateDisabled, isSameDay } from '../shared/date'
import type { LhCalendarRange } from './types'
import type { LhAriaAttrs } from '../shared/a11y'

// 通用日期原语已下沉到 core/shared/date，calendar 不再依赖 date-picker 的 logic。
// generateCalendarDays 仍从 date-picker 引入：日历网格算法是 date-picker 的职责
// （calendar 是它的日历视图），这层依赖是语义性的、非通用原语
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
  // 先归一区间，反序 range 不会导致全禁用
  const [start, end] = normalizeCalendarSpan(range[0], range[1])
  return isDateDisabled(date, start, end, null)
}

/** 把日期钳制进可选范围（反序 range 先归一，与 isCalendarDateDisabled 同规则） */
export function clampDateToRange(date: Date, range: LhCalendarRange | undefined): Date {
  if (!range) return date
  const [start, end] = normalizeCalendarSpan(range[0], range[1])
  if (compareDate(date, start) < 0) return start
  if (compareDate(date, end) > 0) return end
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

/**
 * 日期单元格的无障碍属性包：选中日输出 aria-current="date"，
 * 禁用日输出 aria-disabled（复用 isCalendarDateDisabled 的判定）
 */
export function getCalendarCellAria(options: {
  date: Date
  selected: Date | null
  range?: LhCalendarRange
}): LhAriaAttrs {
  const { date, selected, range } = options
  const attrs: LhAriaAttrs = {}
  if (isCalendarSelected(date, selected)) attrs['aria-current'] = 'date'
  if (isCalendarDateDisabled(date, range)) attrs['aria-disabled'] = true
  return attrs
}
