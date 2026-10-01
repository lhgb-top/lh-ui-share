import type { LhSpaceSizeInput, LhSpaceState } from './types'

/**
 * 计算间距容器类名
 */
export function getSpaceClassNames(state: LhSpaceState): string[] {
  const classes = ['lh-space']
  classes.push(`lh-space--${state.direction}`)
  if (state.wrap) classes.push('lh-space--wrap')
  if (state.size === 'small' || state.size === 'medium' || state.size === 'large') {
    classes.push(`lh-space--${state.size}`)
  }
  return classes
}

/**
 * 把 size 归一化为 CSS gap 值（水平与垂直两轴）
 *
 * 预设档位映射 spacing token 变量；数字视为 px；数组分别控制水平/垂直。
 * 混合预设与数字（如 ['medium', 8]）不支持——保持类型简单。
 */
export function resolveSpaceGaps(size: LhSpaceSizeInput): {
  columnGap: string
  rowGap: string
  usesTokens: boolean
} {
  if (size === 'small' || size === 'medium' || size === 'large') {
    const token =
      size === 'small'
        ? 'var(--lh-spacing-small, 8px)'
        : size === 'large'
          ? 'var(--lh-spacing-large, 24px)'
          : 'var(--lh-spacing-medium, 16px)'
    return { columnGap: token, rowGap: token, usesTokens: true }
  }

  if (typeof size === 'number') {
    return { columnGap: `${size}px`, rowGap: `${size}px`, usesTokens: false }
  }

  const [h, v] = size
  return { columnGap: `${h}px`, rowGap: `${v}px`, usesTokens: false }
}

/**
 * 计算对齐的 CSS align-items 值
 * baseline 原样输出，其余映射到 flex 关键字
 */
export function resolveSpaceAlignment(alignment: string): string {
  return alignment
}
