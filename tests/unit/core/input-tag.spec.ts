import { describe, it, expect } from 'vitest'
import {
  LH_INPUT_TAG_TRIGGER_CONST,
  getInputTagClassNames,
  insertInputTag,
  isInputTagTriggerKey,
  isValidInputTagTrigger,
  removeInputTag,
  removeLastInputTag,
} from '../../../src/core/input-tag'

describe('InputTag Core Logic', () => {
  it('暴露三个触发键', () => {
    expect(LH_INPUT_TAG_TRIGGER_CONST).toEqual(['enter', 'space', 'comma'])
  })

  it('isValidInputTagTrigger 只认三个触发键', () => {
    expect(isValidInputTagTrigger('enter')).toBe(true)
    expect(isValidInputTagTrigger('space')).toBe(true)
    expect(isValidInputTagTrigger('comma')).toBe(true)
    expect(isValidInputTagTrigger('tab')).toBe(false)
  })

  it('getInputTagClassNames 基础类与状态修饰', () => {
    expect(getInputTagClassNames({})).toEqual(['lh-input-tag'])
    expect(getInputTagClassNames({ disabled: true })).toEqual([
      'lh-input-tag',
      'lh-input-tag--disabled',
    ])
    expect(getInputTagClassNames({ readonly: true })).toContain('lh-input-tag--readonly')
  })

  it('isInputTagTriggerKey 按触发键匹配键事件', () => {
    expect(isInputTagTriggerKey('Enter', 'enter')).toBe(true)
    expect(isInputTagTriggerKey('Enter', 'space')).toBe(false)
    expect(isInputTagTriggerKey(' ', 'space')).toBe(true)
    expect(isInputTagTriggerKey('Spacebar', 'space')).toBe(true)
    expect(isInputTagTriggerKey(',', 'comma')).toBe(true)
    expect(isInputTagTriggerKey(',', 'enter')).toBe(false)
  })

  it('insertInputTag 正常追加并返回新数组', () => {
    const tags = ['a']
    const result = insertInputTag(tags, ' b ', {})
    expect(result.inserted).toBe(true)
    expect(result.tags).toEqual(['a', 'b'])
    expect(result.reason).toBeUndefined()
    // 不可变：原数组不变
    expect(tags).toEqual(['a'])
  })

  it('insertInputTag 空串与纯空白不提交', () => {
    expect(insertInputTag(['a'], '', {}).inserted).toBe(false)
    expect(insertInputTag(['a'], '   ', {}).inserted).toBe(false)
    expect(insertInputTag(['a'], '', {}).reason).toBe('empty')
  })

  it('insertInputTag 默认禁重复', () => {
    const result = insertInputTag(['a'], 'a', {})
    expect(result.inserted).toBe(false)
    expect(result.reason).toBe('duplicate')
    expect(result.tags).toEqual(['a'])
  })

  it('insertInputTag allowDuplicate 允许重复', () => {
    expect(insertInputTag(['a'], 'a', { allowDuplicate: true }).inserted).toBe(true)
  })

  it('insertInputTag max 上限拦截', () => {
    expect(insertInputTag(['a', 'b'], 'c', { max: 2 }).inserted).toBe(false)
    expect(insertInputTag(['a', 'b'], 'c', { max: 2 }).reason).toBe('max')
    // max 非正数（含非法值）不限制
    expect(insertInputTag(['a'], 'b', { max: 0 }).inserted).toBe(true)
    expect(insertInputTag(['a'], 'b', { max: NaN }).inserted).toBe(true)
    // 只读到上限时仍然拦截（readonly 由 UI 层拦截输入，core 不二次判定）
  })

  it('removeInputTag 按下标删除并不可变', () => {
    const tags = ['a', 'b', 'c']
    expect(removeInputTag(tags, 1)).toEqual(['a', 'c'])
    expect(tags).toEqual(['a', 'b', 'c'])
  })

  it('removeInputTag 越界返回原数组', () => {
    const tags = ['a']
    expect(removeInputTag(tags, -1)).toBe(tags)
    expect(removeInputTag(tags, 1)).toBe(tags)
  })

  it('removeLastInputTag 删除末尾', () => {
    expect(removeLastInputTag(['a', 'b'])).toEqual(['a'])
    expect(removeLastInputTag([])).toEqual([])
  })
})
