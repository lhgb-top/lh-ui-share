import { getDateAdapter } from './adapter'
import type { LhDateAdapter } from './adapter'
import type { LhDatePickerDayData, LhDatePickerMonthData, LhDatePickerYearData } from './types'
import { getPopupTriggerAria } from '../shared/a11y'
import type { LhAriaAttrs } from '../shared/a11y'

/**
 * 通用日期原语已下沉到 core/shared/date（共享内核），此处按原导出面再导出，
 * 保证 `@lh-ui/share/core/date-picker` 的既有引用（下游的 isSameDay /
 * isDateDisabled / getDaysInMonth 等）不需要改路径。
 */
export {
  compareDate,
  getDaysInMonth,
  getFirstDayOfMonth,
  isDateDisabled,
  isSameDay,
  isSameMonth,
} from '../shared/date'

/** 一周从哪天开始：0=周日（默认）… 6=周六 */
export type LhFirstDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

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

/**
 * 生成日历数据
 *
 * @param firstDayOfWeek 一周起始（0=周日默认，1=周一……），影响首行前置填充
 * @param adapter 可选日期适配器，缺省取 getDateAdapter() 的当前注入实现
 *   （显式参数优先于全局单例：调用方可在不污染全局状态的前提下按需替换实现）
 */
export function generateCalendarDays(
  year: number,
  month: number,
  selected: Date | null,
  rangeStart: Date | null,
  rangeEnd: Date | null,
  today: Date,
  firstDayOfWeek: LhFirstDayOfWeek = 0,
  adapter: LhDateAdapter = getDateAdapter()
): LhDatePickerDayData[] {
  // 网格生成走日期适配器：setDateAdapter 注入 dayjs 等实现后此处自动跟随；
  // 也可由调用方显式传入，避免跨实例的全局状态污染
  const days: LhDatePickerDayData[] = []
  const daysInMonth = adapter.getDaysInMonth(year, month)
  const firstDay = adapter.getFirstDayOfMonth(year, month)
  // 相对一周起始日的前置空位数（周日起始时即 firstDay 本身）
  const leading = (firstDay - firstDayOfWeek + 7) % 7

  // 上个月的填充
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const daysInPrevMonth = adapter.getDaysInMonth(prevYear, prevMonth)

  for (let i = leading - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const date = new Date(prevYear, prevMonth, day)
    days.push({
      date,
      day,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
      isToday: adapter.isSameDay(date, today),
      isSelected: selected ? adapter.isSameDay(date, selected) : false,
      isInRange: false,
      isStart: false,
      isEnd: false,
    })
  }

  // 当前月
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const isSelected = selected ? adapter.isSameDay(date, selected) : false
    const isStart = rangeStart ? adapter.isSameDay(date, rangeStart) : false
    const isEnd = rangeEnd ? adapter.isSameDay(date, rangeEnd) : false
    // 天级比较：单元格是本地 00:00，rangeStart/End 可能携带时刻，
    // 统一用 compare 避免结束日同时被判为 isInRange
    const isInRange = !!(
      rangeStart &&
      rangeEnd &&
      adapter.compare(date, rangeStart) > 0 &&
      adapter.compare(date, rangeEnd) < 0
    )

    days.push({
      date,
      day,
      month,
      year,
      isCurrentMonth: true,
      isToday: adapter.isSameDay(date, today),
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
      isToday: adapter.isSameDay(date, today),
      isSelected: selected ? adapter.isSameDay(date, selected) : false,
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
/**
 * 触发器的无障碍属性包：日期面板以 dialog 语义弹出（APG 日期选择器模式）
 *
 * @param visible 面板是否展开
 * @param panelId 面板元素 id（未传时不输出 aria-controls）
 */
export function getDatePickerTriggerAria(visible: boolean, panelId?: string): LhAriaAttrs {
  return getPopupTriggerAria({ expanded: visible, popupId: panelId, haspopup: 'dialog' })
}

/**
 * 面板容器的无障碍属性包：role="dialog"，aria-label 由 UI 层从 locale 取「选择日期」类文案
 *
 * @param id 面板元素 id，与触发器的 aria-controls 对应
 */
export function getDatePickerPanelAria(id?: string): LhAriaAttrs {
  const attrs: LhAriaAttrs = { role: 'dialog' }
  if (id) attrs.id = id
  return attrs
}
