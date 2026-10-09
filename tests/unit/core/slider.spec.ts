import { describe, it, expect } from 'vitest'
import {
  clampValue,
  getSliderThumbAria,
  snapToStep,
  clampAndSnap,
  getValueFromPosition,
  getPositionFromValue,
  getSliderClassNames,
  getInitialValue,
  buildMarksList,
} from '../../../src/core/slider'

describe('Slider Core Logic', () => {
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

  describe('snapToStep', () => {
    it('should snap to nearest step', () => {
      expect(snapToStep(3, 0, 2)).toBe(4)
    })

    it('should already be on step', () => {
      expect(snapToStep(4, 0, 2)).toBe(4)
    })
  })

  describe('clampAndSnap', () => {
    it('should clamp and snap', () => {
      expect(clampAndSnap(11, 0, 10, 2)).toBe(10)
    })
  })

  describe('getValueFromPosition', () => {
    it('should get value at 0%', () => {
      expect(getValueFromPosition(0, 0, 100, 1)).toBe(0)
    })

    it('should get value at 50%', () => {
      expect(getValueFromPosition(0.5, 0, 100, 1)).toBe(50)
    })

    it('should get value at 100%', () => {
      expect(getValueFromPosition(1, 0, 100, 1)).toBe(100)
    })
  })

  describe('getPositionFromValue', () => {
    it('should get 0% for min', () => {
      expect(getPositionFromValue(0, 0, 100)).toBe(0)
    })

    it('should get 50% for midpoint', () => {
      expect(getPositionFromValue(50, 0, 100)).toBe(0.5)
    })

    it('should get 100% for max', () => {
      expect(getPositionFromValue(100, 0, 100)).toBe(1)
    })

    it('should handle min === max', () => {
      expect(getPositionFromValue(50, 50, 50)).toBe(0)
    })
  })

  describe('getSliderClassNames', () => {
    it('should return base class', () => {
      const state = {
        value: 0,
        min: 0,
        max: 100,
        step: 1,
        disabled: false,
        range: false,
        showInput: false,
        size: 'medium' as const,
        marks: undefined,
      }
      expect(getSliderClassNames(state)).toContain('lh-slider')
    })

    it('should include disabled class', () => {
      const state = {
        value: 0,
        min: 0,
        max: 100,
        step: 1,
        disabled: true,
        range: false,
        showInput: false,
        size: 'medium' as const,
        marks: undefined,
      }
      expect(getSliderClassNames(state)).toContain('lh-slider--disabled')
    })

    it('should include range class', () => {
      const state = {
        value: [0, 50],
        min: 0,
        max: 100,
        step: 1,
        disabled: false,
        range: true,
        showInput: false,
        size: 'medium' as const,
        marks: undefined,
      }
      expect(getSliderClassNames(state)).toContain('lh-slider--range')
    })
  })

  describe('getInitialValue', () => {
    it('should return clamped single value', () => {
      const state = {
        value: 50,
        min: 0,
        max: 100,
        step: 1,
        disabled: false,
        range: false,
        showInput: false,
        size: 'medium' as const,
        marks: undefined,
      }
      expect(getInitialValue(state)).toBe(50)
    })

    it('should return range with defaults', () => {
      const state = {
        value: null,
        min: 0,
        max: 100,
        step: 1,
        disabled: false,
        range: true,
        showInput: false,
        size: 'medium' as const,
        marks: undefined,
      }
      expect(getInitialValue(state)).toEqual([0, 50])
    })
  })

  describe('buildMarksList', () => {
    it('should return empty array for undefined', () => {
      expect(buildMarksList(undefined)).toEqual([])
    })

    it('should build sorted marks list', () => {
      const marks = { 100: 'High', 0: 'Low', 50: 'Mid' }
      const result = buildMarksList(marks)
      expect(result).toHaveLength(3)
      expect(result[0].value).toBe(0)
      expect(result[1].value).toBe(50)
      expect(result[2].value).toBe(100)
    })
  })

  it('falls back to pure clamping for invalid steps (round 2)', () => {
    // 回归：step=0 时 (v-min) % 0 为 NaN，曾把 NaN 一路送进滑块值
    expect(clampAndSnap(50, 0, 100, 0)).toBe(50)
    expect(clampAndSnap(50, 0, 100, NaN)).toBe(50)
    expect(clampAndSnap(50, 0, 100, -10)).toBe(50)
    // 合法 step 不受影响
    expect(clampAndSnap(50, 0, 100, 10)).toBe(50)
  })
})
describe('slider accessibility', () => {
  it('emits role=slider with the value range', () => {
    expect(getSliderThumbAria({ value: 30, min: 0, max: 100 })).toEqual({
      role: 'slider',
      'aria-valuenow': 30,
      'aria-valuemin': 0,
      'aria-valuemax': 100,
    })
  })

  it('adds orientation, disabled and readable value text', () => {
    expect(
      getSliderThumbAria({ value: 30, min: 0, max: 100, vertical: true, ariaValueText: '30%' }),
    ).toEqual({
      role: 'slider',
      'aria-valuenow': 30,
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-orientation': 'vertical',
      'aria-valuetext': '30%',
    })
  })
})