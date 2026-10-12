import { describe, it, expect } from 'vitest'
import { getSpaceClassNames, resolveSpaceAlignment, resolveSpaceGaps } from '../../../src/core/space'

describe('Space Core Logic', () => {
  describe('getSpaceClassNames', () => {
    it('returns base and direction classes', () => {
      const classes = getSpaceClassNames({ direction: 'horizontal', wrap: false, size: 'medium' })
      expect(classes).toContain('lh-space')
      expect(classes).toContain('lh-space--horizontal')
    })

    it('adds wrap class only when requested', () => {
      const wrapped = getSpaceClassNames({ direction: 'horizontal', wrap: true, size: 'medium' })
      expect(wrapped).toContain('lh-space--wrap')

      const unwrapped = getSpaceClassNames({ direction: 'horizontal', wrap: false, size: 'medium' })
      expect(unwrapped).not.toContain('lh-space--wrap')
    })

    it('adds preset size class only for preset sizes', () => {
      expect(
        getSpaceClassNames({ direction: 'horizontal', wrap: false, size: 'small' }),
      ).toContain('lh-space--small')
      expect(
        getSpaceClassNames({ direction: 'horizontal', wrap: false, size: 'custom' }),
      ).not.toContain('lh-space--custom')
    })
  })

  describe('resolveSpaceGaps', () => {
    it('maps preset sizes to spacing tokens', () => {
      // 档位只引用 var.scss 实际注册的令牌（sm=8 / base=16 / xl=24）
      expect(resolveSpaceGaps('small')).toEqual({
        columnGap: 'var(--lh-spacing-sm, 8px)',
        rowGap: 'var(--lh-spacing-sm, 8px)',
        usesTokens: true,
      })
      expect(resolveSpaceGaps('medium').columnGap).toBe('var(--lh-spacing-base, 16px)')
      expect(resolveSpaceGaps('large').columnGap).toBe('var(--lh-spacing-xl, 24px)')
      expect(resolveSpaceGaps('medium').usesTokens).toBe(true)
      expect(resolveSpaceGaps('large').usesTokens).toBe(true)
    })

    it('treats numbers as pixel values', () => {
      expect(resolveSpaceGaps(12)).toEqual({
        columnGap: '12px',
        rowGap: '12px',
        usesTokens: false,
      })
    })

    it('supports independent horizontal and vertical gaps', () => {
      expect(resolveSpaceGaps([8, 24])).toEqual({
        columnGap: '8px',
        rowGap: '24px',
        usesTokens: false,
      })
    })

    it('falls back deterministically for malformed tuples (round 2)', () => {
      // 回归：JS 侧缺第二项（[8]）曾产出 "undefinedpx"
      expect(resolveSpaceGaps([8] as unknown as [number, number])).toEqual({
        columnGap: '8px',
        rowGap: '8px',
        usesTokens: false,
      })
      expect(resolveSpaceGaps([undefined, 12] as unknown as [number, number])).toEqual({
        columnGap: '0px',
        rowGap: '12px',
        usesTokens: false,
      })
    })

    it('resolveSpaceAlignment passes the alignment through (round 2)', () => {
      // 对齐值直接作为 align-items 输出（baseline 与 flex 关键字原样）
      expect(resolveSpaceAlignment('baseline')).toBe('baseline')
      expect(resolveSpaceAlignment('center')).toBe('center')
    })
  })
})
