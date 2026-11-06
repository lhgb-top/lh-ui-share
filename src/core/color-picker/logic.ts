import { clamp, sanitizeNumber } from '../shared/sanitize'
import type { LhColorFormat, LhColorHsv, LhColorPickerState, LhColorRgb } from './types'

/** 合法输出格式集 */
export const LH_COLOR_FORMAT_CONST: readonly LhColorFormat[] = ['hex', 'rgb']

/** 格式合法性守卫 */
export function isValidColorFormat(format: string): format is LhColorFormat {
  return (LH_COLOR_FORMAT_CONST as readonly string[]).includes(format)
}

/** 通道（r/g/b）钳制：0~255 整数 */
export function clampColorChannel(value: number | undefined): number {
  return sanitizeNumber(value, 0, { min: 0, max: 255, integer: true })
}

/** 透明度钳制：0~1，保留两位小数避免浮点尾巴 */
export function clampColorAlpha(value: number | undefined): number {
  if (value === undefined || value === null || !Number.isFinite(value)) return 1
  return Math.round(clamp(value, 0, 1) * 100) / 100
}

/** 色相钳制：0~360 */
export function clampColorHue(value: number | undefined): number {
  return sanitizeNumber(value, 0, { min: 0, max: 360, integer: true })
}

/** 饱和度 / 明度钳制：0~1 */
export function clampColorRatio(value: number | undefined): number {
  if (value === undefined || value === null || !Number.isFinite(value)) return 0
  return Math.round(clamp(value, 0, 1) * 100) / 100
}

/** 两位十六进制（0~255 → '00'~'ff'） */
function toHex2(value: number): string {
  return clampColorChannel(value).toString(16).padStart(2, '0')
}

/** 一位十六进制 → 两位（'#3' → '33'），支持 3/4/6/8 位 hex */
function expandHex(hex: string): string {
  return hex
    .split('')
    .map((char) => char + char)
    .join('')
}

/**
 * 解析十六进制字符串（可带 '#')。
 *
 * 支持 #rgb / #rgba / #rrggbb / #rrggbbaa；非法输入返回 null。
 */
export function hexToRgb(hex: string): LhColorRgb | null {
  let value = String(hex).trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]+$/.test(value)) return null
  if (value.length === 3 || value.length === 4) {
    value = expandHex(value)
  }
  if (value.length !== 6 && value.length !== 8) return null
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  const a = value.length === 8 ? parseInt(value.slice(6, 8), 16) / 255 : 1
  return { r, g, b, a: clampColorAlpha(a) }
}

/** RGBA → 格式化 hex；a < 1 时输出 8 位 hex（#rrggbbaa） */
export function rgbToHex(color: LhColorRgb): string {
  const a = clampColorAlpha(color.a)
  const hex = `#${toHex2(color.r)}${toHex2(color.g)}${toHex2(color.b)}`
  return a < 1 ? `${hex}${toHex2(a * 255)}` : hex
}

/** RGB → HSV（色相 0~360，s/v 0~1） */
export function rgbToHsv(color: LhColorRgb): LhColorHsv {
  const r = clampColorChannel(color.r) / 255
  const g = clampColorChannel(color.g) / 255
  const b = clampColorChannel(color.b) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  let h = 0
  if (delta !== 0) {
    if (max === r) {
      h = (((g - b) / delta) % 6) * 60
    } else if (max === g) {
      h = ((b - r) / delta + 2) * 60
    } else {
      h = ((r - g) / delta + 4) * 60
    }
    if (h < 0) h += 360
  }
  const s = max === 0 ? 0 : delta / max
  return {
    h: clampColorHue(Math.round(h)),
    s: clampColorRatio(s),
    v: clampColorRatio(max),
    a: clampColorAlpha(color.a),
  }
}

/** HSV → RGB */
export function hsvToRgb(color: LhColorHsv): LhColorRgb {
  const h = clampColorHue(color.h)
  const s = clampColorRatio(color.s)
  const v = clampColorRatio(color.v)
  const c = v * s
  const hPrime = h / 60
  const x = c * (1 - Math.abs((hPrime % 2) - 1))
  const m = v - c
  let r = 0
  let g = 0
  let b = 0
  if (hPrime < 1) {
    r = c
    g = x
  } else if (hPrime < 2) {
    r = x
    g = c
  } else if (hPrime < 3) {
    g = c
    b = x
  } else if (hPrime < 4) {
    g = x
    b = c
  } else if (hPrime < 5) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }
  return {
    r: clampColorChannel(Math.round((r + m) * 255)),
    g: clampColorChannel(Math.round((g + m) * 255)),
    b: clampColorChannel(Math.round((b + m) * 255)),
    a: clampColorAlpha(color.a),
  }
}

const RGB_FUNC_RE = /^rgba?\(\s*([^)]+?)\s*\)$/i

/**
 * 解析任意字符串颜色：hex 或 rgb()/rgba()。
 *
 * rgb() 允许小数与百分数通道（CSS Color 4 之前的宽容形态），非法输入返回 null。
 */
export function parseColorString(input: string | undefined): LhColorRgb | null {
  if (!input) return null
  const value = String(input).trim()
  if (value.startsWith('#')) return hexToRgb(value)
  const match = value.match(RGB_FUNC_RE)
  if (!match) return null
  const parts = match[1].split(',').map((part) => part.trim())
  if (parts.length < 3 || parts.length > 4) return null
  const toChannel = (part: string): number | null => {
    if (part.endsWith('%')) {
      const pct = Number(part.slice(0, -1))
      return Number.isFinite(pct) ? (pct / 100) * 255 : null
    }
    const num = Number(part)
    return Number.isFinite(num) ? num : null
  }
  const r = toChannel(parts[0])
  const g = toChannel(parts[1])
  const b = toChannel(parts[2])
  if (r === null || g === null || b === null) return null
  const a = parts.length === 3 ? 1 : clampColorAlpha(Number(parts[3]))
  return {
    r: clampColorChannel(r),
    g: clampColorChannel(g),
    b: clampColorChannel(b),
    a,
  }
}

/** 按 format 输出颜色字符串（hex 格式 a<1 时输出 8 位 hex） */
export function formatColor(color: LhColorRgb, format: LhColorFormat): string {
  const r = clampColorChannel(color.r)
  const g = clampColorChannel(color.g)
  const b = clampColorChannel(color.b)
  const a = clampColorAlpha(color.a)
  if (format === 'rgb') {
    return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`
  }
  return rgbToHex({ r, g, b, a })
}

/** 两个 RGBA 是否感知相等（通道与 alpha 都钳制后比较） */
export function isSameColor(left: LhColorRgb, right: LhColorRgb): boolean {
  return (
    clampColorChannel(left.r) === clampColorChannel(right.r) &&
    clampColorChannel(left.g) === clampColorChannel(right.g) &&
    clampColorChannel(left.b) === clampColorChannel(right.b) &&
    clampColorAlpha(left.a) === clampColorAlpha(right.a)
  )
}

/** 颜色选择器容器类名 */
export function getColorPickerClassNames(state: LhColorPickerState): string[] {
  const classes = ['lh-color-picker']
  if (state.size) classes.push(`lh-color-picker--${state.size}`)
  if (state.disabled) classes.push('lh-color-picker--disabled')
  if (state.open) classes.push('lh-color-picker--open')
  return classes
}
