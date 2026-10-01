/**
 * Icon 纯类型定义（无框架依赖）
 */

import type { LhIconName } from './svgs'

export interface LhIconState {
  size: string | number | undefined
  color: string | undefined
  name?: LhIconName
}