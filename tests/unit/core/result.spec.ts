import { describe, it, expect } from 'vitest'
import {
  LH_RESULT_STATUS_CONST,
  getResultClassNames,
  getResultIconName,
  isValidResultStatus,
} from '../../../src/core/result'

describe('Result Core Logic', () => {
  it('暴露全部四个合法状态', () => {
    expect(LH_RESULT_STATUS_CONST).toEqual(['success', 'warning', 'info', 'error'])
  })

  it('isValidResultStatus 只认四个状态', () => {
    expect(isValidResultStatus('success')).toBe(true)
    expect(isValidResultStatus('error')).toBe(true)
    expect(isValidResultStatus('danger')).toBe(false)
    expect(isValidResultStatus('')).toBe(false)
  })

  it('getResultClassNames 生成基类与状态修饰类', () => {
    expect(getResultClassNames({ status: 'success' })).toEqual([
      'lh-result',
      'lh-result--success',
    ])
    expect(getResultClassNames({ status: 'warning' })).toContain('lh-result--warning')
    expect(getResultClassNames({ status: 'info' })).toContain('lh-result--info')
    expect(getResultClassNames({ status: 'error' })).toContain('lh-result--error')
  })

  it('getResultIconName 回退状态默认图标', () => {
    expect(getResultIconName('success')).toBe('check')
    expect(getResultIconName('warning')).toBe('warning')
    expect(getResultIconName('error')).toBe('error')
    expect(getResultIconName('info')).toBe('info')
  })

  it('getResultIconName 自定义图标优先', () => {
    expect(getResultIconName('success', 'home')).toBe('home')
    expect(getResultIconName('error', undefined)).toBe('error')
  })
})
