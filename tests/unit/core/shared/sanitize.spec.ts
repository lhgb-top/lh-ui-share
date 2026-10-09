import { describe, it, expect } from 'vitest'
import { clamp, sanitizeNumber } from '../../../../src/core/shared/sanitize'

describe('shared / sanitizeNumber', () => {
  it('returns finite values unchanged', () => {
    expect(sanitizeNumber(10, 0)).toBe(10)
    expect(sanitizeNumber(0, 5)).toBe(0)
    expect(sanitizeNumber(-3, 5)).toBe(-3)
  })

  it('falls back for non-finite or nullish input', () => {
    expect(sanitizeNumber(NaN, 7)).toBe(7)
    expect(sanitizeNumber(Infinity, 7)).toBe(7)
    expect(sanitizeNumber(-Infinity, 7)).toBe(7)
    expect(sanitizeNumber(undefined, 7)).toBe(7)
    expect(sanitizeNumber(null, 7)).toBe(7)
  })

  it('truncates towards zero when integer is set', () => {
    expect(sanitizeNumber(3.7, 0, { integer: true })).toBe(3)
    expect(sanitizeNumber(-3.7, 0, { integer: true })).toBe(-3)
    // 非有限值先走 fallback，integer 不再生效
    expect(sanitizeNumber(NaN, 2.8, { integer: true })).toBe(2.8)
  })

  it('clamps to the min bound', () => {
    expect(sanitizeNumber(-5, 0, { min: 0 })).toBe(0)
    expect(sanitizeNumber(5, 0, { min: 0 })).toBe(5)
    expect(sanitizeNumber(2.5, 0, { min: 3 })).toBe(3)
  })

  it('applies integer before min', () => {
    expect(sanitizeNumber(-2.8, 0, { integer: true, min: -2 })).toBe(-2)
  })

  it('clamps to the max bound', () => {
    expect(sanitizeNumber(30, 0, { max: 24 })).toBe(24)
    expect(sanitizeNumber(5, 0, { min: 0, max: 24 })).toBe(5)
  })

  it('ignores non-finite min/max bounds instead of re-polluting the result', () => {
    // 回归：options.min 自身未净化时 Math.max(NaN, x) 会把 NaN 带回结果
    expect(sanitizeNumber(10, 0, { min: NaN })).toBe(10)
    expect(sanitizeNumber(10, 0, { max: NaN })).toBe(10)
    expect(sanitizeNumber(10, 0, { min: Infinity })).toBe(10)
    expect(sanitizeNumber(10, 0, { max: Infinity })).toBe(10)
    expect(sanitizeNumber(10, 0, { min: NaN, max: NaN })).toBe(10)
  })

  it('clamp keeps the raw Math.min/Math.max semantics (NaN bounds propagate)', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(11, 0, 10)).toBe(10)
    // clampValue（input-number/slider）的历史语义：边界非法时原样透传
    expect(clamp(5, NaN, 10)).toBeNaN()
  })
})
