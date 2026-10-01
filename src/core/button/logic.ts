/**
 * Button 组件纯函数逻辑（无框架依赖）
 */

import type { LhButtonState } from './types'

/**
 * 判断按钮是否可点击
 */
export function isClickable(state: { loading?: boolean; disabled?: boolean }): boolean {
  return !state.loading && !state.disabled
}

/**
 * 获取有效尺寸（props > ConfigProvider > 默认值）
 */
export function getSize(localSize: string | undefined, globalSize: string | undefined): string {
  return localSize || globalSize || 'medium'
}

/**
 * 计算按钮的 class 名称数组
 */
export function getClassNames(state: LhButtonState): string[] {
  return [
    'lh-button',
    `lh-button--${state.type}`,
    `lh-button--${getSize(state.size, undefined)}`,
    state.plain && 'lh-button--plain',
    state.block && 'lh-button--block',
    state.round && 'lh-button--round',
    state.circle && 'lh-button--circle',
    state.loading && 'lh-button--loading',
    state.disabled && 'lh-button--disabled',
  ].filter(Boolean) as string[]
}

/**
 * 获取按钮主题样式变量
 * CSS 变量已在 :root (var.scss) 中全局定义，
 * 无需在按钮元素上重复设置，ConfigProvider 的 themeVars 通过父级 cascade 传递
 */
export function getStyle(): Record<string, string> {
  return {}
}