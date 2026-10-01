/** 选项值类型 */
export type LhSegmentedValue = string | number

/** 选项对象形态 */
export interface LhSegmentedOption {
  label: string
  value: LhSegmentedValue
  disabled?: boolean
}

/** 输入选项（字符串快捷写法或对象） */
export type LhSegmentedInput = LhSegmentedValue | LhSegmentedOption

/** 规范化后的选项 */
export interface LhSegmentedNormalized {
  label: string
  value: LhSegmentedValue
  disabled: boolean
}

/** 状态（类名计算入参） */
export interface LhSegmentedState {
  disabled: boolean
  block: boolean
}
