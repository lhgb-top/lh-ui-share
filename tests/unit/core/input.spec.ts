import { describe, it, expect } from 'vitest'
import { getWordCount, shouldShowWordLimit, clampString, getInputStyle } from '../../../src/core/input/logic'

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