import type { LhAffixState } from './types'

/** 类名 */
export function getAffixClassNames(state: LhAffixState): string[] {
  const classes = ['lh-affix']
  if (state.fixed) classes.push('lh-affix--fixed')
  return classes
}

/**
 * 固定态判定（IntersectionObserver 回调 / getBoundingClientRect 兜底共用）：
 * 占位元素的 boundingClientRect 相对视口的越界判定。
 */
export function isAffixFixed(
  rect: { top: number; bottom: number },
  offsetTop: number,
  offsetBottom: number,
): boolean {
  if (offsetBottom > 0) {
    return rect.top > offsetBottom
  }
  return rect.top < offsetTop
}

/** 固定态的定位样式 */
export function getAffixFixedStyle(
  offsetTop: number,
  offsetBottom: number,
): Record<string, string> {
  if (offsetBottom > 0) {
    return { position: 'fixed', bottom: `${offsetBottom}px`, top: 'auto' }
  }
  return { position: 'fixed', top: `${offsetTop}px`, bottom: 'auto' }
}
