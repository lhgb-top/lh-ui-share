import { describe, expect, it } from 'vitest'
import {
  buildHeaderCells,
  clampColumnWidth,
  computeVisibleRange,
  cycleSortOrder,
  filterTableRows,
  flattenLeafColumns,
  getCellValue,
  getColumnWidth,
  getGridTemplate,
  getHeaderStickyOffsets,
  getStickyOffsets,
  getTableCellClassNames,
  getTableClassNames,
  sortTableRows,
} from '../../../src/core/table'

describe('LhTable core', () => {
  it('computes the visible window with overscan', () => {
    const range = computeVisibleRange(480, 240, 48, 1000, 3)
    // first = 10，overscan 3 → start 7；可见 5 行 + 上下 3 行缓冲
    expect(range.start).toBe(7)
    expect(range.end).toBe(7 + 5 + 6)
    expect(range.offsetY).toBe(7 * 48)
    expect(range.totalHeight).toBe(48000)
  })

  it('handles empty and degenerate input', () => {
    expect(computeVisibleRange(0, 100, 48, 0)).toEqual({ start: 0, end: 0, offsetY: 0, totalHeight: 0 })
    expect(computeVisibleRange(0, 100, 0, 10).totalHeight).toBe(0)
  })

  it('clamps at the end of the list', () => {
    const range = computeVisibleRange(48 * 9, 240, 48, 10, 3)
    expect(range.end).toBe(10)
  })

  it('cycles sort order', () => {
    expect(cycleSortOrder(undefined)).toBe('asc')
    expect(cycleSortOrder('asc')).toBe('desc')
    expect(cycleSortOrder('desc')).toBeUndefined()
  })

  it('sorts rows ascending / descending with null values last', () => {
    const rows = [{ n: 3 }, { n: 1 }, { n: null }, { n: 2 }]
    expect(sortTableRows(rows, 'n', 'asc').map((r) => r.n)).toEqual([1, 2, 3, null])
    expect(sortTableRows(rows, 'n', 'desc').map((r) => r.n)).toEqual([3, 2, 1, null])
    expect(sortTableRows(rows, 'n', undefined)).toEqual(rows)
  })

  it('supports a custom sorter', () => {
    const rows = [{ n: 'a' }, { n: 'c' }, { n: 'b' }]
    const sorted = sortTableRows(rows, 'n', 'asc', (a, b) => String(b.n).localeCompare(String(a.n)))
    expect(sorted.map((r) => r.n)).toEqual(['c', 'b', 'a'])
  })

  it('resolves cell text with formatter priority', () => {
    const column = { prop: 'name', label: '名' }
    expect(getCellValue({ name: '甲' }, column)).toBe('甲')
    expect(getCellValue({ name: null }, column)).toBe('')
    expect(getCellValue({ name: 'x' }, { ...column, formatter: (_r, v) => `<${v}>` })).toBe('<x>')
  })

  it('builds grid template and column widths', () => {
    expect(getColumnWidth({ prop: 'a', label: 'A', width: 120 })).toBe('120px')
    expect(getColumnWidth({ prop: 'a', label: 'A', width: '20%' })).toBe('20%')
    expect(getColumnWidth({ prop: 'a', label: 'A' })).toBe('minmax(0, 1fr)')
    expect(
      getGridTemplate([
        { prop: 'a', label: 'A', width: 100 },
        { prop: 'b', label: 'B' },
      ]),
    ).toBe('100px minmax(0, 1fr)')
  })

  it('computes sticky offsets for left and right fixed columns', () => {
    const offsets = getStickyOffsets([
      { prop: 'a', label: 'A', width: 100, fixed: 'left' },
      { prop: 'b', label: 'B', width: 80, fixed: 'left' },
      { prop: 'c', label: 'C' },
      { prop: 'd', label: 'D', width: 60, fixed: 'right' },
    ])
    expect(offsets[0].left).toBe(0)
    expect(offsets[1].left).toBe(100)
    expect(offsets[2]).toEqual({})
    expect(offsets[3].right).toBe(0)
  })

  it('computes class names', () => {
    expect(getTableClassNames({ stripe: true, border: true, size: 'small', virtual: true })).toEqual([
      'lh-table',
      'lh-table--small',
      'lh-table--stripe',
      'lh-table--border',
      'lh-table--virtual',
    ])
    expect(getTableCellClassNames({ align: 'right', fixed: 'left', lastFixedLeft: true })).toEqual([
      'lh-table__cell',
      'lh-table__cell--right',
      'lh-table__cell--fixed-left',
      'lh-table__cell--fixed-left-last',
    ])
  })
  it('flattens leaf columns from nested config', () => {
    const columns = [
      { prop: 'a', label: 'A' },
      {
        prop: 'group', label: 'G', children: [
          { prop: 'b', label: 'B' },
          { prop: 'inner', label: 'I', children: [{ prop: 'c', label: 'C' }] },
        ],
      },
    ]
    expect(flattenLeafColumns(columns).map((c) => c.prop)).toEqual(['a', 'b', 'c'])
    // 平铺配置原样返回
    expect(flattenLeafColumns([{ prop: 'x', label: 'X' }])).toEqual([{ prop: 'x', label: 'X' }])
  })

  it('builds header cells with colspan and rowspan', () => {
    const columns = [
      { prop: 'a', label: 'A' },
      {
        prop: 'g', label: 'G', children: [
          { prop: 'b', label: 'B' },
          { prop: 'c', label: 'C' },
        ],
      },
    ]
    const cells = buildHeaderCells(columns)
    // 组头占 1 行 2 列；叶子 a 补齐 rowspan 2
    expect(cells.map((c) => [c.column.prop, c.level, c.colspan, c.rowspan, c.leafStart])).toEqual([
      ['a', 0, 1, 2, 0],
      ['g', 0, 2, 1, 1],
      ['b', 1, 1, 1, 1],
      ['c', 1, 1, 1, 2],
    ])
    // 平铺配置：单行、全 rowspan 1
    const flat = buildHeaderCells([{ prop: 'x', label: 'X' }, { prop: 'y', label: 'Y' }])
    expect(flat.every((c) => c.level === 0 && c.rowspan === 1 && c.isLeaf)).toBe(true)
  })

  it('computes header sticky offsets inheriting from fully-fixed leaf spans', () => {
    const leaf = [
      { prop: 'a', label: 'A', width: 100, fixed: 'left' as const },
      { prop: 'b', label: 'B', width: 120, fixed: 'left' as const },
      { prop: 'c', label: 'C' },
    ]
    const cells = buildHeaderCells([
      { prop: 'g', label: 'G', children: [leaf[0], leaf[1]] },
      leaf[2],
    ])
    // cells 序 = [g(组), a, b, c]，叶子偏移 a=0 / b=100 / c=无
    const offsets = getHeaderStickyOffsets(leaf, cells)
    expect(offsets[0].left).toBe(0)   // 组头叶子区间全 fixed 左 → 继承首叶子偏移
    expect(offsets[1].left).toBe(0)
    expect(offsets[2].left).toBe(100)
    expect(offsets[3]).toEqual({})    // c 不固定
    // 混合区组头（b 固定左 + c 不固定）不继承
    const mixedLeaves = [leaf[1], leaf[2]]
    const mixedCells = buildHeaderCells([{ prop: 'h', label: 'H', children: mixedLeaves }])
    expect(getHeaderStickyOffsets(mixedLeaves, mixedCells)[0]).toEqual({})
  })

  it('filters rows with AND across columns and OR within a column', () => {
    const rows = [
      { id: 1, name: '甲', tag: 'a' },
      { id: 2, name: '乙', tag: 'b' },
      { id: 3, name: '丙', tag: 'a' },
    ]
    const nameCol = { prop: 'name', label: 'N' }
    const tagCol = { prop: 'tag', label: 'T' }
    // 单列多值 OR
    expect(filterTableRows(rows, [{ column: tagCol, values: ['a'] }]).map((r) => r.id)).toEqual([1, 3])
    // 列间 AND
    expect(filterTableRows(rows, [
      { column: tagCol, values: ['a'] },
      { column: nameCol, values: ['甲'] },
    ]).map((r) => r.id)).toEqual([1])
    // 空选中不参与
    expect(filterTableRows(rows, [{ column: tagCol, values: [] }])).toEqual(rows)
    // 自定义 filterMethod
    const likeCol = { prop: 'name', label: 'N', filterMethod: (v: string | number, r: { name: string }) => r.name.includes(String(v)) }
    expect(filterTableRows(rows, [{ column: likeCol, values: ['乙'] }]).map((r) => r.id)).toEqual([2])
  })

  it('clamps column width to the minimum', () => {
    expect(clampColumnWidth(10)).toBe(40)
    expect(clampColumnWidth(200)).toBe(200)
  })
})
