import type { LhComponentSize } from '../shared/types'

export type LhTagType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'

export interface LhTagState {
  type: LhTagType
  size: LhComponentSize
  closable: boolean
  disabled: boolean
  round: boolean
  hit: boolean
}