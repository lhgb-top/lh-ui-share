import type { LhProgressState, LhProgressStatus } from './types'
import type { LhAriaAttrs } from '../shared/a11y'

/**
 * 将任意数值钳制到 [0, 100]
 */
export function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.min(100, Math.max(0, value))
}

/**
 * 依据 value 推导状态：达到 100 自动视为 success
 */
export function resolveStatus(value: number, status: LhProgressStatus): LhProgressStatus {
  if (status !== 'normal') return status
  return value >= 100 ? 'success' : 'normal'
}

/**
 * 生成 Progress 的 class 列表
 */
export function getProgressClassNames(state: LhProgressState): string[] {
  const classes = ['lh-progress', `lh-progress--${state.type}`]
  if (state.status !== 'normal') classes.push(`lh-progress--${state.status}`)
  if (!state.showText) classes.push('lh-progress--no-text')
  return classes
}

/**
 * 圆形进度的周长（用于 stroke-dasharray 计算）
 */
export function getCircleCircumference(width: number, strokeWidth: number): number {
  const radius = (width - strokeWidth) / 2
  return 2 * Math.PI * radius
}

/**
 * 计算状态对应的进度条颜色
 * 优先使用用户传入 color（函数或字符串），否则按状态取主题 token
 */
export function getProgressColor(
  status: LhProgressStatus,
  color?: string | ((percentage: number) => string),
  percentage = 0
): string {
  if (typeof color === 'function') return color(percentage)
  if (typeof color === 'string' && color) return color
  switch (status) {
    case 'success':
      return 'var(--lh-success-color)'
    case 'warning':
      return 'var(--lh-warning-color)'
    case 'exception':
      return 'var(--lh-danger-color)'
    default:
      return 'var(--lh-primary-color)'
  }
}

/**
 * 默认文字格式化：百分比取整
 */
export function formatPercentText(percentage: number): string {
  return `${Math.round(percentage)}%`
}

/**
 * 进度条的无障碍属性包：role="progressbar" + 值域语义
 *
 * @param percentage 百分比（0-100）
 * @param label 可达名称（如「上传进度」），无可见文字时必需
 */
export function getProgressAria(options: {
  percentage: number
  label?: string
}): LhAriaAttrs {
  const { percentage, label } = options
  const attrs: LhAriaAttrs = {
    role: 'progressbar',
    'aria-valuenow': percentage,
    'aria-valuemin': 0,
    'aria-valuemax': 100,
  }
  if (label) attrs['aria-label'] = label
  return attrs
}
