import { getDateAdapter } from './adapter'
import type { LhDateAdapter } from './adapter'
import type { LhDatePickerDayData, LhDatePickerMonthData, LhDatePickerYearData } from './types'
import { getPopupTriggerAria } from '../shared/a11y'
import type { LhAriaAttrs } from '../shared/a11y'

/**
 * 通用日期原语已下沉到 core/shared/date（共享内核），此处按原导出面再导出，
 * 保证 `@lh-ui/share/core/date-picker` 的既有引用（下游的 formatDate / parseDate /
 * isSameDay / isDateDisabled / getDaysInMonth 等）不需要改路径；adapter 也直接依赖
 * 内核，不再反向 import 本文件，避免 logic ↔ adapter 循环依赖。
 */
export {
  compareDate,
  formatDate,
  getDaysInMonth,
  getFirstDayOfMonth,
  isDateDisabled,
  isSameDay,
  isSameMonth,
  parseDate,
} from '../shared/date'

/** 一周从哪天开始：0=周日（默认）… 6=周六 */
export type LhFirstDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

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
