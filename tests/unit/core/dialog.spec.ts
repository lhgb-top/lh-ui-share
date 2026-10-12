import { describe, it, expect } from 'vitest'
import {
  canClose,
  getDialogStyle,
  getDialogPopperClass,
  shouldTrapFocus,
  getDialogAria,
} from '../../../src/core/dialog/logic'

describe('dialog/core/logic', () => {
	describe('canClose', () => {
		it('allows close on modal click when enabled', () => {
			expect(canClose({ closeOnClickModal: true }, 'modalClick')).toBe(true)
		})

		it('prevents close on modal click when disabled', () => {
			expect(canClose({ closeOnClickModal: false }, 'modalClick')).toBe(false)
		})

		it('allows close on escape when enabled', () => {
			expect(canClose({ closeOnPressEscape: true }, 'escape')).toBe(true)
		})

		it('prevents close on escape when disabled', () => {
			expect(canClose({ closeOnPressEscape: false }, 'escape')).toBe(false)
		})

		it('allows close on escape by default', () => {
			// Esc 默认可关：对齐 drawer 的 closeOnEsc 默认 true 与两库 withDefaults 的显式 true
			expect(canClose({}, 'escape')).toBe(true)
		})
	})

	describe('getDialogStyle', () => {
		it('returns marginTop when position is top', () => {
			const style = getDialogStyle({ top: '20px', position: 'top' })
			expect(style.marginTop).toBe('20px')
		})

		it('returns marginTop when position is not set', () => {
			const style = getDialogStyle({ top: '20px' })
			expect(style.marginTop).toBe('20px')
		})

		it('does not return marginTop when position is center', () => {
			const style = getDialogStyle({ top: '20px', position: 'center' })
			expect(style.marginTop).toBeUndefined()
		})

		it('does not return marginTop when position is bottom', () => {
			const style = getDialogStyle({ top: '20px', position: 'bottom' })
			expect(style.marginTop).toBeUndefined()
		})

		it('returns zIndex when provided', () => {
			const style = getDialogStyle({ zIndex: 3000 })
			expect(style.zIndex).toBe('3000')
		})

		it('returns empty style when nothing is set', () => {
			expect(getDialogStyle({})).toEqual({})
		})
	})

	describe('getDialogPopperClass', () => {
		it('returns base class', () => {
			expect(getDialogPopperClass({ visible: false })).toContain('lh-dialog__popper')
		})

		it('adds visible class when visible', () => {
			expect(getDialogPopperClass({ visible: true })).toContain('lh-dialog__popper--visible')
		})

		it('does not add visible class when hidden', () => {
			const classes = getDialogPopperClass({ visible: false })
			expect(classes).not.toContain('lh-dialog__popper--visible')
		})
	})

	describe('focus trap wiring', () => {
		it('traps focus only when visible and scroll-locked', () => {
			expect(shouldTrapFocus({ visible: true, lockScroll: true })).toBe(true)
			expect(shouldTrapFocus({ visible: true, lockScroll: false })).toBe(false)
			expect(shouldTrapFocus({ visible: false, lockScroll: true })).toBe(false)
		})

		it('emits dialog aria attributes', () => {
			expect(getDialogAria({ id: 'd1', titleId: 't1' })).toEqual({
				role: 'dialog',
				'aria-modal': true,
				id: 'd1',
				'aria-labelledby': 't1',
			})
			expect(getDialogAria()).toEqual({ role: 'dialog', 'aria-modal': true })
		})
	})
})