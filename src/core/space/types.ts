/** 间距对齐方式 */
export type LhSpaceAlignment = 'start' | 'center' | 'end' | 'baseline'

/** 间距状态（类名计算入参） */
export interface LhSpaceState {
  direction: 'horizontal' | 'vertical'
  wrap: boolean
  size: string
}

/**
 * 归一化间距：预设档位映射 spacing token，数字视为 px
 */
export type LhSpaceSizeInput = 'small' | 'medium' | 'large' | number | [number, number]
