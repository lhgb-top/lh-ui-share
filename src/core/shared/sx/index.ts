/**
 * sx - Style X 工具函数
 * 将 Tailwind CSS 风格的 sx 属性转换为内联样式
 */

export interface SxProps {
  w?: string | number
  h?: string | number
  mt?: string | number
  mr?: string | number
  mb?: string | number
  ml?: string | number
  my?: string | number
  mx?: string | number
  m?: string | number
  pt?: string | number
  pr?: string | number
  pb?: string | number
  pl?: string | number
  py?: string | number
  px?: string | number
  p?: string | number
  display?: string
  flex?: string
  flexDirection?: 'row' | 'column'
  alignItems?: string
  justifyContent?: string
  // 保留 index signature 以兼容下游用户传入的自定义键；
  // 注意：未知键会被静默丢弃，已识别的键以文档列出的为准
  [key: string]: any
}

/**
 * 将间距值转换为像素值：数值 ×8px，字符串（如 '50%'、'1rem'）原样透传
 */
function spacingToPx(value: string | number): string {
  return typeof value === 'number' ? `${value * 8}px` : value
}

/**
 * 将 sx 属性转换为内联样式对象
 *
 * 优先级固定为「单边 > 轴组 > 简写」且与键序无关：
 * `{ mt: 4, m: 2 }` 与 `{ m: 2, mt: 4 }` 都得到 marginTop: 32px。
 * 实现上按 简写 → 轴组 → 单边 的顺序写入，后写的键覆盖先写的。
 * 所有键统一按 !== undefined 判定（传空串视为显式清空）。
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

  // Margin：先简写，再轴组，最后单边
  if (sx.m !== undefined) style.margin = spacingToPx(sx.m)
  if (sx.my !== undefined) {
    style.marginTop = spacingToPx(sx.my)
    style.marginBottom = spacingToPx(sx.my)
  }
  if (sx.mx !== undefined) {
    style.marginLeft = spacingToPx(sx.mx)
    style.marginRight = spacingToPx(sx.mx)
  }
  if (sx.mt !== undefined) style.marginTop = spacingToPx(sx.mt)
  if (sx.mr !== undefined) style.marginRight = spacingToPx(sx.mr)
  if (sx.mb !== undefined) style.marginBottom = spacingToPx(sx.mb)
  if (sx.ml !== undefined) style.marginLeft = spacingToPx(sx.ml)

  // Padding：与 Margin 同序
  if (sx.p !== undefined) style.padding = spacingToPx(sx.p)
  if (sx.py !== undefined) {
    style.paddingTop = spacingToPx(sx.py)
    style.paddingBottom = spacingToPx(sx.py)
  }
  if (sx.px !== undefined) {
    style.paddingLeft = spacingToPx(sx.px)
    style.paddingRight = spacingToPx(sx.px)
  }
  if (sx.pt !== undefined) style.paddingTop = spacingToPx(sx.pt)
  if (sx.pr !== undefined) style.paddingRight = spacingToPx(sx.pr)
  if (sx.pb !== undefined) style.paddingBottom = spacingToPx(sx.pb)
  if (sx.pl !== undefined) style.paddingLeft = spacingToPx(sx.pl)

  // Display
  if (sx.display !== undefined) style.display = sx.display
  if (sx.flex !== undefined) style.flex = sx.flex
  if (sx.flexDirection !== undefined) style.flexDirection = sx.flexDirection
  if (sx.alignItems !== undefined) style.alignItems = sx.alignItems
  if (sx.justifyContent !== undefined) style.justifyContent = sx.justifyContent

  return style
}

/**
 * 合并多个 sx（后者覆盖前者，浅合并），供 UI 层组合「默认 sx + 调用方 sx」；
 * 结果交给 sxToStyle 一次性求值，保证优先级规则只结算一次。
 */
export function mergeSx(...list: (SxProps | undefined | null)[]): SxProps {
  const merged: SxProps = {}
  for (const sx of list) {
    if (!sx) continue
    Object.assign(merged, sx)
  }
  return merged
}
