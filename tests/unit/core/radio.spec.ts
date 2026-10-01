import { describe, expect, it } from 'vitest'
import { isRadioChecked, getRadioClassNames } from '../../../src/core/radio'

describe('radio/core/logic', () => {
  it('checks value with Object.is semantics', () => {
    expect(isRadioChecked({ modelValue: 1, value: 1, checked: false })).toBe(true)
    expect(isRadioChecked({ modelValue: 'a', value: 'b', checked: false })).toBe(false)
    expect(isRadioChecked({ modelValue: NaN, value: NaN, checked: false })).toBe(true)
  })

  it('builds class names with type modifier', () => {
    expect(getRadioClassNames('')).toEqual(['lh-radio'])
    expect(getRadioClassNames('primary')).toEqual(['lh-radio', 'lh-radio--primary'])
  })
})