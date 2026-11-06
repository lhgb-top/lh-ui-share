import type { LhAriaAttrs } from '../shared/a11y'
import type { LhLinkAriaInput, LhLinkState, LhLinkType, LhLinkUnderline } from './types'

/**
 * Link 组件纯函数（框架无关）
 *
 * 渲染规则与 lh-ui-plus 的 link 模板一一对应：
 * a.lh-link[aria-disabled] > 内容 + 可选前后图标位
 */

/** 合法类型白名单：用于注入修饰类前的校验，非法值降级为 default */
const VALID_TYPES: readonly LhLinkType[] = [
  'default',
  'primary',
  'success',
  'warning',
  'danger',
  'info',
]

/** 合法下划线形态白名单 */
const VALID_UNDERLINES: readonly LhLinkUnderline[] = ['always', 'hover', 'none']

function normalizeType(type: LhLinkType | undefined): LhLinkType {
  return type && VALID_TYPES.includes(type) ? type : 'default'
}

function normalizeUnderline(underline: LhLinkUnderline | undefined): LhLinkUnderline {
  return underline && VALID_UNDERLINES.includes(underline) ? underline : 'hover'
}

/**
 * Link 类名列表（BEM）
 *
 * - 基类恒为 lh-link
 * - 类型修饰类仅非 default 时输出（default 走令牌常规色，无额外类）
 * - 下划线修饰类仅非 hover 默认时输出（hover 是全局默认形态）
 * - 禁用恒输出 lh-link--disabled（样式侧禁用.hover 态）
 */
export function getLinkClassNames(state: Partial<LhLinkState> = {}): string[] {
  const type = normalizeType(state.type)
  const underline = normalizeUnderline(state.underline)
  const disabled = !!state.disabled

  const classes = ['lh-link']
  if (type !== 'default') classes.push(`lh-link--${type}`)
  if (underline !== 'hover') classes.push(`lh-link--underline-${underline}`)
  if (disabled) classes.push('lh-link--disabled')
  return classes
}

/**
 * Link 无障碍属性包
 *
 * - 禁用时不输出 href 语义由 UI 层负责（渲染为 span 或省略 href），此处给出
 *   aria-disabled 与移除交互语义的 role="link" 组合：读屏仍播报「链接」，
 *   但明确不可用，避免 role=text 丢失可点击语义
 * - current 有值时输出 aria-current（面包屑当前页等场景）
 */
export function getLinkAria(input: LhLinkAriaInput): LhAriaAttrs {
  const attrs: LhAriaAttrs = {}
  if (input.disabled) {
    attrs['aria-disabled'] = true
    attrs.role = 'link'
  }
  if (input.current) {
    attrs['aria-current'] = input.current
  }
  return attrs
}
