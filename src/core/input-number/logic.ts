/**
 * InputNumber 纯函数逻辑（无框架依赖）
 */

import type { LhInputNumberState } from './types'

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// Export as clampValue for component compatibility
export { clampNumber as clampValue }

export function incrementValue(value: number | null, step: number, min: number, max: number, precision?: number): number {
  if (value === null) return clampNumber(step, min, max)
  const result = precision !== undefined ? Number((value + step).toFixed(precision)) : value + step
  return clampNumber(result, min, max)
}

export function decrementValue(value: number | null, step: number, min: number, max: number, precision?: number): number {
  if (value === null) return clampNumber(-step, min, max)
  const result = precision !== undefined ? Number((value - step).toFixed(precision)) : value - step
  return clampNumber(result, min, max)
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