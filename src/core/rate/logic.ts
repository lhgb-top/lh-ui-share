import type { LhRateState } from './types'

/** 模板插值：'{n}' 占位符替换，未知占位符原样保留（与 pagination 的 formatMessage 同规则） */
function interpolate(template: string, params: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  )
}

/** 默认星数 */
export const LH_RATE_MAX_DEFAULT = 5

/** 钳制评分到 [0, max]；非数值归 0 */
export function clampRate(value: number | undefined, max: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  return Math.min(Math.max(value, 0), max)
}

/** 步进：半星模式按 0.5，否则 1（direction: 1 增 / -1 减），结果钳制 */
export function stepRate(
  value: number,
  direction: 1 | -1,
  allowHalf: boolean,
  max: number,
): number {
  const step = allowHalf ? 0.5 : 1
  const next = value + direction * step
  // 避免浮点累积：统一保留 1 位小数
  return clampRate(Math.round(next * 10) / 10, max)
}

/**
 * 第 index 颗星（1 起）的填充档位：full / half / empty
 */
export function getStarFill(value: number, index: number, allowHalf: boolean): 'full' | 'half' | 'empty' {
  if (value >= index) return 'full'
  if (allowHalf && value >= index - 0.5) return 'half'
  return 'empty'
}

/** aria 文案：`{n} 星`（`{n}` 支持小数，如 4.5） */
export function getRateAriaText(value: number, template: string): string {
  return interpolate(template, { n: String(Math.round(value * 10) / 10) })
}

/** 只读展示类名 */
export function getRateClassNames(state: LhRateState & { readonly: boolean; disabled: boolean }): string[] {
  const classes = ['lh-rate']
  if (state.readonly) classes.push('lh-rate--readonly')
  if (state.disabled) classes.push('lh-rate--disabled')
  return classes
}
