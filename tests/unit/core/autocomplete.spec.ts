import { describe, it, expect } from 'vitest'
import {
  filterSuggestions,
  getAutocompleteListboxAria,
  getAutocompleteOptionAria,
  getAutocompleteOptionId,
  getAutocompleteOptionValue,
  getAutocompleteTriggerAria,
} from '../../../src/core/autocomplete'
import type { LhAutocompleteOption } from '../../../src/core/autocomplete'

const options: LhAutocompleteOption[] = [
  { label: '水墨', value: 'ink' },
  { label: '工笔', value: 'fine-brush' },
  { label: '写意', value: 'freehand' },
  { label: '青绿山水', value: 'blue-green' },
]

describe('Autocomplete Core Logic', () => {
  it('should filter by label inclusion, case-insensitive by default', () => {
    expect(filterSuggestions(options, '水').map((o) => o.label)).toEqual(['水墨', '青绿山水'])
    expect(filterSuggestions(options, '山').map((o) => o.label)).toEqual(['青绿山水'])
    // 大小写不敏感（拉丁字符）
    const latin: LhAutocompleteOption[] = [{ label: 'Apple' }, { label: 'Banana' }]
    expect(filterSuggestions(latin, 'ap').map((o) => o.label)).toEqual(['Apple'])
  })

  it('should support case-sensitive matching', () => {
    const latin: LhAutocompleteOption[] = [{ label: 'Apple' }, { label: 'apple' }]
    expect(filterSuggestions(latin, 'Ap', { caseSensitive: true }).map((o) => o.label)).toEqual(['Apple'])
  })

  it('should trim query by default and keep raw when disabled', () => {
    expect(filterSuggestions(options, '  水墨  ').map((o) => o.label)).toEqual(['水墨'])
    // trim: false 时空格参与匹配，不命中任何 label
    expect(filterSuggestions(options, '  水墨  ', { trim: false })).toHaveLength(0)
  })

  it('should return all options for empty query', () => {
    expect(filterSuggestions(options, '')).toHaveLength(4)
    expect(filterSuggestions(options, '   ')).toHaveLength(4)
  })

  it('should keep disabled options visible in the list', () => {
    // 过滤只管可见性，禁用项保留交由 UI 层禁止选中
    const withDisabled = [...options, { label: '禁用项', disabled: true }]
    expect(filterSuggestions(withDisabled, '禁').map((o) => o.label)).toEqual(['禁用项'])
  })

  it('should support custom matcher', () => {
    // 拼音首字母示例：自定义判定返回 true 即保留
    const byPinyin = (option: LhAutocompleteOption, query: string) =>
      query === 'sm' && option.label === '水墨'
    expect(filterSuggestions(options, 'sm', { matcher: byPinyin }).map((o) => o.label)).toEqual([
      '水墨',
    ])
  })

  it('should build deterministic option ids', () => {
    expect(getAutocompleteOptionId('lb', 0)).toBe('lb-option-0')
    expect(getAutocompleteOptionId('lb', 3)).toBe('lb-option-3')
    // 负数 / 非整数下标不产出 id（避免引用不存在的 DOM）
    expect(getAutocompleteOptionId('lb', -1)).toBeUndefined()
    expect(getAutocompleteOptionId('lb', 1.5)).toBeUndefined()
    expect(getAutocompleteOptionId(undefined, 0)).toBeUndefined()
  })

  it('should build combobox trigger aria with activedescendant', () => {
    const aria = getAutocompleteTriggerAria({ visible: true, listboxId: 'lb', highlightedIndex: 2 })
    expect(aria.role).toBe('combobox')
    expect(aria['aria-expanded']).toBe(true)
    expect(aria['aria-controls']).toBe('lb')
    expect(aria['aria-haspopup']).toBe('listbox')
    expect(aria['aria-activedescendant']).toBe('lb-option-2')
    // 无高亮时不引用失效 id
    const ariaNoHighlight = getAutocompleteTriggerAria({
      visible: false,
      listboxId: 'lb',
      highlightedIndex: -1,
    })
    expect(ariaNoHighlight['aria-activedescendant']).toBeUndefined()
    expect(ariaNoHighlight['aria-expanded']).toBe(false)
  })

  it('should build listbox and option aria', () => {
    expect(getAutocompleteListboxAria('lb')).toEqual({ role: 'listbox', id: 'lb' })
    expect(getAutocompleteListboxAria()).toEqual({ role: 'listbox' })
    expect(getAutocompleteOptionAria({ listboxId: 'lb', index: 1, highlighted: true, disabled: false })).toEqual(
      { role: 'option', 'aria-selected': true },
    )
    expect(
      getAutocompleteOptionAria({ listboxId: 'lb', index: 1, highlighted: false, disabled: true }),
    ).toEqual({ role: 'option', 'aria-selected': false, 'aria-disabled': true })
  })

  it('should fall back to label as option value', () => {
    expect(getAutocompleteOptionValue({ label: 'a' })).toBe('a')
    expect(getAutocompleteOptionValue({ label: 'a', value: 1 })).toBe(1)
    expect(getAutocompleteOptionValue({ label: 'a', value: 'x' })).toBe('x')
  })
})
