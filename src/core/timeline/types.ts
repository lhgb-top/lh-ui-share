/** 时间线布局模式 */
export type LhTimelineMode = 'left' | 'alternate'

/** 时间线节点语义类型 */
export type LhTimelineType = 'primary' | 'success' | 'warning' | 'danger'

/** 节点状态（类名计算入参） */
export interface LhTimelineItemState {
  type: LhTimelineType | undefined
  hollow: boolean
  /** alternate 模式下的左右交替侧（偶数序号 left，奇数 right） */
  side: 'left' | 'right'
  isLast: boolean
}
