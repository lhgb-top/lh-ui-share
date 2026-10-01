/**
 * Tooltip 纯类型定义（无框架依赖）
 */

export type LhTooltipPlacementCore = 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end'
export type LhTooltipTriggerCore = 'hover' | 'click' | 'focus' | 'manual'
export type LhTooltipEffectCore = 'dark' | 'light'

export interface LhTooltipState {
  placement: LhTooltipPlacementCore
  effect: LhTooltipEffectCore
  maxWidth: string | number | undefined
}