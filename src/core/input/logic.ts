/**
 * Input 纯函数逻辑（无框架依赖）
 */

import type { LhInputState } from './types'
import type { LhAriaAttrs } from '../shared/a11y'

export function getWordCount(state: Pick<LhInputState, 'value' | 'maxlength'>): string {
  // value 可能在 react/uni 挂载前为 undefined，兜底按空串处理
  const count = state.value?.length ?? 0
  return `${count}/${state.maxlength ?? '∞'}`
}

export function shouldShowWordLimit(state: Pick<LhInputState, 'maxlength' | 'minlength'>): boolean {
  return state.maxlength !== undefined || state.minlength !== undefined
}

export function clampString(value: string, maxlength?: number): string {
  if (maxlength !== undefined && value.length > maxlength) {
    return value.slice(0, maxlength)
  }
  return value
}

export function getInputStyle(size: string): Record<string, string> {
  const map: Record<string, Record<string, string>> = {
    mini: { padding: '4px 8px', fontSize: '12px' },
    small: { padding: '6px 10px', fontSize: '12px' },
    medium: { padding: '8px 12px', fontSize: '14px' },
    large: { padding: '12px 16px', fontSize: '16px' },
  }
  return map[size] || map.medium
}
/**
 * 输入框的无障碍属性包：把 label / 错误提示 / 必填语义挂到控件上
 *
 * - aria-label：无可见 label 时提供可达名称
 * - aria-describedby：关联错误提示或字数统计元素
 * - aria-invalid：校验失败（form-item 校验出错时由 UI 层透传）
 *
 * @param label 可达名称（有可见 label 时应改用 aria-labelledby，不传本字段）
 * @param describedby 描述元素 id（错误提示 / 字数统计）
 * @param invalid 是否校验失败
 * @param required 是否必填
 */
export function getInputAria(options: {
  label?: string
  describedby?: string
  invalid?: boolean
  required?: boolean
}): LhAriaAttrs {
  const { label, describedby, invalid, required } = options
  const attrs: LhAriaAttrs = {}
  if (label) attrs['aria-label'] = label
  if (describedby) attrs['aria-describedby'] = describedby
  if (invalid) attrs['aria-invalid'] = true
  if (required) attrs['aria-required'] = true
  return attrs
}
