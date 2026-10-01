import { describe, expect, it } from 'vitest'
import {
  getMenuItemClassNames,
  getMenuItemGroupClassNames,
  getMenuClassNames,
  getSubMenuClassNames,
  isMenuOpen,
  moveMenuFocus,
  toggleMenuOpen,
} from '../../../src/core/menu'

describe('LhMenu core', () => {
  it('computes container class names', () => {
    expect(getMenuClassNames({ mode: 'vertical', collapse: false })).toEqual(['lh-menu', 'lh-menu--vertical'])
    expect(getMenuClassNames({ mode: 'horizontal', collapse: false })).toEqual([
      'lh-menu',
      'lh-menu--horizontal',
    ])
    expect(getMenuClassNames({ mode: 'vertical', collapse: true })).toEqual([
      'lh-menu',
      'lh-menu--vertical',
      'lh-menu--collapse',
    ])
  })

  it('computes item class names', () => {
    expect(getMenuItemClassNames({ active: true, disabled: false })).toEqual([
      'lh-menu-item',
      'lh-menu-item--active',
    ])
    expect(getMenuItemClassNames({ active: false, disabled: true })).toEqual([
      'lh-menu-item',
      'lh-menu-item--disabled',
    ])
  })

  it('computes sub-menu class names', () => {
    expect(
      getSubMenuClassNames({ active: false, disabled: false, opened: true }),
    ).toEqual(['lh-sub-menu', 'lh-sub-menu--opened'])
    expect(
      getSubMenuClassNames({ active: true, disabled: true, opened: false }),
    ).toEqual(['lh-sub-menu', 'lh-sub-menu--active', 'lh-sub-menu--disabled'])
  })

  it('computes group class names', () => {
    expect(getMenuItemGroupClassNames()).toEqual(['lh-menu-item-group'])
  })

  it('toggles open states in regular mode', () => {
    expect(toggleMenuOpen(['a'], 'b', false)).toEqual(['a', 'b'])
    expect(toggleMenuOpen(['a', 'b'], 'a', false)).toEqual(['b'])
  })

  it('keeps a single open in accordion mode', () => {
    expect(toggleMenuOpen(['a'], 'b', true)).toEqual(['b'])
    expect(toggleMenuOpen(['b'], 'b', true)).toEqual([])
  })

  it('checks open state', () => {
    expect(isMenuOpen(['a', 'b'], 'a')).toBe(true)
    expect(isMenuOpen(['a'], 'b')).toBe(false)
  })
  it('moves focus across items skipping disabled and wrapping', () => {
    const el = (tabIndex: number) => ({ tabIndex } as HTMLElement)
    const items = [el(0), el(-1), el(0), el(0)]
    expect(moveMenuFocus(items, items[0], 1)).toBe(items[2]) // 跳过禁用
    expect(moveMenuFocus(items, items[3], 1)).toBe(items[0]) // 循环回绕
    expect(moveMenuFocus(items, items[0], -1)).toBe(items[3])
    // 不在列表中回退首项；全禁用返回 null
    expect(moveMenuFocus(items, el(0), 1)).toBe(items[0])
    expect(moveMenuFocus([el(-1)], null, 1)).toBeNull()
  })
})
