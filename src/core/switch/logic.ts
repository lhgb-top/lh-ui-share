import type { LhSwitchState } from './types'

export function getSwitchClassNames(state: LhSwitchState): string[] {
  const classes = ['lh-switch']
  if (state.checked) classes.push('lh-switch--checked')
  if (state.disabled) classes.push('lh-switch--disabled')
  if (state.loading) classes.push('lh-switch--loading')
  if (state.size) classes.push(`lh-switch--${state.size}`)
  return classes
}

export function getSwitchLabel(state: LhSwitchState): string {
  return state.checked ? state.activeText : state.inactiveText
}