import type { LhSkeletonState, LhSkeletonVariant } from './types'

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
