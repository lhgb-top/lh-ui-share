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

/** Row 容器类名 */
export function getGridRowClassNames(state: { justify?: string; align?: string; wrap?: boolean }): string[] {
  const classes = ['lh-row']
  if (state.justify && state.justify !== 'start') classes.push(`lh-row--${state.justify}`)
  if (state.align && state.align !== 'top') classes.push(`lh-row--${state.align}`)
  if (state.wrap === false) classes.push('lh-row--nowrap')
  return classes
}

/** 把尺寸配置归一为栅格描述对象 */
export function normalizeColSize(size: LhColSize | undefined): LhGridSpan {
  if (size == null) return {}
  if (typeof size === 'number') return { span: size }
  return { ...size }
}

/** 钳制 span 到 [0, 24]（0 表示不占列、仅用于 offset 定位） */
export function clampSpan(span: number | undefined): number {
  if (span == null || Number.isNaN(span)) return 0
  return Math.min(Math.max(Math.floor(span), 0), LH_GRID_COLUMNS)
}

/**
 * 生成 Col 的 CSS Grid 列定位样式：
 * 以 24 列为坐标系，span + offset + push/pull 直接映射到 grid-column。
 * push/pull 在 offset 基础上平移起点（push 右移、pull 左移，起点钳制 ≥ 1）。
 */
export function getColStyle(size: LhColSize | undefined): Record<string, string> {
  const { span, offset, push, pull } = normalizeColSize(size)
  const spanValue = clampSpan(span)
  const offsetValue = clampSpan(offset)
  const pushValue = clampSpan(push)
  const pullValue = clampSpan(pull)
  const style: Record<string, string> = {}

  if (spanValue > 0 || offsetValue > 0) {
    const start = Math.max(offsetValue + 1 + pushValue - pullValue, 1)
    style.gridColumn = `${start} / span ${spanValue || LH_GRID_COLUMNS}`
  } else {
    style.gridColumn = `span ${LH_GRID_COLUMNS}`
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
