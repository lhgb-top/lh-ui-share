import type { LhStatisticState } from './types'

/** 纯数字（可带符号与一位小数点）字符串，用于识别可按字符串处理的数值 */
const NUMERIC_STRING_RE = /^([+-]?)(\d+)(?:\.(\d+))?$/

/**
 * 十进制数字符串 +1（处理 999 → 1000 的进位），用于超大数的四舍五入
 */
function incrementDigits(digits: string): string {
  const arr = digits.split('')
  let i = arr.length - 1
  while (i >= 0 && arr[i] === '9') {
    arr[i] = '0'
    i--
  }
  if (i < 0) arr.unshift('1')
  else arr[i] = String.fromCharCode(arr[i].charCodeAt(0) + 1)
  return arr.join('')
}

/**
 * 整数部分是否超出 Number.MAX_SAFE_INTEGER（字符串判断，避免比较本身丢精度）
 */
function isUnsafeIntegerString(raw: string): boolean {
  const m = NUMERIC_STRING_RE.exec(raw.trim())
  if (!m) return false
  return Number(m[2]) > Number.MAX_SAFE_INTEGER
}

/**
 * 超大数字符串格式化：固定精度（字符串四舍五入）+ 千位分隔，全程不经 Number 转换
 */
function formatBigString(
  raw: string,
  state: Pick<LhStatisticState, 'precision' | 'separator'>
): string {
  const m = NUMERIC_STRING_RE.exec(raw.trim())!
  const sign = m[1]
  let intPart = m[2]
  let decPart = m[3] ?? ''

  if (state.precision === 0) {
    // 整数精度：小数首位 >= 5 则整数进位
    if (decPart && decPart[0] >= '5') intPart = incrementDigits(intPart)
    decPart = ''
  } else if (decPart.length > state.precision) {
    const keep = decPart.slice(0, state.precision)
    if (decPart[state.precision] >= '5') {
      const bumped = incrementDigits(keep)
      if (bumped.length > keep.length) {
        // 小数部分进位溢出（如 .99 → 1.00），整数 +1
        intPart = incrementDigits(intPart)
        decPart = bumped.slice(1)
      } else {
        decPart = bumped
      }
    } else {
      decPart = keep
    }
  } else {
    decPart = decPart.padEnd(state.precision, '0')
  }

  const grouped = state.separator
    ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, state.separator)
    : intPart
  return decPart ? `${sign}${grouped}.${decPart}` : `${sign}${grouped}`
}

/**
 * 格式化统计数值：固定精度 + 千位分隔（分隔符仅用于整数分组，小数点固定为 `.`）
 * 非有限数值原样返回 String；超大数字符串走字符串路径，不丢精度
 */
export function formatStatisticValue(
  value: number | string,
  state: Pick<LhStatisticState, 'precision' | 'separator'>
): string {
  if (typeof value === 'number' && !Number.isFinite(value)) return String(value)

  // 字符串可承载超大数：超出安全整数范围时走字符串格式化，避免 Number 精度丢失
  if (typeof value === 'string' && isUnsafeIntegerString(value)) {
    return formatBigString(value, state)
  }

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
