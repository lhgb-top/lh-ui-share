import type { LhComponentSize } from '../shared/types'

export type LhAvatarShape = 'circle' | 'square'

export interface LhAvatarState {
  size: LhComponentSize
  shape: LhAvatarShape
}
