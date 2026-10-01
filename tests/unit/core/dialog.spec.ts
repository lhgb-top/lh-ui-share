import { describe, it, expect } from 'vitest'
import { canClose, getDialogStyle, getDialogPopperClass } from '../../../src/core/dialog/logic'

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
})