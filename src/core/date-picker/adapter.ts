import {
  compareDate,
  formatDate,
  getDaysInMonth,
  getFirstDayOfMonth,
  isSameDay,
  parseDate,
} from './logic'

/**
 * 日期适配器（共享接缝）
 *
 * 默认实现包装本仓库手写的 parse / format / 日历算法；
 * 需要接入 dayjs / date-fns / Intl 时实现本接口，并通过显式参数
 * （如 `generateCalendarDays(year, month, ..., firstDayOfWeek, adapter)`）传入；
 * 旧路径 `setDateAdapter` 仍可用但已标记 @deprecated（模块级单例会跨实例泄漏）。
 * 接口刻意保持最小：只覆盖 core 日历逻辑实际用到的运算。
 *
 * 约定：
 * - month 一律 0 起（与原生 Date 一致）；
 * - 星期 0=周日 … 6=周六；一周起始日由调用方以 firstDayOfWeek 表达；
 * - parse 与 format 必须对称：format 的输出要能被 parse 还原。
 */
export interface LhDateAdapter {
  /** 解析字符串为日期；失败返回 null */
  parse(value: string, format: string): Date | null
  /** 格式化日期为字符串（定宽 token yyyy / MM / dd / HH / mm / ss） */
  format(date: Date, format: string): string
  /** 指定月份的天数（month 0 起） */
  getDaysInMonth(year: number, month: number): number
  /** 指定月份首日的星期（0=周日 … 6=周六） */
  getFirstDayOfMonth(year: number, month: number): number
  /** 只按日期部分比较：a 早于 b 返回负数 */
  compare(a: Date, b: Date): number
  /** 是否同一天 */
  isSameDay(a: Date, b: Date): boolean
  /** 日期平移（跨月 / 跨年安全） */
  addDays(date: Date, amount: number): Date
}

/** 默认适配器：包装 logic.ts 的手写实现 */
const defaultAdapter: LhDateAdapter = {
  parse: (value, format) => parseDate(value, format),
  format: (date, format) => formatDate(date, format),
  getDaysInMonth: (year, month) => getDaysInMonth(year, month),
  getFirstDayOfMonth: (year, month) => getFirstDayOfMonth(year, month),
  compare: (a, b) => compareDate(a, b),
  isSameDay: (a, b) => isSameDay(a, b),
  addDays: (date, amount) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount),
}

let currentAdapter: LhDateAdapter | undefined

/**
 * 注入自定义日期适配器；传 undefined 恢复默认实现。
 *
 * @deprecated 模块级单例会跨组件实例泄漏（多日期选择器场景互相污染）。
 * 请改用显式参数透传：`generateCalendarDays(year, month, ..., firstDayOfWeek, adapter)`，
 * 或在 UI 层把 adapter 作为 props 往下传。本函数仅为兼容下游既有调用保留，
 * 内部仍被 getDateAdapter 的默认读取路径使用，不再新增消费者。
 */
export function setDateAdapter(adapter: LhDateAdapter | undefined): void {
  currentAdapter = adapter
}

/**
 * 取当前生效的日期适配器（未注入时为默认实现）
 *
 * @deprecated 见 setDateAdapter；新代码应显式传入 adapter 参数。
 */
export function getDateAdapter(): LhDateAdapter {
  return currentAdapter ?? defaultAdapter
}
