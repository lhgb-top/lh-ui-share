import type { LhStatisticState } from './types'

/**
 * 格式化统计数值：固定精度 + 千位分隔（分隔符仅用于整数分组，小数点固定为 `.`）
 * 非有限数值原样返回 String
 */
export function formatStatisticValue(
  value: number | string,
  state: Pick<LhStatisticState, 'precision' | 'separator'>
): string {
  if (typeof value === 'number' && !Number.isFinite(value)) return String(value)

  const num = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(num)) return String(value)

  const fixed = num.toFixed(state.precision)
  if (!state.separator) return fixed

  const [int, dec] = fixed.split('.')
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, state.separator)
  return dec ? `${grouped}.${dec}` : grouped
}

/**
 * 生成 Statistic 的 class 列表
 */
export function getStatisticClassNames(prefixCls = 'lh-statistic'): string[] {
  return [prefixCls]
}
