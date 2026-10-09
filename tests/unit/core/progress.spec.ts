import { describe, it, expect } from 'vitest'
import {
  clampPercent,
  resolveStatus,
  getProgressClassNames,
  getCircleCircumference,
  getProgressColor,
  formatPercentText,
  getProgressAria,
} from '../../../src/core/progress'

describe('Progress Core Logic', () => {
  it('clamps percent into [0, 100]', () => {
    expect(clampPercent(50)).toBe(50)
    expect(clampPercent(-10)).toBe(0)
    expect(clampPercent(120)).toBe(100)
    expect(clampPercent(NaN)).toBe(0)
  })

  it('resolves success automatically when reaching 100', () => {
    expect(resolveStatus(100, 'normal')).toBe('success')
    expect(resolveStatus(99, 'normal')).toBe('normal')
  })

  it('keeps explicit status over auto success', () => {
    expect(resolveStatus(100, 'exception')).toBe('exception')
    expect(resolveStatus(30, 'warning')).toBe('warning')
  })

  it('builds class names for line type', () => {
    const classes = getProgressClassNames({
      type: 'line',
      status: 'normal',
      showText: true,
      strokeWidth: 6,
      width: 126,
    })
    expect(classes).toEqual(['lh-progress', 'lh-progress--line'])
  })

  it('adds status and no-text classes', () => {
    const classes = getProgressClassNames({
      type: 'circle',
      status: 'exception',
      showText: false,
      strokeWidth: 6,
      width: 126,
    })
    expect(classes).toContain('lh-progress--circle')
    expect(classes).toContain('lh-progress--exception')
    expect(classes).toContain('lh-progress--no-text')
  })

  it('computes circle circumference from width and stroke width', () => {
    // 半径 = (126 - 6) / 2 = 60，周长 = 2πr
    expect(getCircleCircumference(126, 6)).toBeCloseTo(2 * Math.PI * 60, 5)
  })

  it('maps status to theme color tokens', () => {
    expect(getProgressColor('normal')).toBe('var(--lh-primary-color)')
    expect(getProgressColor('success')).toBe('var(--lh-success-color)')
    expect(getProgressColor('warning')).toBe('var(--lh-warning-color)')
    expect(getProgressColor('exception')).toBe('var(--lh-danger-color)')
  })

  it('prefers user color over status mapping', () => {
    expect(getProgressColor('success', '#ff0000')).toBe('#ff0000')
    expect(getProgressColor('normal', (p) => `hsl(${p}, 50%, 50%)`, 40)).toBe('hsl(40, 50%, 50%)')
  })

  it('formats percent text as rounded integer', () => {
    expect(formatPercentText(66.6)).toBe('67%')
    expect(formatPercentText(0)).toBe('0%')
  })
})

describe('LhProgress accessibility', () => {
  it('emits role=progressbar with the value range', () => {
    expect(getProgressAria({ percentage: 60, label: '上传进度' })).toEqual({
      role: 'progressbar',
      'aria-valuenow': 60,
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-label': '上传进度',
    })
  })
})