import { describe, it, expect } from 'vitest'
import {
  getEllipsisRows,
  getEllipsisStyle,
  getTextAria,
  getTextClassNames,
  getTextTag,
} from '../../../src/core/text'
import type { LhTextState } from '../../../src/core/text'

function state(overrides: Partial<LhTextState> = {}): LhTextState {
  return {
    level: 'p',
    type: 'default',
    strong: false,
    italic: false,
    underline: false,
    mark: false,
    code: false,
    ellipsis: false,
    disabled: false,
    ...overrides,
  }
}

describe('Text Core Logic', () => {
  it('should return base + level classes for defaults', () => {
    expect(getTextClassNames(state())).toEqual(['lh-text', 'lh-text--p'])
  })

  it('should add level class for each level', () => {
    for (const level of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'caption'] as const) {
      expect(getTextClassNames(state({ level }))).toContain(`lh-text--${level}`)
    }
  })

  it('should add type class for non-default types', () => {
    for (const type of ['secondary', 'success', 'warning', 'danger'] as const) {
      expect(getTextClassNames(state({ type }))).toContain(`lh-text--${type}`)
    }
    expect(getTextClassNames(state({ type: 'default' }))).not.toContain('lh-text--default')
  })

  it('should add boolean modifier classes', () => {
    const classes = getTextClassNames(
      state({ strong: true, italic: true, underline: true, mark: true, code: true, disabled: true }),
    )
    expect(classes).toEqual([
      'lh-text',
      'lh-text--p',
      'lh-text--strong',
      'lh-text--italic',
      'lh-text--underline',
      'lh-text--mark',
      'lh-text--code',
      'lh-text--disabled',
    ])
  })

  it('should degrade invalid level to p', () => {
    expect(getTextClassNames({ level: 'invalid' as never })).toEqual(['lh-text', 'lh-text--p'])
  })

  it('should compute ellipsis rows from boolean or number', () => {
    expect(getEllipsisRows(undefined)).toBe(0)
    expect(getEllipsisRows(false)).toBe(0)
    expect(getEllipsisRows(0)).toBe(0)
    expect(getEllipsisRows(NaN)).toBe(0)
    expect(getEllipsisRows(true)).toBe(1)
    expect(getEllipsisRows(3)).toBe(3)
    expect(getEllipsisRows(-2)).toBe(0)
    // 超大行数钳制到上限，避免 line-clamp 退化
    expect(getEllipsisRows(99)).toBe(10)
  })

  it('should add single-line ellipsis class', () => {
    expect(getTextClassNames(state({ ellipsis: true }))).toContain('lh-text--ellipsis')
  })

  it('should add multi-line ellipsis class with row count', () => {
    expect(getTextClassNames(state({ ellipsis: 3 }))).toContain('lh-text--ellipsis-3')
  })

  it('should not add ellipsis class when disabled', () => {
    expect(getTextClassNames(state({ ellipsis: false }))).not.toContain('lh-text--ellipsis')
    expect(getTextClassNames(state({ ellipsis: 0 }))).not.toContain('lh-text--ellipsis-0')
  })

  it('should return line-clamp style only for multi-line ellipsis', () => {
    expect(getEllipsisStyle(true)).toEqual({})
    expect(getEllipsisStyle(false)).toEqual({})
    expect(getEllipsisStyle(3)).toEqual({
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: 3,
      overflow: 'hidden',
    })
  })

  it('should map level to render tag', () => {
    expect(getTextTag('h1')).toBe('h1')
    expect(getTextTag('h6')).toBe('h6')
    expect(getTextTag('p')).toBe('p')
    // caption 渲染为 span（行内小字，非语义标题）
    expect(getTextTag('caption')).toBe('span')
    expect(getTextTag(undefined)).toBe('p')
    expect(getTextTag('invalid' as never)).toBe('p')
  })

  it('should emit aria for expandable / copyable text', () => {
    expect(getTextAria({ expanded: true })).toEqual({ 'aria-expanded': true })
    expect(getTextAria({ copyButtonId: 'copy-1' })).toEqual({ 'aria-labelledby': 'copy-1' })
    expect(getTextAria()).toEqual({})
  })
})
