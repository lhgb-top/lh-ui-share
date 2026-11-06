import { describe, it, expect } from 'vitest'
import {
  getWordCount,
  shouldShowWordLimit,
  clampString,
  getInputStyle,
  getInputAria,
  isInputLabelFloating,
  getInputLabelClassNames,
  getInputWrapperModifiers,
} from '../../../src/core/input/logic'

describe('input/core/logic', () => {
	describe('getWordCount', () => {
		it('returns word count formatted correctly', () => {
			expect(getWordCount({ value: 'hello', maxlength: 10 })).toBe('5/10')
		})

		it('returns infinity symbol when no maxlength', () => {
			expect(getWordCount({ value: 'hi' })).toBe('2/∞')
		})

		it('handles empty string', () => {
			expect(getWordCount({ value: '', maxlength: 50 })).toBe('0/50')
		})

		it('handles undefined value before mount', () => {
			// 回归：react/uni 挂载前 value 可能为 undefined，曾直接崩溃
			expect(getWordCount({ value: undefined as unknown as string, maxlength: 10 })).toBe('0/10')
			expect(getWordCount({ value: undefined as unknown as string })).toBe('0/∞')
		})
	})

	describe('shouldShowWordLimit', () => {
		it('returns true when maxlength is set', () => {
			expect(shouldShowWordLimit({ value: '', maxlength: 100 })).toBe(true)
		})

		it('returns true when minlength is set', () => {
			expect(shouldShowWordLimit({ value: '', minlength: 2 })).toBe(true)
		})

		it('returns false when neither is set', () => {
			expect(shouldShowWordLimit({ value: '' })).toBe(false)
		})
	})

	describe('clampString', () => {
		it('clamps value to maxlength', () => {
			expect(clampString('hello world', 5)).toBe('hello')
		})

		it('does not clamp when within limit', () => {
			expect(clampString('hi', 10)).toBe('hi')
		})

		it('returns value when no maxlength', () => {
			expect(clampString('very long string')).toBe('very long string')
		})
	})

	describe('getInputStyle', () => {
		it('returns mini style', () => {
			expect(getInputStyle('mini')).toEqual({ padding: '4px 8px', fontSize: '12px' })
		})

		it('returns small style', () => {
			expect(getInputStyle('small')).toEqual({ padding: '6px 10px', fontSize: '12px' })
		})

		it('returns medium style by default', () => {
			expect(getInputStyle('medium')).toEqual({ padding: '8px 12px', fontSize: '14px' })
		})

		it('returns large style', () => {
			expect(getInputStyle('large')).toEqual({ padding: '12px 16px', fontSize: '16px' })
		})

		it('returns medium style for unknown size', () => {
			expect(getInputStyle('unknown')).toEqual({ padding: '8px 12px', fontSize: '14px' })
		})
	})
})
describe('input accessibility', () => {
  it('binds label, description and validation semantics', () => {
    expect(getInputAria({})).toEqual({})
    expect(getInputAria({ label: '用户名', describedby: 'hint', invalid: true, required: true })).toEqual({
      'aria-label': '用户名',
      'aria-describedby': 'hint',
      'aria-invalid': true,
      'aria-required': true,
    })
  })
})

describe('input label position', () => {
	describe('isInputLabelFloating', () => {
		it('floats when focused even without value', () => {
			expect(isInputLabelFloating({ value: '', isFocused: true })).toBe(true)
		})

		it('floats with value and stays after blur (Material 3 behavior)', () => {
			expect(isInputLabelFloating({ value: '水墨', isFocused: false })).toBe(true)
		})

		it('does not float when blurred and empty', () => {
			expect(isInputLabelFloating({ value: '', isFocused: false })).toBe(false)
		})

		// 回归：react / uni 挂载前 state.value 可能是 undefined，`!== ''` 会误判为有值
		it('treats undefined value as empty (pre-mount state)', () => {
			expect(isInputLabelFloating({ value: undefined as unknown as string, isFocused: false })).toBe(false)
			expect(getInputWrapperModifiers({ value: undefined as unknown as string, label: '标签', labelPosition: 'float' })).not.toContain('lh-input__wrapper--has-value')
		})
	})

	describe('getInputLabelClassNames', () => {
		it('appends --float only for float position in floating state', () => {
			expect(getInputLabelClassNames({ value: '', isFocused: true, labelPosition: 'float' })).toEqual([
				'lh-input__label',
				'lh-input__label--float',
			])
		})

		it('no --float for float position when idle', () => {
			expect(getInputLabelClassNames({ value: '', isFocused: false, labelPosition: 'float' })).toEqual([
				'lh-input__label',
			])
		})

		it('static positions never float regardless of state', () => {
			for (const position of ['top', 'left', 'right', 'bottom'] as const) {
				expect(getInputLabelClassNames({ value: '有值', isFocused: true, labelPosition: position })).toEqual([
					'lh-input__label',
				])
			}
		})
	})

	describe('getInputWrapperModifiers', () => {
		it('emits has-label and position class, no has-value when empty', () => {
			expect(getInputWrapperModifiers({ value: '', label: '用户名', labelPosition: 'float' })).toEqual([
				'lh-input__wrapper--has-label',
				'lh-input__wrapper--label-float',
			])
		})

		it('emits has-value when value present', () => {
			expect(getInputWrapperModifiers({ value: 'x', label: '用户名', labelPosition: 'top' })).toEqual([
				'lh-input__wrapper--has-label',
				'lh-input__wrapper--has-value',
				'lh-input__wrapper--label-top',
			])
		})

		it('no has-label without label, static positions map to their class', () => {
			expect(getInputWrapperModifiers({ value: '', label: '', labelPosition: 'bottom' })).toEqual([
				'lh-input__wrapper--label-bottom',
			])
			expect(getInputWrapperModifiers({ value: '', label: '名', labelPosition: 'left' })).toContain(
				'lh-input__wrapper--label-left',
			)
			expect(getInputWrapperModifiers({ value: '', label: '名', labelPosition: 'right' })).toContain(
				'lh-input__wrapper--label-right',
			)
		})
	})
})