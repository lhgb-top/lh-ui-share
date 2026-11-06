import type { LhAriaAttrs } from '../shared/a11y'
import type { LhTextAriaInput, LhTextLevel, LhTextState, LhTextType } from './types'

/**
 * Text 组件纯函数（框架无关）
 *
 * 渲染规则与 lh-ui-plus 的 text 模板一一对应：
 * lh-text > 文本内容，语义修饰全部落 BEM 修饰类，排版规格由令牌驱动。
 */

/** 合法级别白名单（非法值降级为 p，防御外部直传字符串） */
const VALID_LEVELS: readonly LhTextLevel[] = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'caption',
]

/** 合法语义类型白名单 */
const VALID_TYPES: readonly LhTextType[] = [
  'default',
  'secondary',
  'success',
  'warning',
  'danger',
]

/** 省略行数上限：CSS line-clamp 在超大值下会退化为不省略，超出无意义 */
const MAX_ELLIPSIS_ROWS = 10

function normalizeLevel(level: LhTextLevel | undefined): LhTextLevel {
  return level && VALID_LEVELS.includes(level) ? level : 'p'
}

function normalizeType(type: LhTextType | undefined): LhTextType {
  return type && VALID_TYPES.includes(type) ? type : 'default'
}

/**
 * 省略行数归一：ellipsis=true → 1 行（单行省略）；数值 → clamp 到 [1, 10]；
 * 非法值 → 0（不省略）
 */
export function getEllipsisRows(ellipsis: boolean | number | undefined): number {
  if (ellipsis === true) return 1
  if (typeof ellipsis === 'number' && Number.isFinite(ellipsis)) {
    if (ellipsis <= 0) return 0
    return Math.min(Math.floor(ellipsis), MAX_ELLIPSIS_ROWS)
  }
  return 0
}

/**
 * Text 类名列表（BEM）
 *
 * - 基类恒为 lh-text
 * - 级别修饰类恒输出（h1~h6 / p / caption 各自的排版规格在样式侧按令牌实现）
 * - 语义类型仅非 default 时输出
 * - 布尔修饰（strong / italic / underline / mark / code / disabled）为真时输出
 * - 省略单行输出 lh-text--ellipsis，多行输出 lh-text--ellipsis-rows（行列类供样式侧 line-clamp）
 */
export function getTextClassNames(state: Partial<LhTextState> = {}): string[] {
  const level = normalizeLevel(state.level)
  const type = normalizeType(state.type)
  const rows = getEllipsisRows(state.ellipsis)

  const classes = ['lh-text', `lh-text--${level}`]
  if (type !== 'default') classes.push(`lh-text--${type}`)
  if (state.strong) classes.push('lh-text--strong')
  if (state.italic) classes.push('lh-text--italic')
  if (state.underline) classes.push('lh-text--underline')
  if (state.mark) classes.push('lh-text--mark')
  if (state.code) classes.push('lh-text--code')
  if (state.disabled) classes.push('lh-text--disabled')
  if (rows === 1) classes.push('lh-text--ellipsis')
  else if (rows > 1) classes.push(`lh-text--ellipsis-${rows}`)
  return classes
}

/** 级别 → 实际渲染标签名（UI 层据此决定元素，caption 渲染为 span 走行内小字） */
export function getTextTag(level: LhTextLevel | undefined): 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' {
  const normalized = normalizeLevel(level)
  return normalized === 'caption' ? 'span' : normalized
}

/**
 * 多行省略的内联样式（单行省略由类名 lh-text--ellipsis 承接，无需内联）
 *
 * 框架无关的扁平样式记录：键为 CSS 属性（含 webkit 前缀驼峰），
 * UI 层按各自规范断言后下发（React 走 CSSProperties，Vue 走 style 对象）。
 * 不做行数归一以外的任何计算，非法行数返回空对象。
 */
export function getEllipsisStyle(ellipsis: boolean | number | undefined): Record<string, string | number> {
  const rows = getEllipsisRows(ellipsis)
  if (rows <= 1) return {}
  return {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: rows,
    overflow: 'hidden',
  }
}

/**
 * Text 无障碍属性包
 *
 * - expanded 有效时输出 aria-expanded（可展开的省略场景）
 * - copyButtonId 有效时输出 aria-labelledby，把复制按钮文案引入可达名称
 */
export function getTextAria(input: LhTextAriaInput = {}): LhAriaAttrs {
  const attrs: LhAriaAttrs = {}
  if (typeof input.expanded === 'boolean') attrs['aria-expanded'] = input.expanded
  if (input.copyButtonId) attrs['aria-labelledby'] = input.copyButtonId
  return attrs
}
