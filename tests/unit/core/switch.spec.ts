import { describe, it, expect } from 'vitest'
import { getSwitchClassNames, getSwitchLabel } from '../../../src/core/switch'

describe('Switch Core Logic', () => {
  it('should return base class', () => {
    const state = {
      checked: false,
      disabled: false,
      loading: false,
      name: '',
      size: 'medium' as const,
      activeText: '',
      inactiveText: '',
    }
    expect(getSwitchClassNames(state)).toEqual(['lh-switch', 'lh-switch--medium'])
  })

  it('should add checked class', () => {
    const state = {
      checked: true,
      disabled: false,
      loading: false,
      name: '',
      size: 'medium' as const,
      activeText: 'ON',
      inactiveText: 'OFF',
    }
    expect(getSwitchClassNames(state)).toContain('lh-switch--checked')
  })

  it('should add disabled class', () => {
    const state = {
      checked: false,
      disabled: true,
      loading: false,
      name: '',
      size: 'medium' as const,
      activeText: '',
      inactiveText: '',
    }
    expect(getSwitchClassNames(state)).toContain('lh-switch--disabled')
  })

  it('should add loading class', () => {
    const state = {
      checked: false,
      disabled: false,
      loading: true,
      name: '',
      size: 'medium' as const,
      activeText: '',
      inactiveText: '',
    }
    expect(getSwitchClassNames(state)).toContain('lh-switch--loading')
  })

  it('should add size class', () => {
    const state = {
      checked: false,
      disabled: false,
      loading: false,
      name: '',
      size: 'large' as const,
      activeText: '',
      inactiveText: '',
    }
    expect(getSwitchClassNames(state)).toContain('lh-switch--large')
  })

  it('should return active text when checked', () => {
    const state = {
      checked: true,
      disabled: false,
      loading: false,
      name: '',
      size: 'medium' as const,
      activeText: 'ON',
      inactiveText: 'OFF',
    }
    expect(getSwitchLabel(state)).toBe('ON')
  })

  it('should return inactive text when unchecked', () => {
    const state = {
      checked: false,
      disabled: false,
      loading: false,
      name: '',
      size: 'medium' as const,
      activeText: 'ON',
      inactiveText: 'OFF',
    }
    expect(getSwitchLabel(state)).toBe('OFF')
  })
})