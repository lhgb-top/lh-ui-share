import type { LhSliderState } from './types'

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// Export as clampValue for component compatibility
export { clampNumber as clampValue }

export function snapToStep(value: number, min: number, step: number): number {
  const remainder = (value - min) % step
  if (remainder < step / 2) return value - remainder
  return value + (step - remainder)
}

export function clampAndSnap(value: number, min: number, max: number, step: number): number {
  return clampNumber(snapToStep(value, min, step), min, max)
}

export function getValueFromPosition(pct: number, min: number, max: number, step: number): number {
  const raw = min + pct * (max - min)
  return clampAndSnap(raw, min, max, step)
}

export function getPositionFromValue(value: number, min: number, max: number): number {
  if (max === min) return 0
  return clampNumber((value - min) / (max - min), 0, 1)
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
    const minVal = clampNumber((state.value as [number, number])?.[0] ?? state.min, state.min, state.max)
    const maxVal = clampNumber((state.value as [number, number])?.[1] ?? (state.min + state.max) / 2, state.min, state.max)
    return [minVal, maxVal]
  }
  return clampNumber((state.value as number) ?? state.min, state.min, state.max)
}

export function buildMarksList(marks: Record<number, string> | undefined): { label: string; value: number }[] {
  if (!marks) return []
  return Object.entries(marks).map(([value, label]) => ({
    label,
    value: Number(value),
  })).sort((a, b) => a.value - b.value)
}