import { sanitizeNumber } from '../shared/sanitize'
import type { LhBreakpointSizes, LhColSize, LhGridBreakpoint, LhGridSpan } from './types'

/** 栅格总列数 */
export const LH_GRID_COLUMNS = 24

/**
 * 响应式断点（Tailwind 风格，宽度下限 px）：
 * xs 为默认档（<640），其余按「≥ 阈值」命中。
 */
export const LH_GRID_BREAKPOINTS: Record<LhGridBreakpoint, number> = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
}

/** 断点从大到小的稳定顺序 */
export const LH_GRID_BREAKPOINT_ORDER: LhGridBreakpoint[] = ['xl', 'lg', 'md', 'sm', 'xs']

/** 由视口宽度判定当前断点 */
export function resolveBreakpoint(width: number): LhGridBreakpoint {
  if (width >= LH_GRID_BREAKPOINTS.xl) return 'xl'
  if (width >= LH_GRID_BREAKPOINTS.lg) return 'lg'
  if (width >= LH_GRID_BREAKPOINTS.md) return 'md'
  if (width >= LH_GRID_BREAKPOINTS.sm) return 'sm'
  return 'xs'
}

/**
 * 取当前断点下生效的尺寸配置：从当前档向下回退到最近的已定义档（xs 恒兜底）。
 */
export function resolveResponsiveSize(
  sizes: LhBreakpointSizes | undefined,
  breakpoint: LhGridBreakpoint,
): LhColSize | undefined {
  if (!sizes) return undefined
  const start = LH_GRID_BREAKPOINT_ORDER.indexOf(breakpoint)
  for (let i = start; i < LH_GRID_BREAKPOINT_ORDER.length; i++) {
    const size = sizes[LH_GRID_BREAKPOINT_ORDER[i]]
    if (size != null) return size
  }
  return undefined
}

/**
 * Row 容器类名
 *
 * justify / align 各自映射到独立类名（见 styles/grid：--center/--end 走 justify-items，
 * --middle/--bottom 走 align-items）。用显式映射表而非直接拼接，原因有二：
 * 1) 「center」是两个轴的合法值，直接拼会让 justify 与 align 撞同一个 `lh-row--center`；
 * 2) 未知值（如 align="center" 这类从其他库带过来的笔误）不会产出无样式定义的脏类。
 * align 的 center 作 middle 的兼容别名（与主流库 API 习惯对齐）。
 */
const ROW_JUSTIFY_CLASS: Record<string, string> = {
  end: 'lh-row--end',
  center: 'lh-row--center',
  'space-between': 'lh-row--space-between',
  'space-around': 'lh-row--space-around',
}
const ROW_ALIGN_CLASS: Record<string, string> = {
  middle: 'lh-row--middle',
  bottom: 'lh-row--bottom',
  center: 'lh-row--middle',
}

export function getGridRowClassNames(state: { justify?: string; align?: string; wrap?: boolean }): string[] {
  const classes = ['lh-row']
  if (state.justify && ROW_JUSTIFY_CLASS[state.justify]) classes.push(ROW_JUSTIFY_CLASS[state.justify])
  if (state.align && ROW_ALIGN_CLASS[state.align]) classes.push(ROW_ALIGN_CLASS[state.align])
  if (state.wrap === false) classes.push('lh-row--nowrap')
  return classes
}

/** 把尺寸配置归一为栅格描述对象 */
export function normalizeColSize(size: LhColSize | undefined): LhGridSpan {
  if (size == null) return {}
  if (typeof size === 'number') return { span: size }
  return { ...size }
}

/** 钳制 span 到 [0, 24]（0 表示不占列、仅用于 offset 定位）；非有限值归 0 */
export function clampSpan(span: number | undefined): number {
  return sanitizeNumber(span, 0, { min: 0, max: LH_GRID_COLUMNS, integer: true })
}

/**
 * 生成 Col 的 CSS Grid 列定位样式：
 * 以 24 列为坐标系，span + offset + push/pull 直接映射到 grid-column。
 * push/pull 在 offset 基础上平移起点（push 右移、pull 左移，起点钳制 ≥ 1）。
 *
 * span = 0 是「不占列、仅用于定位」的哨兵：起点之后一路延伸到栅格末行
 * （`start / 25`），而不是 `start / span 24`——后者会越过 24 列边界，
 * 迫使 grid 生成隐式轨道把容器撑破。
 */
export function getColStyle(size: LhColSize | undefined): Record<string, string> {
  const { span, offset, push, pull } = normalizeColSize(size)
  const spanValue = clampSpan(span)
  const offsetValue = clampSpan(offset)
  const pushValue = clampSpan(push)
  const pullValue = clampSpan(pull)
  const style: Record<string, string> = {}

  if (offsetValue > 0 || pushValue > 0 || pullValue > 0) {
    // 带 offset/push/pull 时显式定位起点（会打断 auto-placement，属定位用法的预期行为）
    const start = Math.max(offsetValue + 1 + pushValue - pullValue, 1)
    style.gridColumn =
      spanValue > 0
        ? `${start} / span ${spanValue}`
        : `${start} / ${LH_GRID_COLUMNS + 1}`
  } else {
    // 纯 span 走 auto-placement：显式 `1 / span N` 会让同行的每个 Col 都从列 1
    // 开始占位，grid 只能把后续 Col 推到下一行，表现为「竖排」
    style.gridColumn = `span ${spanValue || LH_GRID_COLUMNS}`
  }
  return style
}

/** Col 类名 */
export function getGridColClassNames(size: LhColSize | undefined): string[] {
  const { span, offset } = normalizeColSize(size)
  const classes = ['lh-col']
  if (span) classes.push(`lh-col--${clampSpan(span)}`)
  if (offset) classes.push(`lh-col--offset-${clampSpan(offset)}`)
  return classes
}
