import type { LhBadgeState } from './types'

export function getBadgeClassNames(state: LhBadgeState): string[] {
  const classes = ['lh-badge']
  if (state.type) classes.push(`lh-badge--${state.type}`)
  if (state.size) classes.push(`lh-badge--${state.size}`)
  if (state.isHidden) classes.push('lh-badge--hidden')
  if (state.isDot) classes.push('lh-badge--dot')
  if (state.isZero) classes.push('lh-badge--zero')
  return classes
}