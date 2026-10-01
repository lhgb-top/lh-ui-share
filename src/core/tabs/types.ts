/**
 * 标签页外观
 */
export type LhTabsType = 'line' | 'card'

/**
 * 标签页位置
 */
export type LhTabsPosition = 'top' | 'bottom'

/**
 * 页签记录（TabPane 注册入参）
 */
export interface LhTabRecord {
  /** 唯一标识（稳定键，不随生命周期变化） */
  name: string
  /** 页签标题 */
  label: string
  /** 是否禁用 */
  disabled: boolean
}

/**
 * 键盘导航方向
 */
export type LhTabNavDirection = 'next' | 'prev' | 'first' | 'last'
