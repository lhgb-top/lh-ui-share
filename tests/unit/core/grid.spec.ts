import { describe, expect, it } from 'vitest'
import {
  clampSpan,
  getColStyle,
  getGridColClassNames,
  getGridRowClassNames,
  normalizeColSize,
  resolveBreakpoint,
  resolveResponsiveSize,
} from '../../../src/core/grid'

describe('LhGrid core', () => {
  it('normalizes numeric and object sizes', () => {
    expect(normalizeColSize(12)).toEqual({ span: 12 })
    expect(normalizeColSize({ span: 8, offset: 4 })).toEqual({ span: 8, offset: 4 })
    expect(normalizeColSize(undefined)).toEqual({})
  })

  it('clamps spans into [0, 24]', () => {
    expect(clampSpan(30)).toBe(24)
    expect(clampSpan(-2)).toBe(0)
    expect(clampSpan(undefined)).toBe(0)
    expect(clampSpan(8.9)).toBe(8)
  })

  it('maps span + offset to grid-column', () => {
    // 纯 span 走 auto-placement（显式起点会让同行多列全部从 1 开始，被 grid 推成竖排）
    expect(getColStyle(8)).toEqual({ gridColumn: 'span 8' })
    expect(getColStyle({ span: 8, offset: 4 })).toEqual({ gridColumn: '5 / span 8' })
    expect(getColStyle(undefined)).toEqual({ gridColumn: 'span 24' })
  })

  it('keeps an offset-only column full width (used only for positioning)', () => {
    // span 0 = 定位哨兵：从起点延伸到栅格末行，而不是 `span 24` 越界生成隐式轨道
    expect(getColStyle({ offset: 6 })).toEqual({ gridColumn: '7 / 25' })
    // 显式 span 仍按 span N 表达
    expect(getColStyle({ offset: 6, span: 8 })).toEqual({ gridColumn: '7 / span 8' })
  })

  it('computes class names', () => {
    expect(getGridRowClassNames({ justify: 'center', align: 'middle', wrap: false })).toEqual([
      'lh-row',
      'lh-row--center',
      'lh-row--middle',
      'lh-row--nowrap',
    ])
    expect(getGridColClassNames({ span: 8, offset: 2 })).toEqual(['lh-col', 'lh-col--8', 'lh-col--offset-2'])
  })

  it('align 的 center 走 --middle 别名，与 justify 的 center 不撞车', () => {
    // justify/align 同为 center：两轴各一个修饰类，不重复
    expect(getGridRowClassNames({ justify: 'center', align: 'center' })).toEqual([
      'lh-row',
      'lh-row--center',
      'lh-row--middle',
    ])
  })

  it('未知 justify/align 值不产出无样式定义的脏类', () => {
    expect(getGridRowClassNames({ justify: 'foo', align: 'bar' })).toEqual(['lh-row'])
  })
  it('resolves breakpoints from viewport width (Tailwind thresholds)', () => {
    expect(resolveBreakpoint(0)).toBe('xs')
    expect(resolveBreakpoint(639)).toBe('xs')
    expect(resolveBreakpoint(640)).toBe('sm')
    expect(resolveBreakpoint(767)).toBe('sm')
    expect(resolveBreakpoint(768)).toBe('md')
    expect(resolveBreakpoint(1024)).toBe('lg')
    expect(resolveBreakpoint(1280)).toBe('xl')
  })

  it('falls back downward through breakpoints for responsive sizes', () => {
    // 命中声明的档位
    expect(resolveResponsiveSize({ md: 12 }, 'md')).toBe(12)
    // 当前档未声明 → 向下回退
    expect(resolveResponsiveSize({ sm: 8 }, 'lg')).toBe(8)
    // xs 恒兜底
    expect(resolveResponsiveSize({ xs: 24 }, 'xl')).toBe(24)
    // 无定义返回 undefined
    expect(resolveResponsiveSize({ sm: 8 }, 'xs')).toBeUndefined()
    expect(resolveResponsiveSize(undefined, 'md')).toBeUndefined()
    // 对象尺寸同样透传
    expect(resolveResponsiveSize({ md: { span: 6, offset: 2 } }, 'lg')).toEqual({ span: 6, offset: 2 })
  })

  it('maps push / pull onto the grid-column start line', () => {
    expect(getColStyle({ span: 8, push: 4 })).toEqual({ gridColumn: '5 / span 8' })
    expect(getColStyle({ span: 8, offset: 2, pull: 1 })).toEqual({ gridColumn: '2 / span 8' })
    // 起点钳制 ≥ 1
    expect(getColStyle({ span: 8, pull: 5 })).toEqual({ gridColumn: '1 / span 8' })
  })
})
