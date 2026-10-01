import { describe, expect, it } from 'vitest'
import {
  ensurePositioned,
  getLoadingClassNames,
  isLoadingFullscreen,
  resolveLoadingTarget,
} from '../../../src/core/loading'

describe('LhLoading core', () => {
  it('computes mask class names', () => {
    expect(getLoadingClassNames({ fullscreen: true, withText: true })).toEqual([
      'lh-loading',
      'lh-loading--fullscreen',
      'lh-loading--with-text',
    ])
    expect(getLoadingClassNames({ fullscreen: false, withText: false })).toEqual(['lh-loading'])
  })

  it('resolves targets: element passthrough, selector lookup, body fallback', () => {
    const el = document.createElement('div')
    expect(resolveLoadingTarget(el)).toBe(el)

    document.body.innerHTML = '<div id="box"></div>'
    expect(resolveLoadingTarget('#box').id).toBe('box')
    expect(resolveLoadingTarget('#missing')).toBe(document.body)
    expect(resolveLoadingTarget(undefined)).toBe(document.body)
    document.body.innerHTML = ''
  })

  it('treats body as the fullscreen target', () => {
    expect(isLoadingFullscreen(document.body)).toBe(true)
    expect(isLoadingFullscreen(document.createElement('div'))).toBe(false)
  })

  it('restores the original positioning after ensurePositioned', () => {
    const el = document.createElement('div')
    const { restore } = ensurePositioned(el)
    expect(el.style.position).toBe('relative')
    restore()
    expect(el.style.position).toBe('')

    const positioned = document.createElement('div')
    positioned.style.position = 'absolute'
    const untouched = ensurePositioned(positioned)
    expect(positioned.style.position).toBe('absolute')
    untouched.restore()
    expect(positioned.style.position).toBe('absolute')
  })
})
