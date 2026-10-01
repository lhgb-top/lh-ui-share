import type { LhRadioState } from './types'

export function isRadioChecked(state: LhRadioState): boolean {
  return Object.is(state.modelValue, state.value)
}

export function getRadioClassNames(type: string): string[] {
  const classes = ['lh-radio']
  if (type) classes.push(`lh-radio--${type}`)
  return classes
}