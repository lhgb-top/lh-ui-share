/** 穿梭框数据项 */
export interface LhTransferItem {
  /** 唯一键 */
  key: string | number
  /** 显示文本 */
  label: string
  /** 禁用（不可移动） */
  disabled?: boolean
}

/** 面板侧别 */
export type LhTransferSide = 'left' | 'right'
