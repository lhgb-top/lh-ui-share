/**
 * Button 组件纯类型定义（无框架依赖）
 */

import type { LhComponentSize, LhComponentType } from '../shared/types'

export interface LhButtonState {
  type: LhComponentType
  size: LhComponentSize
  loading: boolean
  disabled: boolean
  plain: boolean
  block: boolean
  round: boolean
  circle: boolean
}
