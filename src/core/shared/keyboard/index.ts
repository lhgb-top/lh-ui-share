/**
 * 键盘交互内核（纯函数，无框架依赖）
 *
 * core 层不监听任何按键（键盘事件接线属于 UI 层），本模块提供两件事：
 * 1. 按键常量与判定函数 —— UI 层 keydown 处理统一引用，杜绝字符串散写
 * 2. 列表导航纯函数 —— select / menu / tree / segmented / tabs 共用一套
 *    「方向移动 + 首尾循环 + 跳过禁用」算法，各组件的散写导航函数收敛到此处
 */

/** 按键名常量（KeyboardEvent.key，UI 层禁止再裸写字符串字面量） */
import { clamp } from '../sanitize'

export const LH_KEYS = {
  Escape: 'Escape',
  Enter: 'Enter',
  Space: ' ',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  Home: 'Home',
  End: 'End',
  Tab: 'Tab',
  Backspace: 'Backspace',
  Delete: 'Delete',
  PageUp: 'PageUp',
  PageDown: 'PageDown',
} as const

/** 可接受的按键来源：真实事件或裸 key 值（纯函数测试与 UI 层合成场景都需要） */
export type LhKeyEvent = KeyboardEvent | { key: string }

function toKey(e: LhKeyEvent): string {
  return typeof e === 'object' && e !== null ? e.key : ''
}

/** 激活键：按钮 / 列表项点击语义（Enter 与 Space 都触发原生 click） */
export function isActivationKey(e: LhKeyEvent): boolean {
  const key = toKey(e)
  return key === LH_KEYS.Enter || key === LH_KEYS.Space
}

/** 方向键（四向） */
export function isArrowKey(e: LhKeyEvent): boolean {
  const key = toKey(e)
  return (
    key === LH_KEYS.ArrowUp ||
    key === LH_KEYS.ArrowDown ||
    key === LH_KEYS.ArrowLeft ||
    key === LH_KEYS.ArrowRight
  )
}

/** 逃逸键：弹出层关闭 */
export function isEscapeKey(e: LhKeyEvent): boolean {
  return toKey(e) === LH_KEYS.Escape
}

/** Home / End：列表首尾跳跃 */
export function isHomeOrEndKey(e: LhKeyEvent): boolean {
  const key = toKey(e)
  return key === LH_KEYS.Home || key === LH_KEYS.End
}

/** 空格键（部分场景需与 Enter 区分，如滚动容器内翻页） */
export function isSpaceKey(e: LhKeyEvent): boolean {
  return toKey(e) === LH_KEYS.Space
}

/** 水平方向键（RTL 布局下左右语义由 UI 层翻转，本函数只做物理键判定） */
export function isHorizontalArrowKey(e: LhKeyEvent): boolean {
  const key = toKey(e)
  return key === LH_KEYS.ArrowLeft || key === LH_KEYS.ArrowRight
}

/** 垂直方向键 */
export function isVerticalArrowKey(e: LhKeyEvent): boolean {
  const key = toKey(e)
  return key === LH_KEYS.ArrowUp || key === LH_KEYS.ArrowDown
}

/** 导航方向：数值偏移或首尾哨兵 */
export type LhListDirection = 1 | -1 | 'first' | 'last'

/** 列表项的最小约束（只需禁用标记，具体形状由调用方提供） */
export interface LhListItem {
  disabled?: boolean
}

export interface LhListNavigationOptions<T = unknown> {
  /** 首尾循环（默认 true） */
  loop?: boolean
  /** 跳过禁用项（默认 true） */
  skipDisabled?: boolean
  /**
   * 自定义禁用判定，默认读 `item.disabled`
   *
   * 列表项形态各异（DOM 元素、名字字符串、树节点……），禁用标记未必挂在顶层，
   * 交由调用方映射；不传时安全降级为读 `item.disabled`（读不到视为未禁用）
   */
  isDisabled?: (item: T) => boolean
}

/**
 * 通用列表导航：计算目标项下标，供 select / menu / tree / segmented / tabs 共用
 *
 * - 方向为数值时按步进移动，'first' / 'last' 直达首尾
 * - 空列表、无可用项（全部禁用且 skipDisabled）返回 -1
 * - 不循环时到达边界停在边界（返回边界下标，不返回 -1）；中间位置的禁用项会被跳过，
 *   只有边界项本身禁用时才返回 -1
 *
 * @param items 列表项（DOM 序）
 * @param current 当前下标（越界或 -1 时按「未选中」处理：正向取首项、负向取末项）
 */
