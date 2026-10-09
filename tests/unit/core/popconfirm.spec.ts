import { describe, expect, it } from 'vitest'
import {
  DEFAULT_POPCONFIRM_PLACEMENT,
  DEFAULT_POPCONFIRM_TYPE,
  getPopconfirmClass,
  getPopconfirmIconName,
  getDefaultDelay as getPopconfirmDefaultDelay,
  canCloseOnEscape,
  getPopconfirmPopperAria,
  getPopconfirmTriggerAria,
} from '../../../src/core/popconfirm'

describe('LhPopconfirm core', () => {
  it('exposes documented defaults', () => {
    expect(DEFAULT_POPCONFIRM_TYPE).toBe('warning')
    expect(DEFAULT_POPCONFIRM_PLACEMENT).toBe('top')
  })

  it('maps types to icon names with a warning fallback', () => {
    expect(getPopconfirmIconName('info')).toBe('info')
    expect(getPopconfirmIconName('warning')).toBe('warning')
    expect(getPopconfirmIconName('danger')).toBe('error')
    // JS 侧脏值回退 warning 而非 undefined
    expect(getPopconfirmIconName('bogus' as never)).toBe('warning')
  })

  it('computes popper class names with type and placement', () => {
    expect(
      getPopconfirmClass({ type: 'danger', placement: 'top', popperClass: 'x' }),
    ).toEqual([
      'lh-popconfirm__popper',
      'lh-popconfirm__popper--danger',
      'lh-popconfirm__popper--top',
      'x',
    ])
  })

  it('defaults delays to show 200 / hide 100', () => {
    expect(getPopconfirmDefaultDelay(undefined, undefined)).toEqual({ show: 200, hide: 100 })
    expect(getPopconfirmDefaultDelay(500, 0)).toEqual({ show: 500, hide: 0 })
  })
})

describe('LhPopconfirm accessibility', () => {
  it('binds trigger aria attributes', () => {
    expect(getPopconfirmTriggerAria(true, 'pc')).toEqual({
      'aria-expanded': true,
      'aria-controls': 'pc',
      'aria-haspopup': 'true',
    })
  })

  it('marks the popper as an alertdialog', () => {
    expect(getPopconfirmPopperAria('pc')).toEqual({ role: 'alertdialog', id: 'pc' })
  })

  it('gates escape closing on the disabled flag', () => {
    expect(canCloseOnEscape({ disabled: false })).toBe(true)
    expect(canCloseOnEscape({ disabled: true })).toBe(false)
  })
})