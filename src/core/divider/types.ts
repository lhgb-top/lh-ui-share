/** 分割线方向 */
export type LhDividerDirection = 'horizontal' | 'vertical'

/** 带文案时的对齐位置 */
export type LhDividerLabelPosition = 'left' | 'center' | 'right'

/** 分割线状态（类名计算入参） */
export interface LhDividerState {
  direction: LhDividerDirection
  dashed: boolean
  hasContent: boolean
  labelPosition: LhDividerLabelPosition
  /** 边框样式（显式指定时优先于 dashed） */
  borderStyle?: string
}

/** 语义角色：带文案的是真分割符，纯装饰的不进无障碍树 */
export type LhDividerRole = 'separator' | 'presentation'
