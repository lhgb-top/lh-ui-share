/**
 * Steps 组件纯函数逻辑（无框架依赖、无用户文案）
 */

import type { LhAriaAttrs } from '../shared/a11y'

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
 *
 * 「末项」语义由结构性 `:last-child` 承担（连接线样式直接用它），不在此输出类名：
 * 子项在各自 setup 阶段渲染，此时后续兄弟尚未注册，基于注册总数的 isLast 会让
 * 每一项在首屏（含 SSR/SSG）都被误判为末项。
 */
export function getStepClassNames(state: LhStepClassState): string[] {
  return [
    'lh-steps__item',
    `lh-steps__item--${state.status}`,
    state.clickable && 'lh-steps__item--clickable',
    state.lineLast && 'lh-steps__item--line-last',
  ].filter(Boolean) as string[]
}

/**
 * 横向步骤条定宽折行后，找出每一行的最后一项索引：
 * 相邻项的纵向偏移量不同即代表发生了折行，行末项（含全局末项）的连接线
 * 会指向行尾空白，由 UI 层据此隐藏。
 *
 * @param offsetTops 各步骤项按渲染顺序的 offsetTop
 */
export function getStepsLineLastIndices(offsetTops: number[]): number[] {
  const indices: number[] = []
  offsetTops.forEach((top, index) => {
    const nextTop = offsetTops[index + 1]
    if (nextTop === undefined || nextTop > top) indices.push(index)
  })
  return indices
}

/**
 * 步骤项的无障碍属性包：当前进行中的步骤输出 aria-current="step"
 *
 * @param status 步骤状态（process 为当前步）
 */
export function getStepAria(status: LhStepStatus): LhAriaAttrs {
  return status === 'process' ? { 'aria-current': 'step' } : {}
}
