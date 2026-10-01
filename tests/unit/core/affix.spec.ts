import { describe, expect, it } from 'vitest'
import { getAffixClassNames, getAffixFixedStyle, isAffixFixed } from '../../../src/core/affix'

describe('LhAffix core', () => {
  it('computes class names', () => {
    expect(getAffixClassNames({ fixed: true })).toEqual(['lh-affix', 'lh-affix--fixed'])
    expect(getAffixClassNames({ fixed: false })).toEqual(['lh-affix'])
  })

  it('detects the fixed state against offsets', () => {
    expect(isAffixFixed({ top: -10, bottom: 50 }, 0, 0)).toBe(true)
    expect(isAffixFixed({ top: 10, bottom: 80 }, 0, 0)).toBe(false)
    expect(isAffixFixed({ top: 10, bottom: 80 }, 20, 0)).toBe(true)
    expect(isAffixFixed({ top: 30, bottom: 90 }, 0, 20)).toBe(true)
  })

  it('builds fixed styles for top and bottom modes', () => {
    expect(getAffixFixedStyle(10, 0)).toEqual({ position: 'fixed', top: '10px', bottom: 'auto' })
    expect(getAffixFixedStyle(10, 20)).toEqual({ position: 'fixed', bottom: '20px', top: 'auto' })
  })
})