export function getNextListIndex<T>(
  items: T[],
  current: number,
  direction: LhListDirection,
  options: LhListNavigationOptions<T> = {},
): number {
  const { loop = true, skipDisabled = true, isDisabled } = options
  // T 交叉 LhListItem 的断言总是类型安全（得到 T 的超集），免去 unknown 中转
  const disabledOf = isDisabled ?? ((item: T) => !!(item as T & LhListItem).disabled)

  if (direction === 'first') {
    const index = firstEnabled(items, skipDisabled, disabledOf)
    return index
  }
  if (direction === 'last') {
    return lastEnabled(items, skipDisabled, disabledOf)
  }

  const count = items.length
  if (count === 0) return -1

  // 当前下标无效时，正向从首项出发、负向从末项出发
  const start =
    current < 0 || current >= count ? (direction > 0 ? -1 : count) : current

  for (let step = 1; step <= count; step += 1) {
    let next = start + direction * step
    let atBorder = false
    if (loop) {
      next = ((next % count) + count) % count
    } else if (next < 0 || next >= count) {
      // 不循环：钳到边界
      next = direction > 0 ? count - 1 : 0
      atBorder = true
    }
    if (!skipDisabled || !disabledOf(items[next])) return next
    // 不循环时只有步进已到边界且该项禁用才终止（中间的禁用项继续跳过）
    if (atBorder) return -1
  }
  return -1
}

function firstEnabled<T>(
  items: T[],
  skipDisabled: boolean,
  disabledOf: (item: T) => boolean,
): number {
  if (!skipDisabled) return items.length > 0 ? 0 : -1
  return items.findIndex((item) => !disabledOf(item))
}

function lastEnabled<T>(
  items: T[],
  skipDisabled: boolean,
  disabledOf: (item: T) => boolean,
): number {
  if (!skipDisabled) return items.length > 0 ? items.length - 1 : -1
  for (let i = items.length - 1; i >= 0; i -= 1) {
    if (!disabledOf(items[i])) return i
  }
  return -1
}

/**
 * type-ahead 首字符匹配（select / dropdown / menu 的字符输入导航）
 *
 * - 支持多字符累积输入（500ms 内的连续击键视为一个查询串，过期清空由 UI 层负责）
 * - 匹配规则：项标签以查询串开头（大小写不敏感）
 * - 从 startIndex 之后开始找，找不到再从头找到 startIndex（环绕）
 * - 无匹配返回 -1
 *
 * @param labels 项标签（与 items 同序）
 * @param query 用户输入的查询串（已转小写）
 * @param startIndex 起始下标（通常为当前高亮项）
 */
export function findTypeAheadIndex(
  labels: string[],
  query: string,
  startIndex = -1,
): number {
  if (!query || labels.length === 0) return -1
  const needle = query.toLowerCase()

  // 先从起点之后向后找
  for (let i = 1; i <= labels.length; i += 1) {
    const index = (startIndex + i) % labels.length
    if (labels[index]?.toLowerCase().startsWith(needle)) return index
  }
  return -1
}

/**
 * roving tabindex 计算：启用项 0、其余 -1，供 tabs / menu / segmented / tree 落 tabindex
 *
 * activeIndex 无可用项时首项为 0（保证组内至少有一个可 Tab 进入的锚点）
 */
export function getRovingTabIndex<T>(items: T[], activeIndex: number): number {
  if (items.length === 0) return -1
  const disabledOf = (item: T) => !!(item as T & LhListItem).disabled
  if (activeIndex >= 0 && activeIndex < items.length && !disabledOf(items[activeIndex])) {
    return activeIndex
  }
  const fallback = firstEnabled(items, true, disabledOf)
  return fallback
}

/** 二维网格键盘导航的形状约束（日期网格、月份网格等） */
export interface LhGridNavOptions {
  /** 每行列数 */
  cols: number
  /** 网格总格数 */
  total: number
  /** 行内 / 整体循环（默认 false，到边界返回 null 交由 UI 层翻页） */
  loop?: boolean
}

