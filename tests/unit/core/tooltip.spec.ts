import { describe, it, expect } from 'vitest'
import {
  getPopperClass,
  getPopperStyle,
  getDefaultDelay,
  getTooltipPopperAria,
  getTooltipTriggerAria,
} from '../../../src/core/tooltip/logic'

describe('tooltip/core/logic', () => {
	describe('getPopperClass', () => {
		it('returns correct classes', () => {
			expect(getPopperClass({ effect: 'light', placement: 'top' })).toEqual([
				'lh-tooltip__popper',
				'lh-tooltip__popper--light',
				'lh-tooltip__popper--top',
			])
		})
	})

	describe('getPopperStyle', () => {
		it('returns maxWidth as px string for number', () => {
			expect(getPopperStyle({ maxWidth: 200 })).toEqual({ maxWidth: '200px' })
		})

		it('returns maxWidth as string', () => {
			expect(getPopperStyle({ maxWidth: '300px' })).toEqual({ maxWidth: '300px' })
		})

		it('returns empty when maxWidth is not set', () => {
			expect(getPopperStyle({})).toEqual({})
		})
	})

	describe('getDefaultDelay', () => {
		it('returns defaults when not provided', () => {
			expect(getDefaultDelay(undefined, undefined)).toEqual({ show: 200, hide: 0 })
		})

		it('uses custom showDelay', () => {
			expect(getDefaultDelay(500, undefined)).toEqual({ show: 500, hide: 0 })
		})

		it('uses custom hideDelay', () => {
			expect(getDefaultDelay(undefined, 300)).toEqual({ show: 200, hide: 300 })
		})
	})
})

describe('tooltip accessibility', () => {
  it('marks the popper as a tooltip with an id', () => {
    expect(getTooltipPopperAria('t1')).toEqual({ role: 'tooltip', id: 't1' })
    expect(getTooltipPopperAria()).toEqual({ role: 'tooltip' })
  })

  it('links the trigger via aria-describedby', () => {
    expect(getTooltipTriggerAria('t1')).toEqual({ 'aria-describedby': 't1' })
    expect(getTooltipTriggerAria()).toEqual({})
  })
})
