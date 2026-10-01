export type LhProgressType = 'line' | 'circle'
export type LhProgressStatus = 'normal' | 'success' | 'warning' | 'exception'

export interface LhProgressState {
  type: LhProgressType
  status: LhProgressStatus
  /** 是否展示文字 */
  showText: boolean
  /** 线条宽度（line 为高度 px，circle 为 SVG stroke 宽度） */
  strokeWidth: number
  /** 圆形进度圈画布宽度 px */
  width: number
}
