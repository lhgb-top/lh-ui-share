import {
  ariaControls,
  ariaCurrent,
  ariaDescribedby,
  ariaExpanded,
  ariaHaspopup,
  ariaInvalid,
  ariaLabelledby,
  ariaRequired,
  generateAriaId,
  getDecorativeAria,
  getPopupTriggerAria,
} from '../../../../src/core/shared/a11y'

describe('shared/a11y', () => {
  describe('generateAriaId', () => {
    it('produces unique ids with a stable prefix', () => {
      const a = generateAriaId()
      const b = generateAriaId()
      expect(a).toMatch(/^lh-aria-\d+$/)
      expect(a).not.toBe(b)
    })

    it('honours a custom prefix', () => {
      expect(generateAriaId('lh-select-list')).toMatch(/^lh-select-list-\d+$/)
    })
  })

  describe('atomic builders', () => {
    it('expands boolean state to aria-expanded', () => {
      expect(ariaExpanded(true)).toEqual({ 'aria-expanded': true })
      expect(ariaExpanded(false)).toEqual({ 'aria-expanded': false })
    })

    it('omits id references when the id is missing', () => {
      expect(ariaControls('panel')).toEqual({ 'aria-controls': 'panel' })
      expect(ariaControls(undefined)).toEqual({})
      expect(ariaLabelledby('title')).toEqual({ 'aria-labelledby': 'title' })
      expect(ariaLabelledby(undefined)).toEqual({})
      expect(ariaDescribedby('hint')).toEqual({ 'aria-describedby': 'hint' })
      expect(ariaDescribedby(undefined)).toEqual({})
    })

    it('outputs aria-invalid as an explicit boolean', () => {
      expect(ariaInvalid(true)).toEqual({ 'aria-invalid': true })
      expect(ariaInvalid(false)).toEqual({ 'aria-invalid': false })
    })

    it('only emits aria-required / aria-current when truthy', () => {
      expect(ariaRequired(true)).toEqual({ 'aria-required': true })
      expect(ariaRequired(false)).toEqual({})
      expect(ariaCurrent('page')).toEqual({ 'aria-current': 'page' })
      expect(ariaCurrent('step')).toEqual({ 'aria-current': 'step' })
      expect(ariaCurrent(undefined)).toEqual({})
    })

    it('normalises aria-haspopup', () => {
      expect(ariaHaspopup('listbox')).toEqual({ 'aria-haspopup': 'listbox' })
      expect(ariaHaspopup(true)).toEqual({ 'aria-haspopup': 'true' })
      expect(ariaHaspopup(false)).toEqual({})
    })
  })

  describe('getPopupTriggerAria', () => {
    it('combines expanded / controls / haspopup', () => {
      expect(getPopupTriggerAria({ expanded: true, popupId: 'p1' })).toEqual({
        'aria-expanded': true,
        'aria-controls': 'p1',
        'aria-haspopup': 'true',
      })
    })

    it('uses an explicit popup kind', () => {
      expect(getPopupTriggerAria({ expanded: false, popupId: 'p1', haspopup: 'listbox' })).toEqual({
        'aria-expanded': false,
        'aria-controls': 'p1',
        'aria-haspopup': 'listbox',
      })
    })

    it('skips aria-controls when no popup id is given', () => {
      expect(getPopupTriggerAria({ expanded: true })).toEqual({
        'aria-expanded': true,
        'aria-haspopup': 'true',
      })
    })
  })

  describe('getDecorativeAria', () => {
    it('hides decorative elements from assistive technology', () => {
      expect(getDecorativeAria()).toEqual({ 'aria-hidden': true })
      expect(getDecorativeAria(false)).toEqual({})
    })
  })
})
