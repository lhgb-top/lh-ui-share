import { describe, it, expect } from 'vitest'
import { mergeConfig, getEffectiveSize, getEffectiveZIndex, getEffectiveTheme } from '../../../src/core/config/logic'
import { createDefaultConfig, LH_THEME_DEFAULT } from '../../../src/core/config/types'
import { LH_THEME_PRESETS } from '../../../src/theme/themes'

describe('config/core/logic', () => {
	describe('createDefaultConfig', () => {
		it('returns default config', () => {
			expect(createDefaultConfig()).toEqual({
				size: undefined,
				zIndex: 2000,
				locale: 'zh-CN',
				theme: 'cerblue',
			})
		})
	})

	describe('LH_THEME_DEFAULT', () => {
		it('points at the first built-in preset (the SCSS default primary)', () => {
			expect(LH_THEME_DEFAULT).toBe(LH_THEME_PRESETS[0].name)
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
			expect(result.theme).toBe(LH_THEME_DEFAULT)
		})

		it('lets local theme override global', () => {
			const result = mergeConfig({}, { theme: 'shuimo' }, { theme: 'golden' })
			expect(result.theme).toBe('golden')
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

	describe('getEffectiveTheme', () => {
		it('uses local theme when available', () => {
			expect(getEffectiveTheme('golden', 'shuimo')).toBe('golden')
		})

		it('uses global theme when local is undefined', () => {
			expect(getEffectiveTheme(undefined, 'shuimo')).toBe('shuimo')
		})

		it('falls back to the default theme when both are undefined', () => {
			expect(getEffectiveTheme(undefined, undefined)).toBe(LH_THEME_DEFAULT)
		})
	})
})