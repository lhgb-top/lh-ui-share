/**
 * Input 组件纯类型定义（无框架依赖）
 */

import type { LhComponentSize } from '../shared/types'

/**
 * label 位置。
 *
 * - `float`：浮动标签（默认）——label 在框内作占位，聚焦或有值时浮到左上缺口
 *   缩小（Material 3 floating label 交互；参考 lh-feng-mo-android 登录输入框）
 * - `top` / `bottom`：label 静态摆在控件上方 / 下方（不浮动、不缩放）
 * - `left` / `right`：label 与控件同行内联（控件左 / 右）
 */
export type LhInputLabelPosition = 'float' | 'top' | 'left' | 'right' | 'bottom'

export interface LhInputState {
  value: string
  size: LhComponentSize
  maxlength: number | undefined
  minlength: number | undefined
  /** label 文案（空串 = 无 label） */
  label: string
  /** label 位置（默认 float） */
  labelPosition: LhInputLabelPosition
  /** 是否聚焦（float 位置浮起条件之一） */
  isFocused: boolean
}
