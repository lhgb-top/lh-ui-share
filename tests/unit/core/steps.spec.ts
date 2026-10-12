import { describe, it, expect } from 'vitest'
import {
  getStepClassNames,
  getStepStatus,
  getStepsClassNames,
  getStepAria,
  getStepsLineLastIndices,
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
    expect(getStepClassNames({ status: 'process', clickable: false })).toEqual([
      'lh-steps__item',
      'lh-steps__item--process',
    ])
    expect(getStepClassNames({ status: 'error', clickable: true })).toEqual([
      'lh-steps__item',
      'lh-steps__item--error',
      'lh-steps__item--clickable',
    ])
  })

  it('marks the line-last item when the horizontal steps wrap', () => {
    expect(getStepClassNames({ status: 'finish', clickable: false, lineLast: true })).toContain(
      'lh-steps__item--line-last',
    )
    expect(getStepClassNames({ status: 'finish', clickable: false, lineLast: false })).not.toContain(
      'lh-steps__item--line-last',
    )
  })
})

describe('core/steps line breaking', () => {
  it('treats the sole item as line-last', () => {
    expect(getStepsLineLastIndices([0])).toEqual([0])
  })

  it('keeps every item on one line', () => {
    expect(getStepsLineLastIndices([0, 0, 0])).toEqual([2])
  })

  it('detects the last item of each wrapped line', () => {
    // 三行：[0,1] / [2,3] / [4]
    expect(getStepsLineLastIndices([0, 0, 20, 20, 40])).toEqual([1, 3, 4])
    // 两行：[0] / [1,2]
    expect(getStepsLineLastIndices([0, 30, 30])).toEqual([0, 2])
  })

  it('handles an empty list', () => {
    expect(getStepsLineLastIndices([])).toEqual([])
  })
})

describe('LhSteps accessibility', () => {
  it('marks the in-progress step', () => {
    expect(getStepAria('process')).toEqual({ 'aria-current': 'step' })
    expect(getStepAria('wait')).toEqual({})
    expect(getStepAria('finish')).toEqual({})
  })
})