import { describe, it, expect } from 'vitest'
import {
  getStepClassNames,
  getStepStatus,
  getStepsClassNames,
} from '../../../src/core/steps'

describe('core/steps', () => {
  it('derives status from the index vs current', () => {
    expect(getStepStatus({ index: 0, current: 2 })).toBe('finish')
    expect(getStepStatus({ index: 2, current: 2 })).toBe('process')
    expect(getStepStatus({ index: 3, current: 2 })).toBe('wait')
  })

  it('lets the forced status override the computed one', () => {
    expect(getStepStatus({ index: 0, current: 0, forced: 'error' })).toBe('error')
    expect(getStepStatus({ index: 3, current: 0, forced: 'finish' })).toBe('finish')
  })

  it('computes root class names by direction', () => {
    expect(getStepsClassNames('horizontal')).toEqual(['lh-steps', 'lh-steps--horizontal'])
    expect(getStepsClassNames('vertical')).toEqual(['lh-steps', 'lh-steps--vertical'])
  })

  it('computes step item class names by status and flags', () => {
    expect(getStepClassNames({ status: 'process', isLast: false, clickable: false })).toEqual([
      'lh-steps__item',
      'lh-steps__item--process',
    ])
    expect(getStepClassNames({ status: 'error', isLast: true, clickable: true })).toEqual([
      'lh-steps__item',
      'lh-steps__item--error',
      'lh-steps__item--last',
      'lh-steps__item--clickable',
    ])
  })
})
