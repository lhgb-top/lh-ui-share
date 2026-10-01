import type { LhEmptyState } from './types'

/** 计算空状态类名 */
export function getEmptyClassNames(state: LhEmptyState): string[] {
  const classes = ['lh-empty']
  if (state.hasImage) classes.push('lh-empty--custom-image')
  return classes
}
