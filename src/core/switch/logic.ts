import type { LhSwitchState } from './types'
import type { LhAriaAttrs } from '../shared/a11y'

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
/**
 * 开关的无障碍属性包：role="switch" + aria-checked，禁用 / 加载时输出 aria-disabled
 *
 * UI 层把本属性包落到开关根元素（非原生 input 的自定义控件场景必需），
 * 可达名称由 aria-label 或内联文字提供。
 */
export function getSwitchAria(state: Pick<LhSwitchState, 'checked' | 'disabled' | 'loading'>): LhAriaAttrs {
  const attrs: LhAriaAttrs = { role: 'switch', 'aria-checked': state.checked }
  if (state.disabled || state.loading) attrs['aria-disabled'] = true
  return attrs
}
