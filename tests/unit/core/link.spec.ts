import { describe, it, expect } from 'vitest'
import { getLinkClassNames, getLinkAria } from '../../../src/core/link'
import type { LhLinkState } from '../../../src/core/link'

function state(overrides: Partial<LhLinkState> = {}): LhLinkState {
  return {
    type: 'default',
    underline: 'hover',
    disabled: false,
    ...overrides,
  }
}

describe('Link Core Logic', () => {
  it('should return base class only for defaults', () => {
    expect(getLinkClassNames(state())).toEqual(['lh-link'])
  })

  it('should add type class for non-default types', () => {
    for (const type of ['primary', 'success', 'warning', 'danger', 'info'] as const) {
      expect(getLinkClassNames(state({ type }))).toContain(`lh-link--${type}`)
    }
  })

  it('should not emit type class for default', () => {
    expect(getLinkClassNames(state({ type: 'default' }))).not.toContain('lh-link--default')
  })

  it('should add underline modifier for always and none', () => {
    expect(getLinkClassNames(state({ underline: 'always' }))).toContain('lh-link--underline-always')
    expect(getLinkClassNames(state({ underline: 'none' }))).toContain('lh-link--underline-none')
    // hover 是默认形态，无修饰类
    expect(getLinkClassNames(state({ underline: 'hover' }))).not.toContain('lh-link--underline-hover')
  })

  it('should add disabled class', () => {
    expect(getLinkClassNames(state({ disabled: true }))).toContain('lh-link--disabled')
  })

  it('should degrade invalid values to defaults', () => {
    // 非法 type / underline 不产出修饰类（白名单校验）
    expect(
      getLinkClassNames({ type: 'invalid' as never, underline: 'always', disabled: false }),
    ).toEqual(['lh-link', 'lh-link--underline-always'])
    expect(
      getLinkClassNames({ type: 'primary', underline: 'invalid' as never, disabled: false }),
    ).toEqual(['lh-link', 'lh-link--primary'])
  })

  it('should emit aria-disabled with role for disabled link', () => {
    expect(getLinkAria({ disabled: true })).toEqual({ 'aria-disabled': true, role: 'link' })
  })

  it('should emit nothing for enabled link', () => {
    expect(getLinkAria({ disabled: false })).toEqual({})
  })

  it('should emit aria-current when current provided', () => {
    expect(getLinkAria({ disabled: false, current: 'page' })).toEqual({ 'aria-current': 'page' })
    expect(getLinkAria({ disabled: false, current: true })).toEqual({ 'aria-current': true })
    expect(getLinkAria({ disabled: false })).toEqual({})
  })
})
