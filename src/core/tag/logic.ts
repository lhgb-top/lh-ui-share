import type { LhTagState } from './types'

export function getTagClassNames(state: LhTagState): string[] {
  const classes = ['lh-tag']
  if (state.type) classes.push(`lh-tag--${state.type}`)
  if (state.size) classes.push(`lh-tag--${state.size}`)
  if (state.closable) classes.push('lh-tag--closable')
  if (state.disabled) classes.push('lh-tag--disabled')
  if (state.round) classes.push('lh-tag--round')
  if (state.hit) classes.push('lh-tag--hit')
  return classes
}