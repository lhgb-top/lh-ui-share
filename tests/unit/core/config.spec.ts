import { describe, it, expect } from 'vitest'
import { mergeConfig, getEffectiveSize, getEffectiveZIndex } from '../../../src/core/config/logic'
import { createDefaultConfig } from '../../../src/core/config/types'

describe('config/core/logic', () => {
	describe('createDefaultConfig', () => {
		it('returns default config', () => {
			expect(createDefaultConfig()).toEqual({
				size: undefined,
				zIndex: 2000,
				locale: 'zh-CN',
			})
		})
	})

	describe('mergeConfig', () => {
		it('merges with correct priority: local > global > defaults', () => {
			const result = mergeConfig(
				{ zIndex: 1500 },
				{ size: 'large' },
				{ locale: 'en-US' }
			)
			expect(result.zIndex).toBe(1500)
			expect(result.size).toBe('large')
			expect(result.locale).toBe('en-US')
		})

		it('local overrides global', () => {
			const result = mergeConfig(
				{},
				{ size: 'large', zIndex: 2500 },
				{ size: 'small' }
			)
			expect(result.size).toBe('small')
			expect(result.zIndex).toBe(2500)
		})

		it('falls back to defaults', () => {
			const result = mergeConfig({}, {}, {})
			expect(result.locale).toBe('zh-CN')
			expect(result.zIndex).toBe(2000)
		})
	})

	describe('getEffectiveSize', () => {
		it('uses local size when available', () => {
			expect(getEffectiveSize('small', 'large')).toBe('small')
		})

		it('uses global size when local is undefined', () => {
			expect(getEffectiveSize(undefined, 'large')).toBe('large')
		})

		it('returns undefined when both are undefined', () => {
			expect(getEffectiveSize(undefined, undefined)).toBeUndefined()
		})
	})

	describe('getEffectiveZIndex', () => {
		it('uses local zIndex when available', () => {
			expect(getEffectiveZIndex(3000, 2000)).toBe(3000)
		})

		it('uses global zIndex when local is undefined', () => {
			expect(getEffectiveZIndex(undefined, 2000)).toBe(2000)
		})
	})
})