/**
 * 通用日期原语（框架无关、零依赖）
 *
 * 这层是日期运算的「共享内核」：date-picker 的默认 adapter、calendar 的区间
 * 运算都在此之上构建，组件之间不再互相 import 对方的 logic。
 * month 一律 0 起（与原生 Date 一致）；只比较日期部分，不看时刻。
 */

/**
 * 两位数年份归一到 1900+（JS 的 `new Date(99, ...)` 会把 99 当作 1999）。
 * getDaysInMonth / getFirstDayOfMonth 共用。
 */
function normalizeTwoDigitYear(year: number): number {
  return year >= 0 && year < 100 ? 1900 + year : year
}

/**
 * 获取月份的天数
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(normalizeTwoDigitYear(year), month + 1, 0).getDate()
}

/**
 * 获取月份的第一天是星期几
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(normalizeTwoDigitYear(year), month, 1).getDay()
}

/**
 * 比较两个日期是否同一天
 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
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
 * 检查日期是否禁用
 */
export function isDateDisabled(
  date: Date,
  minDate: Date | null,
  maxDate: Date | null,
  disabledDate: ((date: Date) => boolean) | null,
): boolean {
  if (disabledDate && disabledDate(date)) return true
  if (minDate && compareDate(date, minDate) < 0) return true
  if (maxDate && compareDate(date, maxDate) > 0) return true
  return false
}
