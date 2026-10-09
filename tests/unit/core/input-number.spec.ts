import { describe, it, expect } from 'vitest'
import {
  clampValue,
  getInputNumberAria,
  incrementValue,
  decrementValue,
  shouldDisableIncrement,
  shouldDisableDecrement,
  getDisplayValue,
} from '../../../src/core/input-number'

describe('InputNumber Core Logic', () => {
  describe('clampValue', () => {
    it('should return value within range', () => {
      expect(clampValue(5, 0, 10)).toBe(5)
    })

    it('should clamp to min', () => {
      expect(clampValue(-5, 0, 10)).toBe(0)
    })

    it('should clamp to max', () => {
      expect(clampValue(15, 0, 10)).toBe(10)
    })
  })

  describe('incrementValue', () => {
    it('should increment from null', () => {
      expect(incrementValue(null, 1, 0, 10)).toBe(1)
    })

    it('should increment value', () => {
      expect(incrementValue(5, 1, 0, 10)).toBe(6)
    })

    it('should respect precision', () => {
      expect(incrementValue(1.1, 0.1, 0, 10, 1)).toBe(1.2)
    })

    it('should not exceed max', () => {
      expect(incrementValue(10, 1, 0, 10)).toBe(10)
    })
  })

  describe('decrementValue', () => {
    it('should decrement from null', () => {
      expect(decrementValue(null, 1, 0, 10)).toBe(0)
    })

    it('should decrement value', () => {
      expect(decrementValue(5, 1, 0, 10)).toBe(4)
    })

    it('should not go below min', () => {
      expect(decrementValue(0, 1, 0, 10)).toBe(0)
    })
  })

  describe('shouldDisableIncrement', () => {
    it('should disable when value equals max', () => {
      const state = {
        value: 10,
        min: 0,
        max: 10,
        step: 1,
        disabled: false,
        size: 'medium' as const,
        controls: true,
        precision: undefined,
        placeholder: '',
      }
      expect(shouldDisableIncrement(state)).toBe(true)
    })

    it('should not disable when value is below max', () => {
      const state = {
        value: 5,
        min: 0,
        max: 10,
        step: 1,
        disabled: false,
        size: 'medium' as const,
        controls: true,
        precision: undefined,
        placeholder: '',
      }
      expect(shouldDisableIncrement(state)).toBe(false)
    })

    it('should not disable when value is null', () => {
      const state = {
        value: null,
        min: 0,
        max: 10,
        step: 1,
        disabled: false,
        size: 'medium' as const,
        controls: true,
        precision: undefined,
        placeholder: '',
      }
      expect(shouldDisableIncrement(state)).toBe(false)
    })
  })

  describe('shouldDisableDecrement', () => {
    it('should disable when value equals min', () => {
      const state = {
        value: 0,
        min: 0,
        max: 10,
        step: 1,
        disabled: false,
        size: 'medium' as const,
        controls: true,
        precision: undefined,
        placeholder: '',
      }
      expect(shouldDisableDecrement(state)).toBe(true)
    })

    it('should not disable when value is above min', () => {
      const state = {
        value: 5,
        min: 0,
        max: 10,
        step: 1,
        disabled: false,
        size: 'medium' as const,
        controls: true,
        precision: undefined,
        placeholder: '',
      }
      expect(shouldDisableDecrement(state)).toBe(false)
    })
  })

  describe('getDisplayValue', () => {
    it('should return string of value', () => {
      expect(getDisplayValue(5, '')).toBe('5')
    })

    it('should return empty string when null', () => {
      expect(getDisplayValue(null, 'input...')).toBe('')
    })
  })

  it('guards NaN results and out-of-range precision (round 2)', () => {
    // 回归：NaN 步长/输入曾把 NaN 一路送进 value（NaN >= max 也不会禁用按钮）
    expect(incrementValue(NaN, 1, 0, 10)).toBe(0)
    expect(incrementValue(5, NaN, 0, 10)).toBe(0)
    expect(decrementValue(5, NaN, 2, 10)).toBe(2)
    // 回归：precision 为负或超大时 toFixed 曾同步抛 RangeError
    expect(() => incrementValue(5, 1, 0, 10, -1)).not.toThrow()
    expect(incrementValue(5, 1, 0, 10, -1)).toBe(6)
    expect(() => incrementValue(5, 1, 0, 10, 999)).not.toThrow()
    expect(incrementValue(5, 1, 0, 10, 999)).toBe(6)
  })
})
describe('input-number accessibility', () => {
  it('emits role=spinbutton with the value range', () => {
    expect(getInputNumberAria({ value: 5, min: 0, max: 10, step: 1 })).toEqual({
      role: 'spinbutton',
      'aria-valuenow': 5,
      'aria-valuemin': 0,
      'aria-valuemax': 10,
    })
  })

  it('skips valuenow for an empty value', () => {
    expect(getInputNumberAria({ value: null, min: 0, max: 10, step: 1 })).not.toHaveProperty(
      'aria-valuenow',
    )
  })

  it('supports a readable value text and disabled state', () => {
    expect(
      getInputNumberAria({ value: 5, min: 0, max: 10, step: 1, disabled: true, ariaValueText: '5 个' }),
    ).toEqual({
      role: 'spinbutton',
      'aria-valuenow': 5,
      'aria-valuemin': 0,
      'aria-valuemax': 10,
      'aria-disabled': true,
      'aria-valuetext': '5 个',
    })
  })
})