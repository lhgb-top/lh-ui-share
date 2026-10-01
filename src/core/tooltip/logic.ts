/**
 * Tooltip 纯函数逻辑（无框架依赖）
 */

import type { LhTooltipState } from './types'

export function getPopperClass(state: Pick<LhTooltipState, 'effect' | 'placement'>): string[] {
  return [
    'lh-tooltip__popper',
    `lh-tooltip__popper--${state.effect}`,
    `lh-tooltip__popper--${state.placement}`,
  ]
}

export function getPopperStyle(state: Pick<LhTooltipState, 'maxWidth'>): Record<string, string> {
  const style: Record<string, string> = {}
  if (state.maxWidth) {
    style.maxWidth = typeof state.maxWidth === 'number' ? `${state.maxWidth}px` : state.maxWidth
  }
  return style
}

export function getDefaultDelay(showDelay: number | undefined, hideDelay: number | undefined): { show: number; hide: number } {
  return {
    show: showDelay ?? 200,
    hide: hideDelay ?? 0,
  }
}