/**
 * 二维网格的键盘导航：计算目标格下标（供日期网格、月份网格共用）
 *
 * - ArrowRight / ArrowLeft：水平 ±1，**跨行连续流动**（行末右移到下一行行首，
 *   只有越过整个网格边界才返回 null）
 * - ArrowDown / ArrowUp：垂直 ±cols，越过网格上 / 下边界返回 null
 * - Home / End：行首 / 行末（行内语义，最后一行可能不足 cols，行末按 total 收敛）
 * - 非导航键、或（不循环时）越过网格边界返回 null，UI 层据此决定是否翻页（如翻月）
 * - loop=true 时在网格内循环，合法导航键总有落点
 *
 * 日期网格按「线性日序」使用横向箭头：同一周内右移走到行末后自然进入下一周行首，
 * 只有整个月的尽头才触发翻月，符合读屏用户对日历的心智模型。
 *
 * @param current 当前格下标（越界视为无效焦点，返回 null）
 */
export function getNextGridCell(
  current: number,
  key: string,
  opts: LhGridNavOptions,
): number | null {
  const { cols, total, loop = false } = opts
  if (total <= 0 || cols <= 0) return null
  if (current < 0 || current >= total) return null

  const rowStart = current - (current % cols)
  const rowEnd = Math.min(rowStart + cols - 1, total - 1)

  /** 按线性步长移动，越界时按 loop 决定循环或返回 null */
  function step(delta: number): number | null {
    const next = current + delta
    if (next < 0 || next >= total) return loop ? (next + total) % total : null
    return next
  }

  switch (key) {
    case LH_KEYS.ArrowRight:
      return step(1)
    case LH_KEYS.ArrowLeft:
      return step(-1)
    case LH_KEYS.ArrowDown:
      return step(cols)
    case LH_KEYS.ArrowUp:
      return step(-cols)
    case LH_KEYS.Home:
      return rowStart
    case LH_KEYS.End:
      return rowEnd
    default:
      return null
  }
}

/** range 控件（slider 等）按键导航的量程约束 */
export interface LhRangeNavOptions {
  /** 最小值 */
  min: number
  /** 最大值 */
  max: number
  /** 方向键步长（非有限或 ≤ 0 时退化为 1，并只做边界钳制） */
  step: number
  /** PageUp / PageDown 步长；默认取 max(step, (max-min)/10) */
  pageStep?: number
}

/**
 * range 控件（slider 等）的按键导航：把按键翻译为新值
 *
 * - ArrowRight / ArrowUp：按 step 递增；ArrowLeft / ArrowDown：按 step 递减
 * - PageUp / PageDown：按 pageStep 大步进（默认取 max(step, (max-min)/10)，
 *   保证大步进不小于方向键步长）
 * - Home / End：直达 min / max
 * - 非导航键原样返回当前值，调用方据此判断是否需要 preventDefault
 *
 * 只做边界 clamp、不做 step 取整：WAI-ARIA 要求「每次按键移动一个 step」，
 * 取整会让未对齐的当前值出现 25 → 40 这类双跳。当前值的对齐由组件层
 * 在写入 localValue 时保证（拖拽 / 外部值落入都先 snap）。
 */
export function getNextRangeValue(
  current: number,
  key: string,
  opts: LhRangeNavOptions,
): number {
  const { min, max, step } = opts
  // step 非有限或 ≤ 0 时退化为按 1 移动，避免 NaN / 反向移动污染结果
  const unit = Number.isFinite(step) && step > 0 ? step : 1

  function move(delta: number): number {
    return clamp(current + delta, min, max)
  }

  switch (key) {
    case LH_KEYS.ArrowRight:
    case LH_KEYS.ArrowUp:
      return move(unit)
    case LH_KEYS.ArrowLeft:
    case LH_KEYS.ArrowDown:
      return move(-unit)
    case LH_KEYS.PageUp:
      return move(opts.pageStep ?? Math.max(unit, (max - min) / 10))
    case LH_KEYS.PageDown:
      return move(-(opts.pageStep ?? Math.max(unit, (max - min) / 10)))
    case LH_KEYS.Home:
      return clamp(min, min, max)
    case LH_KEYS.End:
      return clamp(max, min, max)
    default:
      return current
  }
}
