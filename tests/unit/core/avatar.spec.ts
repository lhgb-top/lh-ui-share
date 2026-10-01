import { describe, it, expect } from 'vitest'
import { getAvatarClassNames, getAvatarText, isImageSource } from '../../../src/core/avatar'

describe('Avatar Core Logic', () => {
  it('should return base class with size and shape', () => {
    const classes = getAvatarClassNames({ size: 'medium', shape: 'circle' })
    expect(classes).toEqual(['lh-avatar', 'lh-avatar--medium', 'lh-avatar--circle'])
  })

  it('should apply square shape class', () => {
    const classes = getAvatarClassNames({ size: 'large', shape: 'square' })
    expect(classes).toContain('lh-avatar--square')
  })

  it('should apply size classes', () => {
    expect(getAvatarClassNames({ size: 'small', shape: 'circle' })).toContain('lh-avatar--small')
    expect(getAvatarClassNames({ size: 'large', shape: 'circle' })).toContain('lh-avatar--large')
  })

  it('should extract first character for avatar text', () => {
    expect(getAvatarText('水墨丹青')).toBe('水')
    expect(getAvatarText('Alice Chen')).toBe('A')
  })

  it('should trim whitespace before extracting', () => {
    expect(getAvatarText('  青花  ')).toBe('青')
  })

  it('should return empty string for empty source', () => {
    expect(getAvatarText('')).toBe('')
    expect(getAvatarText('   ')).toBe('')
  })

  it('should treat http, data-uri and relative paths as image sources', () => {
    expect(isImageSource('https://example.com/a.png')).toBe(true)
    expect(isImageSource('data:image/png;base64,xxx')).toBe(true)
    expect(isImageSource('/img/a.jpg')).toBe(true)
    expect(isImageSource('./a.svg')).toBe(true)
  })

  it('should reject empty or non-path sources', () => {
    expect(isImageSource(undefined)).toBe(false)
    expect(isImageSource('')).toBe(false)
    expect(isImageSource('not-a-path')).toBe(false)
  })
})
