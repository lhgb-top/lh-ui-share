import type { LhDividerRole, LhDividerState } from './types'

/**
 * 计算分割线类名
 */
export function getDividerClassNames(state: LhDividerState): string[] {
  const classes = ['lh-divider']
  classes.push(`lh-divider--${state.direction}`)
  if (state.dashed) classes.push('lh-divider--dashed')
  if (state.hasContent) {
    classes.push('lh-divider--with-text')
    classes.push(`lh-divider--label-${state.labelPosition}`)
  }
  return classes
}

/**
 * 计算无障碍角色：
 * - 带文案：真实的分组语义分隔符（可被屏幕阅读器感知）
 * - 无文案：纯装饰，role="presentation" 移出无障碍树
 */
export function getDividerRole(hasContent: boolean): LhDividerRole {
  return hasContent ? 'separator' : 'presentation'
}

/**
 * 垂直方向是否需要向屏幕阅读器声明方向
 * （水平为默认方向无需声明；presentation 亦无需）
 */
export function needsAriaOrientation(direction: 'horizontal' | 'vertical', hasContent: boolean): boolean {
  return hasContent && direction === 'vertical'
}
