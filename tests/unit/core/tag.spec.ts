import { describe, it, expect } from 'vitest'
import { getTagClassNames } from '../../../src/core/tag'

describe('Tag Core Logic', () => {
  it('should return base class', () => {
    const state = {
      type: 'default' as const,
      size: 'medium' as const,
      closable: false,
      disabled: false,
      round: false,
      hit: false,
    }
    expect(getTagClassNames(state)).toEqual(['lh-tag', 'lh-tag--default', 'lh-tag--medium'])
  })

  it('should add type class', () => {
    const state = {
      type: 'primary' as const,
      size: 'medium' as const,
      closable: false,
      disabled: false,
      round: false,
      hit: false,
    }
    expect(getTagClassNames(state)).toContain('lh-tag--primary')
  })

  it('should add closable class', () => {
    const state = {
      type: 'default' as const,
      size: 'medium' as const,
      closable: true,
      disabled: false,
      round: false,
      hit: false,
    }
    expect(getTagClassNames(state)).toContain('lh-tag--closable')
  })

  it('should add disabled class', () => {
    const state = {
      type: 'default' as const,
      size: 'medium' as const,
      closable: false,
      disabled: true,
      round: false,
      hit: false,
    }
    expect(getTagClassNames(state)).toContain('lh-tag--disabled')
  })

  it('should add round class', () => {
    const state = {
      type: 'default' as const,
      size: 'medium' as const,
      closable: false,
      disabled: false,
      round: true,
      hit: false,
    }
    expect(getTagClassNames(state)).toContain('lh-tag--round')
  })

  it('should add hit class', () => {
    const state = {
      type: 'default' as const,
      size: 'medium' as const,
      closable: false,
      disabled: false,
      round: false,
      hit: true,
    }
    expect(getTagClassNames(state)).toContain('lh-tag--hit')
  })

  it('should add size class', () => {
    const state = {
      type: 'default' as const,
      size: 'small' as const,
      closable: false,
      disabled: false,
      round: false,
      hit: false,
    }
    expect(getTagClassNames(state)).toContain('lh-tag--small')
  })
})