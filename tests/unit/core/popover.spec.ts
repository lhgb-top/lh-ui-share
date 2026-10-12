import { describe, expect, it } from 'vitest'
import {
  LH_POPOVER_PLACEMENT_DEFAULT,
  LH_POPOVER_TRIGGERS,
  getDefaultDelay as getPopoverDefaultDelay,
  getPopoverClass,
  getPopoverWidthStyle,
  canCloseOnEscape,
  getPopoverPopperAria,
  getPopoverTriggerAria,
} from '../../../src/core/popover'

describe('LhPopover core', () => {
  it('exposes documented defaults', () => {
    expect(LH_POPOVER_PLACEMENT_DEFAULT).toBe('top')
    expect(LH_POPOVER_TRIGGERS).toEqual(['click', 'hover', 'focus', 'manual'])
  })

  it('defaults delays to show 200 / hide 100', () => {
    expect(getPopoverDefaultDelay(undefined, undefined)).toEqual({ show: 200, hide: 100 })
    expect(getPopoverDefaultDelay(0, 300)).toEqual({ show: 0, hide: 300 })
  })

  it('computes popper class names with an arrow toggle', () => {
    expect(getPopoverClass({ placement: 'top' })).toEqual([
      'lh-popover__popper',
      'lh-popover__popper--top',
      'lh-popover__popper--arrow',
    ])
    expect(getPopoverClass({ placement: 'bottom', arrow: false })).toEqual([
      'lh-popover__popper',
      'lh-popover__popper--bottom',
    ])
    expect(getPopoverClass({ placement: 'top', popperClass: 'rich' })).toContain('rich')
  })

  it('maps the width prop to a style', () => {
    expect(getPopoverWidthStyle(undefined)).toEqual({})
    expect(getPopoverWidthStyle('')).toEqual({})
    expect(getPopoverWidthStyle(240)).toEqual({ width: '240px' })
    expect(getPopoverWidthStyle('auto')).toEqual({ width: 'auto' })
  })
})

describe('LhPopover accessibility', () => {
  it('binds trigger aria attributes for a visible popover', () => {
    expect(getPopoverTriggerAria(true, 'p1')).toEqual({
      'aria-expanded': true,
      'aria-controls': 'p1',
      'aria-haspopup': 'true',
    })
  })

  it('skips aria-controls without a popper id', () => {
    expect(getPopoverTriggerAria(false)).toEqual({
      'aria-expanded': false,
      'aria-haspopup': 'true',
    })
  })

  it('marks the popper as a dialog and links its title', () => {
    expect(getPopoverPopperAria('p1', 't1')).toEqual({
      role: 'dialog',
      id: 'p1',
      'aria-labelledby': 't1',
    })
    expect(getPopoverPopperAria()).toEqual({ role: 'dialog' })
  })

  it('gates escape closing on the disabled flag', () => {
    expect(canCloseOnEscape({ disabled: false })).toBe(true)
    expect(canCloseOnEscape({ disabled: true })).toBe(false)
  })
})
