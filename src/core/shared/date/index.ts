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

/**
 * 格式化日期
 *
 * 支持任意顺序的定宽 token（yyyy / MM / dd / HH / mm / ss），同一 token 出现多次时全部替换。
 * 与 parseDate 对称：格式化出来的串一定能解析回去。
 * 年份补零到 4 位：yyyy 是定宽 token，year < 1000 时缺补零会破坏回读
 * （year ≥ 10000 超出定宽 token 表达力，不在支持范围）。
 */
export function formatDate(date: Date, format: string): string {
  const year = String(date.getFullYear()).padStart(4, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace(/yyyy/g, year)
    .replace(/MM/g, month)
    .replace(/dd/g, day)
    .replace(/HH/g, hours)
    .replace(/mm/g, minutes)
    .replace(/ss/g, seconds)
}

/**
 * 解析日期字符串
 *
 * 与 formatDate 对称：各 token 按 format 中的位置取值（年份不再硬编码在第 0 位）。
 * 解析失败的两种情形都返回 null：
 *   - 串与格式不对应（parseInt 得到 NaN）；
 *   - 值不合法（如 2023-02-30 会被 Date 静默滚到 3 月）——构造后回读校验。
 */
export function parseDate(str: string, format: string): Date | null {
  const yearIdx = format.indexOf('yyyy')
  const monthIdx = format.indexOf('MM')
  const dayIdx = format.indexOf('dd')
  const hoursIdx = format.indexOf('HH')
  const minutesIdx = format.indexOf('mm')
  const secondsIdx = format.indexOf('ss')

  const year = yearIdx >= 0 ? parseInt(str.substring(yearIdx, yearIdx + 4), 10) : new Date().getFullYear()
  const month = monthIdx >= 0 ? parseInt(str.substring(monthIdx, monthIdx + 2), 10) - 1 : 0
  const day = dayIdx >= 0 ? parseInt(str.substring(dayIdx, dayIdx + 2), 10) : 1
  const hours = hoursIdx >= 0 ? parseInt(str.substring(hoursIdx, hoursIdx + 2), 10) : 0
  const minutes = minutesIdx >= 0 ? parseInt(str.substring(minutesIdx, minutesIdx + 2), 10) : 0
  const seconds = secondsIdx >= 0 ? parseInt(str.substring(secondsIdx, secondsIdx + 2), 10) : 0

  if (
    isNaN(year) ||
    isNaN(month) ||
    isNaN(day) ||
    isNaN(hours) ||
    isNaN(minutes) ||
    isNaN(seconds)
  ) {
    return null
  }

  const date = new Date(year, month, day, hours, minutes, seconds)
  if (isNaN(date.getTime())) return null
  // 回读校验：越界的月/日/时/分/秒会被 Date 静态归一化，与用户输入不一致即视为非法
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day ||
    date.getHours() !== hours ||
    date.getMinutes() !== minutes ||
    date.getSeconds() !== seconds
  ) {
    return null
  }
  return date
}
