import type { LhCardInteractivity, LhCardState } from './types'

/**
 * 计算卡片类名
 */
export function getCardClassNames(state: LhCardState): string[] {
  const classes = ['lh-card']
  classes.push(`lh-card--shadow-${state.shadow}`)
  if (state.clickable) classes.push('lh-card--clickable')
  if (state.loading) classes.push('lh-card--loading')
  return classes
}

/**
 * 卡片是否可交互：clickable 且非 loading
 */
export function isCardInteractive(state: LhCardState): boolean {
  return state.clickable && !state.loading
}

/**
 * 可交互卡片的语义：对齐 APG button pattern
 * - interactive：整卡承担 button 语义（tabindex + role="button"）
 * - static：无 role，内容自然可聚焦
 */
export function getCardInteractivity(state: LhCardState): LhCardInteractivity {
  return isCardInteractive(state) ? 'interactive' : 'static'
}
