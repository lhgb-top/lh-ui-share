import { describe, it, expect } from 'vitest'
import { getIconSize, getIconSvg, getIconStyle } from '../../../src/core/icon/logic'

describe('icon/core/logic', () => {
  describe('getIconSize', () => {
    it('returns 16 when size is undefined', () => {
      expect(getIconSize(undefined)).toBe(16)
    })

    it('returns 16 when size is empty string', () => {
      expect(getIconSize('')).toBe(16)
    })

    it('returns number directly when size is number', () => {
      expect(getIconSize(24)).toBe(24)
    })

    it('returns 12 for mini', () => {
      expect(getIconSize('mini')).toBe(12)
    })

    it('returns 14 for small', () => {
      expect(getIconSize('small')).toBe(14)
    })

    it('returns 16 for medium', () => {
      expect(getIconSize('medium')).toBe(16)
    })

    it('returns 20 for large', () => {
      expect(getIconSize('large')).toBe(20)
    })

    it('returns 24 for x-large', () => {
      expect(getIconSize('x-large')).toBe(24)
    })

    it('returns 16 for unknown size string', () => {
      expect(getIconSize('unknown')).toBe(16)
    })
  })

  describe('getIconSvg', () => {
    it('returns null when name is undefined', () => {
      expect(getIconSvg(undefined)).toBeNull()
    })

    it('returns null for unknown icon name', () => {
      expect(getIconSvg('unknown' as any)).toBeNull()
    })

    it('returns SVG path for known icon', () => {
      const svg = getIconSvg('star')
      expect(svg).toBeTruthy()
      expect(typeof svg).toBe('string')
    })
  })

  describe('getIconStyle', () => {
    it('returns correct style with default size', () => {
      const style = getIconStyle({ size: undefined })
      expect(style.width).toBe('16px')
      expect(style.height).toBe('16px')
    })

    it('returns correct style with custom size', () => {
      const style = getIconStyle({ size: 'large' })
      expect(style.width).toBe('20px')
      expect(style.height).toBe('20px')
    })

    it('returns correct style with numeric size', () => {
      const style = getIconStyle({ size: 32 })
      expect(style.width).toBe('32px')
      expect(style.height).toBe('32px')
    })

    it('includes color when provided', () => {
      const style = getIconStyle({ size: undefined, color: 'red' })
      expect(style.color).toBe('red')
    })

    it('excludes color when not provided', () => {
      const style = getIconStyle({ size: undefined })
      expect(style.color).toBeUndefined()
    })
  })
})