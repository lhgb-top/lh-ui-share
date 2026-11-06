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
 * 中英文均取首字，如「水墨」→「水」、「Alice」→「A」；
 * emoji 等增补平面字符按码点提取（charAt 只能取到半个代理对）
 */
export function getAvatarText(source: string): string {
  const trimmed = source.trim()
  if (!trimmed) return ''
  const codePoint = trimmed.codePointAt(0)
  return codePoint === undefined ? '' : String.fromCodePoint(codePoint)
}

/**
 * 判断头像图片来源是否可用（空串或非图片资源视为不可用，走文字/图标兜底）
 *
 * 支持：http(s) / data: URI / 绝对路径 / `.`、`..` 开头的相对路径 /
 * 裸相对文件名（`me.png`，HTML 中合法）/ 带查询参数或锚点的上述形态。
 */
export function isImageSource(src: string | undefined): boolean {
  if (!src) return false
  // 前缀形态：协议 / data URI / 绝对路径 / ./ ../ 前缀
  if (/^(https?:\/\/|data:image\/|\/|\.{0,2}\/)/.test(src)) return true
  // 裸相对文件名：以图片扩展名结尾（允许尾随 ?query 或 #fragment）
  return /\.(png|jpe?g|gif|webp|svg|bmp|ico|avif)(?:[?#].*)?$/i.test(src)
}
