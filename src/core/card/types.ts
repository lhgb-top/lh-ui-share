/** 卡片阴影显示时机 */
export type LhCardShadow = 'always' | 'hover' | 'never'

/** 卡片状态（类名计算入参） */
export interface LhCardState {
  shadow: LhCardShadow
  clickable: boolean
  loading: boolean
}

/** 计算整卡是否可交互（用于键盘语义） */
export type LhCardInteractivity = 'interactive' | 'static'
