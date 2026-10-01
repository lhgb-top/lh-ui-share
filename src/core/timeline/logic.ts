import type { LhTimelineItemState, LhTimelineMode } from './types'

/** 节点类名 */
export function getTimelineItemClassNames(state: LhTimelineItemState): string[] {
  const classes = ['lh-timeline__item']
  if (state.type) classes.push(`lh-timeline__item--${state.type}`)
  if (state.hollow) classes.push('lh-timeline__item--hollow')
  if (state.side === 'right') classes.push('lh-timeline__item--right')
  if (state.isLast) classes.push('lh-timeline__item--last')
  return classes
}

/** 时间线容器类名 */
export function getTimelineClassNames(mode: LhTimelineMode): string[] {
  const classes = ['lh-timeline']
  if (mode === 'alternate') classes.push('lh-timeline--alternate')
  return classes
}

/** alternate 模式下第 index 项所在侧（0 起偶数在左，奇数在右） */
export function getTimelineSide(index: number): 'left' | 'right' {
  return index % 2 === 0 ? 'left' : 'right'
}
