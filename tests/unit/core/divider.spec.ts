import { describe, it, expect } from 'vitest'
import { getDividerClassNames, getDividerRole, needsAriaOrientation } from '../../../src/core/divider'

describe('Divider Core Logic', () => {
  describe('getDividerClassNames', () => {
    it('returns base and direction classes', () => {
      const classes = getDividerClassNames({
        direction: 'horizontal',
        dashed: false,
        hasContent: false,
        labelPosition: 'center',
      })
      expect(classes).toContain('lh-divider')
      expect(classes).toContain('lh-divider--horizontal')
    })

    it('marks vertical direction', () => {
      const classes = getDividerClassNames({
        direction: 'vertical',
        dashed: false,
        hasContent: false,
        labelPosition: 'center',
      })
      expect(classes).toContain('lh-divider--vertical')
      expect(classes).not.toContain('lh-divider--horizontal')
    })

    it('adds dashed class when dashed', () => {
      const classes = getDividerClassNames({
        direction: 'horizontal',
        dashed: true,
        hasContent: false,
        labelPosition: 'center',
      })
      expect(classes).toContain('lh-divider--dashed')
    })

    it('adds label position classes only when content exists', () => {
      const withText = getDividerClassNames({
        direction: 'horizontal',
        dashed: false,
        hasContent: true,
        labelPosition: 'left',
      })
      expect(withText).toContain('lh-divider--with-text')
      expect(withText).toContain('lh-divider--label-left')

      const withoutText = getDividerClassNames({
        direction: 'horizontal',
        dashed: false,
        hasContent: false,
        labelPosition: 'left',
      })
      expect(withoutText).not.toContain('lh-divider--with-text')
      expect(withoutText).not.toContain('lh-divider--label-left')
    })
  })

  describe('getDividerRole', () => {
    it('returns separator for labelled dividers', () => {
      expect(getDividerRole(true)).toBe('separator')
    })

    it('returns presentation for decorative dividers', () => {
      expect(getDividerRole(false)).toBe('presentation')
    })
  })

  describe('needsAriaOrientation', () => {
    it('declares orientation only for labelled vertical dividers', () => {
      expect(needsAriaOrientation('vertical', true)).toBe(true)
      expect(needsAriaOrientation('vertical', false)).toBe(false)
      expect(needsAriaOrientation('horizontal', true)).toBe(false)
      expect(needsAriaOrientation('horizontal', false)).toBe(false)
    })
  })
})
