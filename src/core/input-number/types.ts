/**
 * InputNumber 组件纯类型定义（无框架依赖）
 */

import type { LhComponentSize } from '../shared/types'

export interface LhInputNumberState {
  value: number | null
  min: number
  max: number
  step: number
  disabled: boolean
  size: LhComponentSize
  controls: boolean
  precision: number | undefined
  placeholder: string
}