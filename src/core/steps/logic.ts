/**
 * Steps 组件纯函数逻辑（无框架依赖、无用户文案）
 */

import type { LhStepClassState, LhStepStatus, LhStepStatusState, LhStepsDirection } from './types'

/**
 * 计算步骤状态：索引小于当前为 finish，等于为 process，大于为 wait；
 * Steps 级 forced 状态整体覆盖
 */
export function getStepStatus(state: LhStepStatusState): LhStepStatus {
  if (state.forced) return state.forced
  if (state.index < state.current) return 'finish'
  if (state.index === state.current) return 'process'
  return 'wait'
}

/**
 * 计算步骤条根类名
 */
export function getStepsClassNames(direction: LhStepsDirection): string[] {
  return ['lh-steps', `lh-steps--${direction}`]
}

/**
 * 计算步骤项类名
 */
export function getStepClassNames(state: LhStepClassState): string[] {
  return [
    'lh-steps__item',
    `lh-steps__item--${state.status}`,
    state.isLast && 'lh-steps__item--last',
    state.clickable && 'lh-steps__item--clickable',
  ].filter(Boolean) as string[]
}
