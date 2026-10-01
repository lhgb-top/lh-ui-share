import { describe, it, expect } from 'vitest'
import { getBadgeClassNames } from '../../../src/core/badge'

describe('Badge Core Logic', () => {
  it('should return base class', () => {
    const state = {
      type: 'default' as const,
      size: 'medium' as const,
      isHidden: false,
      isDot: false,
      isZero: false,
    }
    expect(getBadgeClassNames(state)).toEqual(['lh-badge', 'lh-badge--default', 'lh-badge--medium'])
  })

  it('should add type class', () => {
    const state = {
      type: 'primary' as const,
      size: 'medium' as const,
      isHidden: false,
      isDot: false,
      isZero: false,
    }
    expect(getBadgeClassNames(state)).toContain('lh-badge--primary')
  })

  it('should add hidden class', () => {
    const state = {
      type: 'default' as const,
      size: 'medium' as const,
      isHidden: true,
      isDot: false,
      isZero: false,
    }
    expect(getBadgeClassNames(state)).toContain('lh-badge--hidden')
  })

  it('should add dot class', () => {
    const state = {
      type: 'default' as const,
      size: 'medium' as const,
      isHidden: false,
      isDot: true,
      isZero: false,
    }
    expect(getBadgeClassNames(state)).toContain('lh-badge--dot')
  })

  it('should add zero class', () => {
    const state = {
      type: 'default' as const,
      size: 'medium' as const,
      isHidden: false,
      isDot: false,
      isZero: true,
    }
    expect(getBadgeClassNames(state)).toContain('lh-badge--zero')
  })

  it('should add size class', () => {
    const state = {
      type: 'default' as const,
      size: 'small' as const,
      isHidden: false,
      isDot: false,
      isZero: false,
    }
    expect(getBadgeClassNames(state)).toContain('lh-badge--small')
  })
})