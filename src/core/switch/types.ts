import type { LhComponentSize } from '../shared/types'

export interface LhSwitchState {
  checked: boolean
  disabled: boolean
  loading: boolean
  name: string
  size: LhComponentSize
  activeText: string
  inactiveText: string
}