/** 颜色输出格式 */
export type LhColorFormat = 'hex' | 'rgb'

/** RGBA 颜色（r/g/b 为 0~255 整数，a 为 0~1） */
export interface LhColorRgb {
  r: number
  g: number
  b: number
  a: number
}

/** HSVA 颜色（h 为 0~360，s/v/a 为 0~1） */
export interface LhColorHsv {
  h: number
  s: number
  v: number
  a: number
}

/** 颜色选择器状态（类名计算入参） */
export interface LhColorPickerState {
  /** 尺寸 */
  size?: string
  /** 禁用 */
  disabled?: boolean
  /** 已打开面板 */
  open?: boolean
}
