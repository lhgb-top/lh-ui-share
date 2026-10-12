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

    it('adds dashed class from borderStyle even when dashed is false', () => {
      const classes = getDividerClassNames({
        direction: 'horizontal',
        dashed: false,
        borderStyle: 'dashed',
        hasContent: false,
        labelPosition: 'center',
      })
      expect(classes).toContain('lh-divider--dashed')
    })

    it('adds dotted class from borderStyle', () => {
      const classes = getDividerClassNames({
        direction: 'horizontal',
        dashed: false,
        borderStyle: 'dotted',
        hasContent: false,
        labelPosition: 'center',
      })
      expect(classes).toContain('lh-divider--dotted')
    })

    it('prefers borderStyle over the dashed prop', () => {
      // solid 为默认样式，应压过 dashed 修饰类
      const solid = getDividerClassNames({
        direction: 'horizontal',
        dashed: true,
        borderStyle: 'solid',
        hasContent: false,
        labelPosition: 'center',
      })
      expect(solid).not.toContain('lh-divider--dashed')

      const dotted = getDividerClassNames({
        direction: 'horizontal',
        dashed: true,
        borderStyle: 'dotted',
        hasContent: false,
        labelPosition: 'center',
      })
      expect(dotted).toContain('lh-divider--dotted')
      expect(dotted).not.toContain('lh-divider--dashed')
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

    it('keeps vertical text centred without label position classes', () => {
      // labelPosition 是横向语义，竖向文案恒居中，不产出 --label-* 修饰类
      const classes = getDividerClassNames({
        direction: 'vertical',
        dashed: false,
        hasContent: true,
        labelPosition: 'left',
      })
      expect(classes).toContain('lh-divider--with-text')
      expect(classes).not.toContain('lh-divider--label-left')
      expect(classes).not.toContain('lh-divider--label-center')
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
