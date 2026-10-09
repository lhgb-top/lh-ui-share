import { describe, expect, it } from 'vitest'
import {
  DEFAULT_DROPDOWN_PLACEMENT,
  DROPDOWN_TRIGGERS,
  getDropdownClass,
  getDropdownItemClass,
  getDropdownMenuStyle,
  getDropdownTriggerAria,
  getDropdownMenuAria,
  getDropdownItemAria,
} from '../../../src/core/dropdown'

describe('LhDropdown core', () => {
  it('exposes documented defaults', () => {
    expect(DEFAULT_DROPDOWN_PLACEMENT).toBe('bottom-start')
    expect(DROPDOWN_TRIGGERS).toEqual(['hover', 'click', 'contextmenu'])
  })

  it('computes menu class names with placement and custom class', () => {
    expect(getDropdownClass({ placement: 'bottom-start' })).toEqual([
      'lh-dropdown__menu',
      'lh-dropdown__menu--bottom-start',
    ])
    expect(getDropdownClass({ placement: 'top', popperClass: 'custom' })).toContain('custom')
  })

  it('computes item class names for disabled and divided states', () => {
    expect(getDropdownItemClass({})).toEqual(['lh-dropdown__item'])
    expect(getDropdownItemClass({ disabled: true })).toEqual([
      'lh-dropdown__item',
      'lh-dropdown__item--disabled',
    ])
    expect(getDropdownItemClass({ divided: true })).toEqual([
      'lh-dropdown__item',
      'lh-dropdown__item--divided',
    ])
  })

  it('maps maxHeight to a scrollable menu style', () => {
    expect(getDropdownMenuStyle(undefined)).toEqual({})
    expect(getDropdownMenuStyle('')).toEqual({})
    expect(getDropdownMenuStyle(200)).toEqual({ maxHeight: '200px', overflow: 'auto' })
    expect(getDropdownMenuStyle('50vh')).toEqual({ maxHeight: '50vh', overflow: 'auto' })
  })
})

describe('LhDropdown accessibility', () => {
  it('binds trigger aria attributes for a menu popup', () => {
    expect(getDropdownTriggerAria(true, 'm1')).toEqual({
      'aria-expanded': true,
      'aria-controls': 'm1',
      'aria-haspopup': 'menu',
    })
  })

  it('marks the menu container and its items', () => {
    expect(getDropdownMenuAria('m1')).toEqual({ role: 'menu', id: 'm1' })
    expect(getDropdownItemAria({ disabled: false })).toEqual({ role: 'menuitem' })
    expect(getDropdownItemAria({ disabled: true })).toEqual({
      role: 'menuitem',
      'aria-disabled': true,
    })
  })
})
