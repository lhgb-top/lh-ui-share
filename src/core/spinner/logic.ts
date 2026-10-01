import type { LhSpinnerSize } from './types'

/** 计算旋转图形类名 */
export function getSpinnerClassNames(state: { size: LhSpinnerSize }): string[] {
  return ['lh-spinner', `lh-spinner--${state.size}`]
}
