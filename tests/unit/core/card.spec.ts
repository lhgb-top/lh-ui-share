import { describe, it, expect } from 'vitest'
import { getCardClassNames, getCardInteractivity, isCardInteractive } from '../../../src/core/card'

describe('Card Core Logic', () => {
  describe('getCardClassNames', () => {
    it('returns base and shadow classes', () => {
      const classes = getCardClassNames({ shadow: 'always', clickable: false, loading: false })
      expect(classes).toContain('lh-card')
      expect(classes).toContain('lh-card--shadow-always')
    })

    it('marks clickable and loading states', () => {
      const classes = getCardClassNames({ shadow: 'hover', clickable: true, loading: true })
      expect(classes).toContain('lh-card--clickable')
      expect(classes).toContain('lh-card--loading')
      expect(classes).toContain('lh-card--shadow-hover')
    })
  })

  describe('isCardInteractive', () => {
    it('is interactive only when clickable and not loading', () => {
      expect(isCardInteractive({ shadow: 'always', clickable: true, loading: false })).toBe(true)
      expect(isCardInteractive({ shadow: 'always', clickable: true, loading: true })).toBe(false)
      expect(isCardInteractive({ shadow: 'always', clickable: false, loading: false })).toBe(false)
    })
  })

  describe('getCardInteractivity', () => {
    it('assigns button semantics only to interactive cards', () => {
      expect(getCardInteractivity({ shadow: 'always', clickable: true, loading: false })).toBe('interactive')
      expect(getCardInteractivity({ shadow: 'always', clickable: false, loading: false })).toBe('static')
      expect(getCardInteractivity({ shadow: 'always', clickable: true, loading: true })).toBe('static')
    })
  })
})
