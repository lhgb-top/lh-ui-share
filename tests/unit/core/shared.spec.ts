import { describe, it, expect } from 'vitest'
import { mergePt } from '../../../src/core/shared/pt'
import { sxToStyle } from '../../../src/core/shared/sx'

describe('shared/pt - mergePt', () => {
  it('returns baseClass when pt is undefined', () => {
    const result = mergePt(undefined, 'lh-el')
    expect(result.class).toEqual(['lh-el'])
    expect(result.style).toEqual({})
    expect(result.attrs).toEqual({})
  })

  it('merges baseClass with string class', () => {
    const result = mergePt({ class: 'a b c' }, 'lh-el')
    expect(result.class).toContain('lh-el')
    expect(result.class).toContain('a')
    expect(result.class).toContain('b')
    expect(result.class).toContain('c')
  })

  it('merges baseClass with array class', () => {
    const result = mergePt({ class: ['foo', 'bar'] }, 'lh-el')
    expect(result.class).toContain('lh-el')
    expect(result.class).toContain('foo')
    expect(result.class).toContain('bar')
  })

  it('merges baseClass with object class', () => {
    const result = mergePt({ class: { foo: true, bar: false } }, 'lh-el')
    expect(result.class).toContain('lh-el')
    expect(result.class).toContain('foo')
    expect(result.class).not.toContain('bar')
  })

  it('passes through style and attrs', () => {
    const result = mergePt(
      { class: 'x', style: { color: 'red' }, attrs: { title: 'tip' } },
      'lh-el'
    )
    expect(result.style).toEqual({ color: 'red' })
    expect(result.attrs).toEqual({ title: 'tip' })
  })
})

describe('shared/sx - sxToStyle', () => {
  it('returns empty object when sx is null/undefined', () => {
    expect(sxToStyle({})).toEqual({})
  })

  it('converts w to width', () => {
    expect(sxToStyle({ w: 100 })).toEqual({ width: '100px' })
    expect(sxToStyle({ w: '100%' })).toEqual({ width: '100%' })
  })

  it('converts h to height', () => {
    expect(sxToStyle({ h: 50 })).toEqual({ height: '50px' })
    expect(sxToStyle({ h: 'auto' })).toEqual({ height: 'auto' })
  })

  it('converts margin values to px', () => {
    const style = sxToStyle({ mt: 1, mr: 2, mb: 3, ml: 4 })
    expect(style.marginTop).toBe('8px')
    expect(style.marginRight).toBe('16px')
    expect(style.marginBottom).toBe('24px')
    expect(style.marginLeft).toBe('32px')
  })

  it('converts my to marginTop and marginBottom', () => {
    const style = sxToStyle({ my: 2 })
    expect(style.marginTop).toBe('16px')
    expect(style.marginBottom).toBe('16px')
  })

  it('converts mx to marginLeft and marginRight', () => {
    const style = sxToStyle({ mx: 3 })
    expect(style.marginLeft).toBe('24px')
    expect(style.marginRight).toBe('24px')
  })

  it('converts m to margin', () => {
    expect(sxToStyle({ m: 4 })).toEqual({ margin: '32px' })
  })

  it('converts padding values to px', () => {
    const style = sxToStyle({ pt: 1, pr: 2, pb: 3, pl: 4 })
    expect(style.paddingTop).toBe('8px')
    expect(style.paddingRight).toBe('16px')
    expect(style.paddingBottom).toBe('24px')
    expect(style.paddingLeft).toBe('32px')
  })

  it('converts py to paddingTop and paddingBottom', () => {
    const style = sxToStyle({ py: 2 })
    expect(style.paddingTop).toBe('16px')
    expect(style.paddingBottom).toBe('16px')
  })

  it('converts px to paddingLeft and paddingRight', () => {
    const style = sxToStyle({ px: 3 })
    expect(style.paddingLeft).toBe('24px')
    expect(style.paddingRight).toBe('24px')
  })

  it('converts p to padding', () => {
    expect(sxToStyle({ p: 4 })).toEqual({ padding: '32px' })
  })

  it('converts display and flex properties', () => {
    const style = sxToStyle({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      flex: '1 1 0%',
    })
    expect(style.display).toBe('flex')
    expect(style.flexDirection).toBe('column')
    expect(style.alignItems).toBe('center')
    expect(style.justifyContent).toBe('space-between')
    expect(style.flex).toBe('1 1 0%')
  })
})