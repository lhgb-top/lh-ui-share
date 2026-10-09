import { describe, expect, it } from 'vitest'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import {
  clampDateToRange,
  getCalendarClassNames,
  isCalendarDateDisabled,
  getCalendarCellAria,
  isCalendarInSpan,
  isCalendarSelected,
  normalizeCalendarSpan,
  shiftCalendarDate,
  shiftCalendarMonth,
  toggleCalendarDate,
} from '../../../src/core/calendar'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('LhCalendar core', () => {
  it('shifts dates without cross-month overflow', () => {
    expect(shiftCalendarDate(new Date(2026, 0, 1), -1).getDate()).toBe(31)
    expect(shiftCalendarDate(new Date(2026, 0, 31), 1).getMonth()).toBe(1)
  })

  it('shifts months across year boundaries', () => {
    expect(shiftCalendarMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 })
    expect(shiftCalendarMonth(2025, 11, 1)).toEqual({ year: 2026, month: 0 })
  })

  it('disables dates outside the optional range', () => {
    const range: [Date, Date] = [new Date(2026, 0, 2), new Date(2026, 0, 29)]
    expect(isCalendarDateDisabled(new Date(2026, 0, 1), range)).toBe(true)
    expect(isCalendarDateDisabled(new Date(2026, 0, 15), range)).toBe(false)
    expect(isCalendarDateDisabled(new Date(2026, 0, 15), undefined)).toBe(false)
  })

  it('clamps dates into the range', () => {
    const range: [Date, Date] = [new Date(2026, 0, 2), new Date(2026, 0, 29)]
    expect(clampDateToRange(new Date(2025, 5, 1), range)).toEqual(range[0])
    expect(clampDateToRange(new Date(2027, 5, 1), range)).toEqual(range[1])
  })

  it('normalizes a reversed range before clamping (round 2)', () => {
    // 回归：isCalendarDateDisabled 会归一反序 range，clampDateToRange 曾直接用
    // range[0]/range[1] 原始顺序，键盘导航会钳到错误一端
    const mar5 = new Date(2026, 2, 5)
    const mar10 = new Date(2026, 2, 10)
    const reversed: [Date, Date] = [mar10, mar5]
    expect(clampDateToRange(new Date(2026, 2, 7), reversed)).toEqual(new Date(2026, 2, 7))
    expect(clampDateToRange(new Date(2026, 2, 1), reversed)).toEqual(mar5)
    expect(clampDateToRange(new Date(2026, 2, 20), reversed)).toEqual(mar10)
  })

  it('covers span / selection / multi-select helpers (round 2)', () => {
    expect(getCalendarClassNames()).toEqual(['lh-calendar'])
    const a = new Date(2026, 0, 5)
    const b = new Date(2026, 0, 10)
    // 反序归一
    expect(normalizeCalendarSpan(b, a)).toEqual([a, b])
    // 选中判定（同日、空选）
    expect(isCalendarSelected(new Date(2026, 0, 5), new Date(2026, 0, 5))).toBe(true)
    expect(isCalendarSelected(new Date(2026, 0, 6), new Date(2026, 0, 5))).toBe(false)
    expect(isCalendarSelected(new Date(2026, 0, 5), null)).toBe(false)
    // 闭区间命中；任一端为 null 恒 false
    expect(isCalendarInSpan(new Date(2026, 0, 7), a, b)).toBe(true)
    expect(isCalendarInSpan(a, a, b)).toBe(true)
    expect(isCalendarInSpan(new Date(2026, 0, 11), a, b)).toBe(false)
    expect(isCalendarInSpan(new Date(2026, 0, 7), null, b)).toBe(false)
    // 多选切换：命中移除，否则加入并按时间排序
    expect(toggleCalendarDate([a], a)).toEqual([])
    expect(toggleCalendarDate([b], a)).toEqual([a, b])
    expect(toggleCalendarDate([a, b], b)).toEqual([a])
  })

  it('sources date primitives from shared/date, not from the date-picker component', () => {
    // 回归：calendar 曾从 '../date-picker' 引入 compareDate / isDateDisabled /
    // isSameDay，那是同级组件间的耦合；通用原语已下沉到 core/shared/date
    const source = readFileSync(join(__dirname, '../../../src/core/calendar/logic.ts'), 'utf8')
    expect(source).toMatch(/from\s+['"]\.\.\/shared\/date['"]/)
    // generateCalendarDays 的再导出是语义性依赖（日历网格是 date-picker 的职责），保留
    expect(source).toMatch(/export\s+\{[^}]*generateCalendarDays[^}]*\}\s+from\s+['"]\.\.\/date-picker['"]/)
  })
})

describe('LhCalendar accessibility', () => {
  it('marks the selected day and disabled days', () => {
    const selected = new Date(2026, 0, 15)
    expect(getCalendarCellAria({ date: selected, selected })).toEqual({
      'aria-current': 'date',
    })
    expect(getCalendarCellAria({ date: new Date(2026, 0, 16), selected })).toEqual({})
  })

  it('marks days outside the selectable range as disabled', () => {
    const range = [new Date(2026, 0, 10), new Date(2026, 0, 20)]
    expect(getCalendarCellAria({ date: new Date(2026, 0, 5), selected: null, range })).toEqual({
      'aria-disabled': true,
    })
  })
})