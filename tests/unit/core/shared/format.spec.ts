import { describe, it, expect } from 'vitest'
import { formatMessage } from '../../../../src/core/shared/format'
import { formatMessage as fromLocales } from '../../../../src/locales'

describe('shared/format - formatMessage', () => {
  it('interpolates {key} placeholders', () => {
    expect(formatMessage('共 {total} 条', { total: 100 })).toBe('共 100 条')
    expect(formatMessage('Page {page} of {pageCount}', { page: 2, pageCount: 9 })).toBe(
      'Page 2 of 9',
    )
  })

  it('keeps unknown placeholders as-is', () => {
    expect(formatMessage('共 {total} 条', {})).toBe('共 {total} 条')
    expect(formatMessage('no placeholders', { a: 1 })).toBe('no placeholders')
  })

  it('stringifies non-string param values', () => {
    expect(formatMessage('{n} 星', { n: String(4.5) })).toBe('4.5 星')
    expect(formatMessage('{count}', { count: 3 })).toBe('3')
  })

  it('treats a missing params object as empty', () => {
    expect(formatMessage('{a}')).toBe('{a}')
  })

  it('is the same binding re-exported by locales (single source of truth)', () => {
    // 迁移后 locales 层只是再导出共享内核的实现，两者必须是同一引用
    expect(fromLocales).toBe(formatMessage)
  })
})
