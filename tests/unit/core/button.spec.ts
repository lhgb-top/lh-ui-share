import { describe, it, expect } from 'vitest'
import { isClickable, getSize, getClassNames, getStyle } from '../../../src/core/button/logic'

describe('button/core/logic', () => {
	describe('isClickable', () => {
		it('returns true when clickable', () => {
			expect(isClickable({ loading: false, disabled: false })).toBe(true)
		})

		it('returns false when loading', () => {
			expect(isClickable({ loading: true, disabled: false })).toBe(false)
		})

		it('returns false when disabled', () => {
			expect(isClickable({ loading: false, disabled: true })).toBe(false)
		})

		it('returns false when both loading and disabled', () => {
			expect(isClickable({ loading: true, disabled: true })).toBe(false)
		})
	})

	describe('getSize', () => {
		it('uses local size when provided', () => {
			expect(getSize('small', 'large')).toBe('small')
		})

		it('uses global size when local is undefined', () => {
			expect(getSize(undefined, 'large')).toBe('large')
		})

		it('uses default size when both are undefined', () => {
			expect(getSize(undefined, undefined)).toBe('medium')
		})
	})

	describe('getClassNames', () => {
		it('builds correct base classes', () => {
			const state = {
				type: 'primary',
				size: 'medium',
				loading: false,
				disabled: false,
				plain: false,
				block: false,
				round: false,
				circle: false,
			}
			const classes = getClassNames(state)
			expect(classes).toContain('lh-button')
			expect(classes).toContain('lh-button--primary')
			expect(classes).toContain('lh-button--medium')
		})

		it('includes plain modifier', () => {
			const state = {
				type: 'default',
				size: 'small',
				loading: false,
				disabled: false,
				plain: true,
				block: false,
				round: false,
				circle: false,
			}
			expect(getClassNames(state)).toContain('lh-button--plain')
		})

		it('includes block modifier', () => {
			const state = {
				type: 'default',
				size: 'large',
				loading: false,
				disabled: false,
				plain: false,
				block: true,
				round: false,
				circle: false,
			}
			expect(getClassNames(state)).toContain('lh-button--block')
		})

		it('includes round modifier', () => {
			const state = {
				type: 'default',
				size: 'medium',
				loading: false,
				disabled: false,
				plain: false,
				block: false,
				round: true,
				circle: false,
			}
			expect(getClassNames(state)).toContain('lh-button--round')
		})

		it('includes circle modifier', () => {
			const state = {
				type: 'default',
				size: 'medium',
				loading: false,
				disabled: false,
				plain: false,
				block: false,
				round: false,
				circle: true,
			}
			expect(getClassNames(state)).toContain('lh-button--circle')
		})

		it('includes loading and disabled modifiers', () => {
			const state = {
				type: 'primary',
				size: 'medium',
				loading: true,
				disabled: true,
				plain: false,
				block: false,
				round: false,
				circle: false,
			}
			expect(getClassNames(state)).toContain('lh-button--loading')
			expect(getClassNames(state)).toContain('lh-button--disabled')
		})

		it('filters out falsy modifiers', () => {
			const classes = getClassNames({
				type: 'default',
				size: 'medium',
				loading: false,
				disabled: false,
				plain: false,
				block: false,
				round: false,
				circle: false,
			})
			expect(classes).not.toContain('lh-button--plain')
			expect(classes).not.toContain('lh-button--loading')
			expect(classes).not.toContain('lh-button--disabled')
		})
	})

	describe('getStyle', () => {
		it('returns empty object', () => {
			expect(getStyle()).toEqual({})
		})
	})
})