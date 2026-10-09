import { describe, expect, it } from 'vitest'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import {
  clampRate,
  getRateAria,
  getRateAriaText,
  getStarFill,
  stepRate,
} from '../../../src/core/rate'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('LhRate core', () => {
  it('clamps values', () => {
    expect(clampRate(undefined, 5)).toBe(0)
    expect(clampRate(-1, 5)).toBe(0)
    expect(clampRate(9, 5)).toBe(5)
    expect(clampRate(3.5, 5)).toBe(3.5)
  })

  it('steps by 1 or 0.5 with clamping', () => {
    expect(stepRate(3, 1, false, 5)).toBe(4)
    expect(stepRate(3, 1, true, 5)).toBe(3.5)
    expect(stepRate(0.5, -1, true, 5)).toBe(0)
    expect(stepRate(5, 1, false, 5)).toBe(5)
  })

  it('resolves star fill levels', () => {
    expect(getStarFill(3, 3, false)).toBe('full')
    expect(getStarFill(3, 4, false)).toBe('empty')
    expect(getStarFill(3.5, 4, true)).toBe('half')
    expect(getStarFill(2.4, 3, true)).toBe('empty')
  })

  it('formats aria text with {n}', () => {
    expect(getRateAriaText(4.5, '{n} 星')).toBe('4.5 星')
    expect(getRateAriaText(3, '{n} stars')).toBe('3 stars')
  })

  it('does not pull the locales singleton into the core bundle', () => {
    // 回归：rate 曾从 '../../locales' 引入 formatMessage，那会让
    // @lh-ui/share/core/rate 的消费者被迫执行 new LhLocale() 的模块级副作用。
    // 现在实现下沉到 core/shared/format，源码层面不得再出现对 locales 的引用
    const source = readFileSync(join(__dirname, '../../../src/core/rate/logic.ts'), 'utf8')
    expect(source).not.toMatch(/from\s+['"][^'"]*locales/)
    expect(source).toMatch(/from\s+['"]\.\.\/shared\/format['"]/)
  })
})

describe('LhRate accessibility', () => {
  it('emits role=slider with the rating range', () => {
    expect(getRateAria({ value: 3, max: 5 })).toEqual({
      role: 'slider',
      'aria-valuenow': 3,
      'aria-valuemin': 0,
      'aria-valuemax': 5,
    })
  })

  it('supports a readable value text and disabled state', () => {
    expect(getRateAria({ value: 4.5, max: 5, disabled: true, ariaValueText: '4.5 星' })).toEqual({
      role: 'slider',
      'aria-valuenow': 4.5,
      'aria-valuemin': 0,
      'aria-valuemax': 5,
      'aria-disabled': true,
      'aria-valuetext': '4.5 星',
    })
  })
})