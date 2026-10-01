import { describe, it, expect } from 'vitest'
import { getDescriptionsClassNames, buildDescriptionRows } from '../../../src/core/descriptions'
import type { LhDescriptionsItem } from '../../../src/core/descriptions'

describe('Descriptions Core Logic', () => {
  const items: LhDescriptionsItem[] = [
    { label: '名称', value: '青花瓷' },
    { label: '年代', value: '元' },
    { label: '釉色', value: '青白' },
  ]

  it('builds base and border class names', () => {
    expect(getDescriptionsClassNames({ column: 3, border: false })).toEqual(['lh-descriptions'])
    expect(getDescriptionsClassNames({ column: 3, border: true })).toContain(
      'lh-descriptions--border'
    )
  })

  it('splits items into rows by column', () => {
    const rows = buildDescriptionRows(items, 2)
    expect(rows).toHaveLength(2)
    expect(rows[0].cells.map((c) => c.item.label)).toEqual(['名称', '年代'])
    expect(rows[1].cells.map((c) => c.item.label)).toEqual(['釉色'])
  })

  it('reports filler cells for the last incomplete row', () => {
    const rows = buildDescriptionRows(items, 2)
    expect(rows[1].filler).toBe(1)
    expect(rows[0].filler).toBe(0)
  })

  it('produces no filler when items exactly fill rows', () => {
    const rows = buildDescriptionRows(items.slice(0, 2), 2)
    expect(rows).toHaveLength(1)
    expect(rows[0].filler).toBe(0)
  })

  it('honors span across the column width', () => {
    const rows = buildDescriptionRows(
      [
        { label: '简介', value: '长文本', span: 2 },
        { label: '年代', value: '元' },
      ],
      3
    )
    expect(rows).toHaveLength(1)
    expect(rows[0].cells[0].span).toBe(2)
    expect(rows[0].cells[1].span).toBe(1)
  })

  it('clamps span that overflows the current row', () => {
    const rows = buildDescriptionRows(
      [
        { label: 'A', value: 1 },
        { label: 'B', value: 2, span: 3 },
      ],
      3
    )
    // B 期望 3 列但本行只剩 2 列，钳制为 2；随后满行换行
    expect(rows[0].cells[1].span).toBe(2)
    expect(rows).toHaveLength(1)
  })

  it('treats invalid span as 1', () => {
    const rows = buildDescriptionRows(
      [
        { label: 'A', value: 1, span: 0 },
        { label: 'B', value: 2, span: NaN },
      ],
      3
    )
    expect(rows[0].cells[0].span).toBe(1)
    expect(rows[0].cells[1].span).toBe(1)
    expect(rows[0].filler).toBe(1)
  })

  it('falls back to column 1 on invalid column input', () => {
    const rows = buildDescriptionRows(items.slice(0, 1), 0)
    expect(rows).toHaveLength(1)
    expect(rows[0].cells).toHaveLength(1)
  })
})
