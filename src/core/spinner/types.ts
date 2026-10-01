import { LH_SIZE_CONST } from '../../constants'

/** 旋转图形尺寸 */
export type LhSpinnerSize = (typeof LH_SPINNER_SIZE_CONST)[keyof typeof LH_SPINNER_SIZE_CONST]

export const LH_SPINNER_SIZE_CONST = {
  ...LH_SIZE_CONST,
} as const

/** 尺寸 → 直径 px 映射 */
export const LH_SPINNER_SIZE_PX: Record<LhSpinnerSize, number> = {
  small: 16,
  medium: 24,
  large: 32,
  mini: 12,
  'x-large': 40,
}
