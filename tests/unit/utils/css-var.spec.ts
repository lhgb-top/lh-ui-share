import { describe, it, expect } from 'vitest'
import { toCssVarName, cssVars, stripCssVarName } from '../../../src/utils/css-var'

describe('toCssVarName', () => {
  it('adds the --lh- prefix to plain keys', () => {
    expect(toCssVarName('primary-color')).toBe('--lh-primary-color')
  })

  it('keeps already-prefixed keys unchanged (idempotent)', () => {
    expect(toCssVarName('--lh-primary-color')).toBe('--lh-primary-color')
  })

  it('does not double-prefix preset-style keys', () => {
    // 回归：getThemeVars() 返回的键已带前缀，二次拼接曾产出 --lh---lh-primary-color
    expect(toCssVarName('--lh-primary-color')).not.toBe('--lh---lh-primary-color')
  })
})

describe('cssVars', () => {
  it('prefixes unprefixed keys', () => {
    expect(cssVars({ 'primary-color': '#2B4C7C' })).toEqual({
      '--lh-primary-color': '#2B4C7C',
    })
  })

  it('passes already-prefixed keys through', () => {
    expect(cssVars({ '--lh-primary-color': '#2B4C7C' })).toEqual({
      '--lh-primary-color': '#2B4C7C',
    })
  })

  it('mixes prefixed and unprefixed keys correctly', () => {
    expect(
      cssVars({
        '--lh-primary-color': '#2B4C7C',
        'bg-pattern': 'ink-wash',
      })
    ).toEqual({
      '--lh-primary-color': '#2B4C7C',
      '--lh-bg-pattern': 'ink-wash',
    })
  })
})

describe('stripCssVarName', () => {
  it('removes the --lh- prefix', () => {
    expect(stripCssVarName('--lh-primary-color')).toBe('primary-color')
  })

  it('leaves unprefixed keys untouched', () => {
    expect(stripCssVarName('primary-color')).toBe('primary-color')
  })

  it('round-trips through toCssVarName', () => {
    expect(toCssVarName(stripCssVarName('--lh-primary-color'))).toBe('--lh-primary-color')
  })
})
