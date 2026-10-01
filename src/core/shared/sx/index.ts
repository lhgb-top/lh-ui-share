/**
 * sx - Style X 工具函数
 * 将 Tailwind CSS 风格的 sx 属性转换为内联样式
 */

export interface SxProps {
  w?: string | number
  h?: string | number
  mt?: number
  mr?: number
  mb?: number
  ml?: number
  my?: number
  mx?: number
  m?: number
  pt?: number
  pr?: number
  pb?: number
  pl?: number
  py?: number
  px?: number
  p?: number
  display?: string
  flex?: string
  flexDirection?: 'row' | 'column'
  alignItems?: string
  justifyContent?: string
  [key: string]: any
}

/**
 * 将数字间距转换为像素值
 */
function spacingToPx(value: number): string {
  return `${value * 8}px`
}

/**
 * 将 sx 属性转换为内联样式对象
 */
export function sxToStyle(sx: SxProps): Record<string, string> {
  if (!sx) return {}
  const style: Record<string, string> = {}
  
  // Dimensions
  if (sx.w !== undefined) {
    style.width = typeof sx.w === 'number' ? `${sx.w}px` : sx.w
  }
  if (sx.h !== undefined) {
    style.height = typeof sx.h === 'number' ? `${sx.h}px` : sx.h
  }
  
  // Margin
  if (sx.mt !== undefined) style.marginTop = spacingToPx(sx.mt)
  if (sx.mr !== undefined) style.marginRight = spacingToPx(sx.mr)
  if (sx.mb !== undefined) style.marginBottom = spacingToPx(sx.mb)
  if (sx.ml !== undefined) style.marginLeft = spacingToPx(sx.ml)
  if (sx.my !== undefined) {
    style.marginTop = spacingToPx(sx.my)
    style.marginBottom = spacingToPx(sx.my)
  }
  if (sx.mx !== undefined) {
    style.marginLeft = spacingToPx(sx.mx)
    style.marginRight = spacingToPx(sx.mx)
  }
  if (sx.m !== undefined) {
    style.margin = spacingToPx(sx.m)
  }
  
  // Padding
  if (sx.pt !== undefined) style.paddingTop = spacingToPx(sx.pt)
  if (sx.pr !== undefined) style.paddingRight = spacingToPx(sx.pr)
  if (sx.pb !== undefined) style.paddingBottom = spacingToPx(sx.pb)
  if (sx.pl !== undefined) style.paddingLeft = spacingToPx(sx.pl)
  if (sx.py !== undefined) {
    style.paddingTop = spacingToPx(sx.py)
    style.paddingBottom = spacingToPx(sx.py)
  }
  if (sx.px !== undefined) {
    style.paddingLeft = spacingToPx(sx.px)
    style.paddingRight = spacingToPx(sx.px)
  }
  if (sx.p !== undefined) {
    style.padding = spacingToPx(sx.p)
  }
  
  // Display
  if (sx.display) style.display = sx.display
  if (sx.flex) style.flex = sx.flex
  if (sx.flexDirection) style.flexDirection = sx.flexDirection
  if (sx.alignItems) style.alignItems = sx.alignItems
  if (sx.justifyContent) style.justifyContent = sx.justifyContent
  
  return style
}