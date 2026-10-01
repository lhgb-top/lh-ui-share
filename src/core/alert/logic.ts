import type { LhAlertRole, LhAlertState, LhAlertType } from './types'

/**
 * 计算警告类名
 */
export function getAlertClassNames(state: LhAlertState): string[] {
  const classes = ['lh-alert', `lh-alert--${state.type}`]
  if (state.closable) classes.push('lh-alert--closable')
  if (state.showIcon) classes.push('lh-alert--show-icon')
  if (state.plain) classes.push('lh-alert--plain')
  if (state.withTitle) classes.push('lh-alert--with-title')
  return classes
}

/**
 * 语义 → live region 角色映射（APG）：
 * - error/warning 性质（warning/danger）立即播报 → role="alert"
 * - 温和通知（info/success）排队播报 → role="status"
 */
export function getAlertRole(type: LhAlertType): LhAlertRole {
  return type === 'warning' || type === 'danger' ? 'alert' : 'status'
}

/**
 * 各语义对应的图标名（消费现有 LhIcon 图标集）
 */
export function getAlertIconName(type: LhAlertType): string {
  const icons: Record<LhAlertType, string> = {
    info: 'info',
    success: 'check',
    warning: 'warning',
    danger: 'error',
  }
  return icons[type]
}
