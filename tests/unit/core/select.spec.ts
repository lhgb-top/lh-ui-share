import { describe, expect, it } from 'vitest'
import {
  findSelectOption,
  getNextEnabledIndex,
  getSelectListboxAria,
  getSelectOptionAria,
  getSelectOptionId,
  getSelectTriggerAria,
} from '../../../src/core/select'

describe('select/core/logic', () => {
  const options = [
    { label: 'One', value: 1 },
    { label: 'Two', value: 2, disabled: true },
    { label: 'Three', value: 3 },
  ]

  it('finds an option by value', () => {
    expect(findSelectOption(options, 3)?.label).toBe('Three')
    expect(findSelectOption(options, 4)).toBeUndefined()
  })

  it('skips disabled options and wraps around', () => {
    expect(getNextEnabledIndex(options, 0, 1)).toBe(2)
    expect(getNextEnabledIndex(options, 2, 1)).toBe(0)
    expect(getNextEnabledIndex(options, 0, -1)).toBe(2)
  })

  it('returns -1 when every option is disabled or the list is empty', () => {
    // 全禁用时曾返回 currentIndex，把焦点/高亮停在一个不可选项上
    const allDisabled = [
      { label: 'One', value: 1, disabled: true },
      { label: 'Two', value: 2, disabled: true },
    ]
    expect(getNextEnabledIndex(allDisabled, 0, 1)).toBe(-1)
    expect(getNextEnabledIndex(allDisabled, 1, -1)).toBe(-1)
    expect(getNextEnabledIndex([], 0, 1)).toBe(-1)
  })

  it('binds combobox aria attributes on the trigger', () => {
    expect(getSelectTriggerAria({ visible: true, listboxId: 'lb', highlightedIndex: 1 })).toEqual({
      role: 'combobox',
      'aria-expanded': true,
      'aria-controls': 'lb',
      'aria-haspopup': 'listbox',
      'aria-activedescendant': 'lb-option-1',
    })
    // 无高亮项时不输出 aria-activedescendant，避免引用失效 id
    expect(getSelectTriggerAria({ visible: false, highlightedIndex: -1 })).not.toHaveProperty(
      'aria-activedescendant',
    )
    // 回归：listboxId 存在但无高亮项时也不能产出 lb-option--1 这种失效 id
    expect(
      getSelectTriggerAria({ visible: true, listboxId: 'lb', highlightedIndex: -1 }),
    ).not.toHaveProperty('aria-activedescendant')
  })

  it('derives option ids from the listbox id', () => {
    expect(getSelectOptionId('lb', 0)).toBe('lb-option-0')
    expect(getSelectOptionId(undefined, 0)).toBeUndefined()
    // 回归：-1 表示无高亮，拼接出的 lb-option--1 在 DOM 里不存在
    expect(getSelectOptionId('lb', -1)).toBeUndefined()
    expect(getSelectOptionId('lb', 1.5)).toBeUndefined()
  })

  it('marks the listbox and its options', () => {
    expect(getSelectListboxAria('lb')).toEqual({ role: 'listbox', id: 'lb' })
    expect(getSelectOptionAria({ listboxId: 'lb', index: 0, selected: true })).toEqual({
      role: 'option',
      id: 'lb-option-0',
      'aria-selected': true,
    })
    expect(
      getSelectOptionAria({ listboxId: 'lb', index: 1, selected: false, disabled: true }),
    ).toEqual({ role: 'option', id: 'lb-option-1', 'aria-disabled': true })
  })
})
