import type { LhSkeletonState, LhSkeletonVariant } from './types'
import type { LhAriaAttrs } from '../shared/a11y'
import { getDecorativeAria } from '../shared/a11y'

/**
 * 计算骨架占位块类名
 */
export function getSkeletonItemClassNames(variant: LhSkeletonVariant, animated: boolean): string[] {
  const classes = ['lh-skeleton-item', `lh-skeleton-item--${variant}`]
  if (animated) classes.push('lh-skeleton-item--animated')
  return classes
}

/**
 * 计算骨架屏容器类名
 */
export function getSkeletonClassNames(state: LhSkeletonState): string[] {
  const classes = ['lh-skeleton']
  if (state.animated) classes.push('lh-skeleton--animated')
  if (state.avatar) classes.push('lh-skeleton--with-avatar')
  return classes
}

/**
 * 生成文本行宽度序列（末行缩短，模拟真实段落）
 */
export function getSkeletonRowWidths(rows: number): string[] {
  const widths: string[] = []
  for (let i = 0; i < Math.max(0, rows); i++) {
    widths.push(i === Math.max(0, rows) - 1 && rows > 1 ? '60%' : '100%')
  }
  return widths
}

/**
 * 骨架屏的无障碍属性包：占位内容无信息量，对辅助技术隐藏
 *
 * UI 层应同时用 aria-busy="true" 标记正在加载的区域，
 * 让读屏软件在数据就绪后重新播报真实内容。
 */
export function getSkeletonAria(): LhAriaAttrs {
  return getDecorativeAria(true)
}
