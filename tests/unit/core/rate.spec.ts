import { describe, expect, it } from 'vitest'
import { clampRate, getRateAriaText, getStarFill, stepRate } from '../../../src/core/rate'

describe('LhRate core', () => {
  it('clamps values', () => {
    expect(clampRate(undefined, 5)).toBe(0)
    expect(clampRate(-1, 5)).toBe(0)
    expect(clampRate(9, 5)).toBe(5)
    expect(clampRate(3.5, 5)).toBe(3.5)
  })

  it('steps by 1 or 0.5 with clamping', () => {
    expect(stepRate(3, 1, false, 5)).toBe(4)
    expect(stepRate(3, 1, true, 5)).toBe(3.5)
    expect(stepRate(0.5, -1, true, 5)).toBe(0)
    expect(stepRate(5, 1, false, 5)).toBe(5)
  })

  it('resolves star fill levels', () => {
    expect(getStarFill(3, 3, false)).toBe('full')
    expect(getStarFill(3, 4, false)).toBe('empty')
    expect(getStarFill(3.5, 4, true)).toBe('half')
    expect(getStarFill(2.4, 3, true)).toBe('empty')
  })

  it('formats aria text with {n}', () => {
    expect(getRateAriaText(4.5, '{n} 星')).toBe('4.5 星')
    expect(getRateAriaText(3, '{n} stars')).toBe('3 stars')
  })
})
