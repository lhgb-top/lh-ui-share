/**
 * 数值净化（共享内核）
 *
 * core 层大量函数接收外部数值（页码、间距、step、尺寸上限……），
 * NaN/Infinity 一旦流入会一路污染下游（`NaNpx`、`slice(NaN)`、死循环等）。
 * 统一在入口净化为安全缺省值。
 */

export interface LhSanitizeNumberOptions {
  /** 允许的最小值（结果不小于它）；非有限的 min 自身会被忽略 */
  min?: number
  /** 允许的最大值（结果不大于它）；非有限的 max 自身会被忽略 */
  max?: number
  /** 是否取整（向 0 截断） */
  integer?: boolean
}

/**
 * 把任意数值净化为有限数；非有限（NaN / Infinity / undefined / null）返回 fallback。
 *
 * min/max 边界自身也做非有限过滤：`{ min: NaN }` 这类坏 prop 不会把 NaN 带回结果。
 */
export function sanitizeNumber(
  value: number | undefined | null,
  fallback: number,
  options: LhSanitizeNumberOptions = {}
): number {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return fallback
  }
  let result = value
  if (options.integer) {
    result = Math.trunc(result)
  }
  if (options.min !== undefined && Number.isFinite(options.min)) {
    result = Math.max(options.min, result)
  }
  if (options.max !== undefined && Number.isFinite(options.max)) {
    result = Math.min(options.max, result)
  }
  return result
}

/**
 * 原始钳制：Math.min(Math.max(value, min), max)，不做任何净化。
 *
 * 供边界已由调用方保证有限、需要保持既有 NaN 透传语义的钳制场景复用
 * （input-number / slider 的 clampValue 与 popper 的夹回都以此为准）。
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** precision 允许的小数位上限：toFixed 超过 100 位会抛 RangeError */
export const LH_PRECISION_MAX = 100

/**
 * 把 precision 净化为 [0, 100] 整数，非法值回退 0（防 toFixed RangeError 崩渲染）。
 *
 * input-number 与 statistic 共用同一防线；新增消费 toFixed 的组件一律走这里。
 */
export function safePrecision(precision: number): number {
  return sanitizeNumber(precision, 0, { min: 0, max: LH_PRECISION_MAX, integer: true })
}
