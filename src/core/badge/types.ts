import type { LhComponentSize } from '../shared/types'

export type LhBadgeType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'

export interface LhBadgeState {
  type: LhBadgeType
  size: LhComponentSize
  isHidden: boolean
  isDot: boolean
  isZero: boolean
}