import { describe, expect, it } from 'vitest'
import {
  DEFAULT_DRAWER_DIRECTION,
  DEFAULT_DRAWER_SIZE,
  getDrawerClass,
  getDrawerPanelStyle,
  normalizeDrawerSize,
  canDrawerClose,
  shouldDrawerTrapFocus,
  getDrawerAria,
} from '../../../src/core/drawer'

describe('LhDrawer core', () => {
  it('exposes documented defaults', () => {
    expect(DEFAULT_DRAWER_DIRECTION).toBe('right')
    expect(DEFAULT_DRAWER_SIZE).toBe('30%')
  })

  it('normalizes sizes: numbers become px, strings pass through', () => {
    expect(normalizeDrawerSize(320)).toBe('320px')
    expect(normalizeDrawerSize('40%')).toBe('40%')
    expect(normalizeDrawerSize(undefined)).toBe(DEFAULT_DRAWER_SIZE)
    expect(normalizeDrawerSize('')).toBe(DEFAULT_DRAWER_SIZE)
    expect(normalizeDrawerSize(null as unknown as undefined)).toBe(DEFAULT_DRAWER_SIZE)
  })

  it('applies size to width for left/right and height for top/bottom', () => {
    expect(getDrawerPanelStyle('right', 400)).toEqual({ width: '400px' })
    expect(getDrawerPanelStyle('left', '35%')).toEqual({ width: '35%' })
    expect(getDrawerPanelStyle('top', 200)).toEqual({ height: '200px' })
    expect(getDrawerPanelStyle('bottom', undefined)).toEqual({ height: DEFAULT_DRAWER_SIZE })
  })

  it('computes the BEM class names', () => {
    expect(getDrawerClass({ direction: 'right' })).toEqual(['lh-drawer', 'lh-drawer--right'])
    expect(getDrawerClass({ direction: 'top' })).toEqual(['lh-drawer', 'lh-drawer--top'])
  })

  it('gates closing on the previously dead closeOnEsc flag', () => {
    // closeOnEsc 此前只在 state 中声明、logic 从不读取；现在补齐为逃逸闸门
    expect(canDrawerClose({}, 'escape')).toBe(true)
    expect(canDrawerClose({ closeOnEsc: false }, 'escape')).toBe(false)
    expect(canDrawerClose({ maskClosable: true }, 'maskClick')).toBe(true)
    expect(canDrawerClose({ maskClosable: false }, 'maskClick')).toBe(false)
  })

  it('traps focus only when open and scroll-locked', () => {
    expect(shouldDrawerTrapFocus({ modelValue: true, lockScroll: true })).toBe(true)
    expect(shouldDrawerTrapFocus({ modelValue: true, lockScroll: false })).toBe(false)
    expect(shouldDrawerTrapFocus({ modelValue: false, lockScroll: true })).toBe(false)
  })

  it('emits drawer aria attributes', () => {
    expect(getDrawerAria({ id: 'dr1', titleId: 't1' })).toEqual({
      role: 'dialog',
      'aria-modal': true,
      id: 'dr1',
      'aria-labelledby': 't1',
    })
  })
})
