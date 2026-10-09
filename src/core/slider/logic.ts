import { clamp } from '../shared/sanitize'
import type { LhSliderState } from './types'
import type { LhAriaAttrs } from '../shared/a11y'

// Export as clampValue for component compatibility
export { clamp as clampValue }

export function snapToStep(value: number, min: number, step: number): number {
  // step 非有限或 ≤ 0 时无法取模取整（step=0 会让 % 产生 NaN）：
  // 回退原值，由 clampAndSnap 做纯边界钳制
  if (!Number.isFinite(step) || step <= 0) return value
  const remainder = (value - min) % step
  if (remainder < step / 2) return value - remainder
  return value + (step - remainder)
}

export function clampAndSnap(value: number, min: number, max: number, step: number): number {
  return clamp(snapToStep(value, min, step), min, max)
}

export function getValueFromPosition(pct: number, min: number, max: number, step: number): number {
  const raw = min + pct * (max - min)
  return clampAndSnap(raw, min, max, step)
}

export function getPositionFromValue(value: number, min: number, max: number): number {
  if (max === min) return 0
  return clamp((value - min) / (max - min), 0, 1)
}

export function getSliderClassNames(state: LhSliderState): string[] {
  const classes = ['lh-slider']
  if (state.disabled) classes.push('lh-slider--disabled')
  if (state.range) classes.push('lh-slider--range')
  if (state.size) classes.push(`lh-slider--${state.size}`)
  return classes
}

export function getInitialValue(state: LhSliderState): number | [number, number] {
  if (state.range) {
    const minVal = clamp((state.value as [number, number])?.[0] ?? state.min, state.min, state.max)
    const maxVal = clamp((state.value as [number, number])?.[1] ?? (state.min + state.max) / 2, state.min, state.max)
    return [minVal, maxVal]
  }
  return clamp((state.value as number) ?? state.min, state.min, state.max)
}

export function buildMarksList(marks: Record<number, string> | undefined): { label: string; value: number }[] {
  if (!marks) return []
  return Object.entries(marks).map(([value, label]) => ({
    label,
    value: Number(value),
  })).sort((a, b) => a.value - b.value)
}
/**
 * 滑块的无障碍属性包：role="slider" + aria-valuenow/min/max + aria-orientation
 *
 * @param value 当前值（区间滑块传第一个滑块值，第二个滑块另调一次本函数）
 * @param min/max/step 值域
 * @param vertical 是否纵向（输出 aria-orientation）
 * @param disabled 禁用
 * @param ariaValueText 值的可读文案（带单位或格式化后的值，优先于 valuenow 播报）
 */
export function getSliderThumbAria(options: {
  value: number
  min: number
  max: number
  vertical?: boolean
  disabled?: boolean
  ariaValueText?: string
}): LhAriaAttrs {
  const { value, min, max, vertical, disabled, ariaValueText } = options
  const attrs: LhAriaAttrs = {
    role: 'slider',
    'aria-valuenow': value,
    'aria-valuemin': min,
    'aria-valuemax': max,
  }
  if (vertical) attrs['aria-orientation'] = 'vertical'
  if (disabled) attrs['aria-disabled'] = true
  if (ariaValueText) attrs['aria-valuetext'] = ariaValueText
  return attrs
}
