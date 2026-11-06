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

/**
 * @deprecated 尺寸映射已迁至 SCSS 令牌体系（`.lh-input--<size>` 类带
 * `--lh-control-height-*` 高度令牌 + `--lh-font-size-*` 字号令牌，见
 * `styles/input/index.scss`）。此函数仅为存量消费方（uni 系端内联样式）保留，
 * 新代码不要再调用——JS 内联字面量会覆盖 CSS 类，令主题覆盖失效。
 */
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

/**
 * 判断 value 是否为"有值"：undefined / null 与空串一律视为无值。
 * react / uni 挂载前 state.value 可能是 undefined（getWordCount 已有 ?? 0 兜底，
 * 见同类注释），若用 `!== ''` 会把 undefined 误判为有值，浮动标签未聚焦仍浮起。
 */
function hasInputValue(value: string | undefined | null): boolean {
  return value != null && value !== ''
}

/**
 * float 位置是否处于浮起态：聚焦或有值（与 Material 3 floating label 交互一致：
 * 有值后不回落，失焦仍停在顶部缺口）
 */
export function isInputLabelFloating(
  state: Pick<LhInputState, 'value' | 'isFocused'>,
): boolean {
  return state.isFocused || hasInputValue(state.value)
}

/**
 * label 元素类名。
 *
 * 仅 float 位置在浮起态追加 `--float` 修饰（缩小上浮）；top/left/right/bottom
 * 为静态位置，label 不浮动不缩放。
 */
export function getInputLabelClassNames(
  state: Pick<LhInputState, 'value' | 'isFocused' | 'labelPosition'>,
): string[] {
  const classes = ['lh-input__label']
  if (state.labelPosition === 'float' && isInputLabelFloating(state)) {
    classes.push('lh-input__label--float')
  }
  return classes
}

/**
 * wrapper 修饰类：has-label / has-value / label 位置。
 *
 * 五种位置统一发 `--label-<position>`（float 为 `--label-float`）——静态位置的
 * 布局切换走 wrapper 类，不依赖 `:has`（WXSS 无 `:has`，小程序端静态位置因此可用）。
 * `--has-value` 当前无对应样式，是预留钩子（与 plus/react 既有模板行为一致）。
 */
export function getInputWrapperModifiers(
  state: Pick<LhInputState, 'value' | 'label' | 'labelPosition'>,
): string[] {
  const classes = []
  if (state.label) classes.push('lh-input__wrapper--has-label')
  if (hasInputValue(state.value)) classes.push('lh-input__wrapper--has-value')
  classes.push(`lh-input__wrapper--label-${state.labelPosition}`)
  return classes
}
