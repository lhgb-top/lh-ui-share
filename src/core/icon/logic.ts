/**
 * Icon 纯函数逻辑（无框架依赖）
 */

import type { LhIconState } from './types'
import { LH_ICON_SVGS_CONST, type LhIconName } from './svgs'
import { getDecorativeAria } from '../shared/a11y'
import type { LhAriaAttrs } from '../shared/a11y'

/**
 * 获取图标尺寸（返回数值，不含单位，用于 SVG width/height）
 */
export function getIconSize(size: string | number | undefined): number {
  if (!size) return 16
  if (typeof size === 'number') return size
  
  const sizeMap: Record<string, number> = {
    mini: 12,
    small: 14,
    medium: 16,
    large: 20,
    'x-large': 24,
  }
  return sizeMap[size] ?? 16
}

/**
 * 获取 SVG path 数据
 */
export function getIconSvg(name: LhIconName | undefined): string | null {
  if (!name) return null
  return LH_ICON_SVGS_CONST[name] || null
}

/**
 * 获取图标内联样式（SVG 使用 width/height）
 */
export function getIconStyle(state: LhIconState): Record<string, string> {
  const style: Record<string, string> = {}
  const size = getIconSize(state.size)
  style.width = `${size}px`
  style.height = `${size}px`
  if (state.color) {
    style.color = state.color
  }
  return style
}
/**
 * 图标的无障碍属性包：
 * - 纯装饰图标（默认）输出 aria-hidden，避免读屏播报无意义的图形
 * - 独立承载语义的图标传 decorative=false 并提供 aria-label
 *
 * 与文字并排的图标应保持装饰态（文字已提供可达名称，图标重复播报是噪声）。
 */
export function getIconAria(options: { decorative?: boolean; label?: string } = {}): LhAriaAttrs {
  const { decorative = true, label } = options
  if (decorative) return getDecorativeAria(true)
  return label ? { 'aria-label': label, role: 'img' } : {}
}
