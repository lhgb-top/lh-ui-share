/**
 * Input 组件纯类型定义（无框架依赖）
 */

import type { LhComponentSize } from '../shared/types'

export interface LhInputState {
  value: string
  size: LhComponentSize
  maxlength: number | undefined
  minlength: number | undefined
}
