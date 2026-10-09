/**
 * InputNumber 纯函数逻辑（无框架依赖）
 */

import { clamp, sanitizeNumber } from '../shared/sanitize'
import type { LhInputNumberState } from './types'
import type { LhAriaAttrs } from '../shared/a11y'

/** precision 允许的小数位上限：toFixed 超过 100 位会抛 RangeError */
const LH_PRECISION_MAX = 100

// Export as clampValue for component compatibility
export { clamp as clampValue }

/** 钳制并兜底：计算结果非有限（NaN 步长、NaN 输入）时回退到 [min, max] 内的确定值 */
function clampSafe(value: number, min: number, max: number): number {
  return Number.isFinite(value) ? clamp(value, min, max) : clamp(0, min, max)
}

/** 把 precision 净化为 [0, 100] 整数，非法值回退 0（防 toFixed RangeError） */
function safePrecision(precision: number): number {
  return sanitizeNumber(precision, 0, { min: 0, max: LH_PRECISION_MAX, integer: true })
}

export function incrementValue(value: number | null, step: number, min: number, max: number, precision?: number): number {
  if (value === null) return clampSafe(step, min, max)
  const next = value + step
  const result =
    precision !== undefined ? Number(next.toFixed(safePrecision(precision))) : next
  return clampSafe(result, min, max)
}

export function decrementValue(value: number | null, step: number, min: number, max: number, precision?: number): number {
  if (value === null) return clampSafe(-step, min, max)
  const next = value - step
  const result =
    precision !== undefined ? Number(next.toFixed(safePrecision(precision))) : next
  return clampSafe(result, min, max)
}

export function shouldDisableIncrement(state: LhInputNumberState): boolean {
  return state.disabled || (state.value !== null && state.value >= state.max)
}

export function shouldDisableDecrement(state: LhInputNumberState): boolean {
  return state.disabled || (state.value !== null && state.value <= state.min)
}

export function getDisplayValue(value: number | null, _placeholder: string): string {
  return value !== null ? String(value) : ''
}

/**
 * 数字输入框的无障碍属性包：role="spinbutton" + 值域语义
 *
 * @param value 当前值（null 时不输出 valuenow，读屏播报占位符）
 * @param ariaValueText 值的可读文案（含单位或精度格式化，优先于 valuenow）
 */
export function getInputNumberAria(options: {
  value: number | null
  min: number
  max: number
  step: number
  disabled?: boolean
  ariaValueText?: string
}): LhAriaAttrs {
  const { value, min, max, disabled, ariaValueText } = options
  const attrs: LhAriaAttrs = {
    role: 'spinbutton',
    'aria-valuemin': min,
    'aria-valuemax': max,
  }
  if (value != null) attrs['aria-valuenow'] = value
  if (disabled) attrs['aria-disabled'] = true
  if (ariaValueText) attrs['aria-valuetext'] = ariaValueText
  return attrs
}
