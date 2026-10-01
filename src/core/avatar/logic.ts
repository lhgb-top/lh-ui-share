import type { LhAvatarState } from './types'

/**
 * 生成 Avatar 的 class 列表
 */
export function getAvatarClassNames(state: LhAvatarState): string[] {
  const classes = ['lh-avatar']
  if (state.size) classes.push(`lh-avatar--${state.size}`)
  if (state.shape) classes.push(`lh-avatar--${state.shape}`)
  return classes
}

/**
 * 从任意文本中提取头像展示字（取第一个字符）
 * 中英文均取首字，如「水墨」→「水」、「Alice」→「A」
 */
export function getAvatarText(source: string): string {
  const trimmed = source.trim()
  return trimmed ? trimmed.charAt(0) : ''
}

/**
 * 判断头像图片来源是否可用（空串或非图片扩展名视为不可用，走文字/图标兜底）
 */
export function isImageSource(src: string | undefined): boolean {
  if (!src) return false
  return /^(https?:\/\/|data:image\/|\/|\.{0,2}\/)/.test(src)
}
