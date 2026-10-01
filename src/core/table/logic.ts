import type {
  LhTableCellSticky,
  LhTableColumn,
  LhTableHeaderCell,
  LhTableRow,
  LhTableSortOrder,
  LhTableVisibleRange,
} from './types'

/** 虚拟滚动默认行高 */
export const LH_TABLE_ROW_HEIGHT = 48

/** 窗口上下各多渲染几行（滚动白屏缓冲） */
export const LH_TABLE_OVERSCAN = 3

/**
 * 计算虚拟滚动的可视区间（纯函数，无 DOM 依赖）
 *
 * totalHeight 供占位元素撑高；offsetY 供窗口容器 translateY；
 * [start, end) 为实际渲染的行下标区间。
 */
export function computeVisibleRange(
  scrollTop: number,
  viewportHeight: number,
  rowHeight: number,
  total: number,
  overscan: number = LH_TABLE_OVERSCAN,
): LhTableVisibleRange {
  if (rowHeight <= 0 || total <= 0) {
    return { start: 0, end: 0, offsetY: 0, totalHeight: 0 }
  }
  const totalHeight = total * rowHeight
  const first = Math.floor(Math.max(0, scrollTop) / rowHeight)
  const visibleCount = Math.ceil(Math.max(0, viewportHeight) / rowHeight)
  const start = Math.max(0, first - overscan)
  const end = Math.min(total, start + visibleCount + overscan * 2)
  return { start, end, offsetY: start * rowHeight, totalHeight }
}

/** 排序方向循环：无 → asc → desc → 无 */
export function cycleSortOrder(current?: LhTableSortOrder): LhTableSortOrder | undefined {
  if (current === 'asc') return 'desc'
  if (current === 'desc') return undefined
  return 'asc'
}

/** 排序行（无 order 时返回原顺序副本；支持自定义 sorter） */
export function sortTableRows(
  rows: LhTableRow[],
  prop: string,
  order: LhTableSortOrder | undefined,
  sorter?: (a: LhTableRow, b: LhTableRow) => number,
): LhTableRow[] {
  if (!order) return [...rows]
  const dir = order === 'desc' ? -1 : 1
  return [...rows].sort((a, b) => {
    if (sorter) return sorter(a, b) * dir
    const av = a[prop]
    const bv = b[prop]
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
    return String(av).localeCompare(String(bv)) * dir
  })
}

/** 取单元格显示值（formatter 优先） */
export function getCellValue(row: LhTableRow, column: LhTableColumn): string {
  const value = row[column.prop]
  if (column.formatter) return column.formatter(row, value)
  return value == null ? '' : String(value)
}

/** 单列宽度（无宽度用 1fr 均分） */
export function getColumnWidth(column: LhTableColumn): string {
  if (column.width == null) return 'minmax(0, 1fr)'
  return typeof column.width === 'number' ? `${column.width}px` : column.width
}

/** 网格列模板 */
export function getGridTemplate(columns: LhTableColumn[]): string {
  return columns.map((column) => getColumnWidth(column)).join(' ')
}

/**
 * 计算固定列的 sticky 偏移：左侧从左累加、右侧从右累加。
 * 未声明宽度的固定列不参与偏移（调用方应约束固定列必须有宽度）。
 */
export function getStickyOffsets(columns: LhTableColumn[]): LhTableCellSticky[] {
  const offsets: LhTableCellSticky[] = columns.map(() => ({}))
  const widthOf = (column: LhTableColumn): number =>
    typeof column.width === 'number' ? column.width : 0

  let left = 0
  for (let i = 0; i < columns.length; i++) {
    if (columns[i].fixed === 'left') {
      offsets[i].left = left
      left += widthOf(columns[i])
    }
  }

  let right = 0
  for (let i = columns.length - 1; i >= 0; i--) {
    if (columns[i].fixed === 'right') {
      offsets[i].right = right
      right += widthOf(columns[i])
    }
  }
  return offsets
}

/** 表格容器类名 */
export function getTableClassNames(state: {
  stripe: boolean
  border: boolean
  size: string
  virtual: boolean
}): string[] {
  const classes = ['lh-table', `lh-table--${state.size}`]
  if (state.stripe) classes.push('lh-table--stripe')
  if (state.border) classes.push('lh-table--border')
  if (state.virtual) classes.push('lh-table--virtual')
  return classes
}

/** 单元格类名 */
export function getTableCellClassNames(state: {
  align: string
  fixed?: 'left' | 'right'
  lastFixedLeft?: boolean
  firstFixedRight?: boolean
  resizable?: boolean
}): string[] {
  const classes = ['lh-table__cell', `lh-table__cell--${state.align}`]
  if (state.fixed === 'left') classes.push('lh-table__cell--fixed-left')
  if (state.fixed === 'right') classes.push('lh-table__cell--fixed-right')
  if (state.lastFixedLeft) classes.push('lh-table__cell--fixed-left-last')
  if (state.firstFixedRight) classes.push('lh-table__cell--fixed-right-first')
  if (state.resizable) classes.push('lh-table__cell--resizable')
  return classes
}

// ============================================================================
// 多级表头
// ============================================================================

/** 该列的叶子后代数（无 children 时为 1） */
function getLeafCount(column: LhTableColumn): number {
  if (!column.children?.length) return 1
  return column.children.reduce((sum, child) => sum + getLeafCount(child), 0)
}

/** 该列树的最大深度（无 children 时为 1） */
function getDepth(column: LhTableColumn): number {
  if (!column.children?.length) return 1
  return 1 + Math.max(...column.children.map(getDepth))
}

/** 递归取全部叶子列（表体按此渲染，保证列数与表头叶子数一致） */
export function flattenLeafColumns(columns: LhTableColumn[]): LhTableColumn[] {
  const result: LhTableColumn[] = []
  const walk = (list: LhTableColumn[]): void => {
    for (const column of list) {
      if (column.children?.length) walk(column.children)
      else result.push(column)
    }
  }
  walk(columns)
  return result
}

/**
 * 展开多级表头为扁平单元格布局。
 *
 * 每个单元格携带它在叶子列序中的起点与跨度；叶子列的 rowspan 补齐到最大深度，
 * 使任意不平衡的列树也不会留下悬空格。平铺配置输出一行、rowspan 全为 1。
 */
export function buildHeaderCells(columns: LhTableColumn[]): LhTableHeaderCell[] {
  const maxDepth = columns.length ? Math.max(...columns.map(getDepth)) : 1
  const cells: LhTableHeaderCell[] = []
  let leafCursor = 0

  const walk = (list: LhTableColumn[], level: number): void => {
    for (const column of list) {
      const leafSpan = getLeafCount(column)
      if (column.children?.length) {
        cells.push({
          column,
          level,
          leafStart: leafCursor,
          leafSpan,
          rowspan: 1,
          colspan: leafSpan,
          isLeaf: false,
        })
        walk(column.children, level + 1)
      } else {
        cells.push({
          column,
          level,
          leafStart: leafCursor,
          leafSpan,
          // 叶子列向下补齐到最大深度，填满同层更高的组表头留下的空行
          rowspan: maxDepth - level,
          colspan: 1,
          isLeaf: true,
        })
      }
      leafCursor += leafSpan
    }
  }

  walk(columns, 0)
  return cells
}

/**
 * 计算表头单元格的 sticky 偏移。
 *
 * 组表头只在「区间内叶子列全部 fixed 同侧」时继承首/末叶子列的偏移，
 * 否则不固定（跨固定区与流动区的组表头无法用单一偏移定位）。
 */
export function getHeaderStickyOffsets(
  leafColumns: LhTableColumn[],
  headerCells: LhTableHeaderCell[],
): LhTableCellSticky[] {
  const leafOffsets = getStickyOffsets(leafColumns)
  return headerCells.map((cell) => {
    const start = leafOffsets[cell.leafStart]
    const end = leafOffsets[cell.leafStart + cell.leafSpan - 1]
    const sticky: LhTableCellSticky = {}
    if (start?.left != null && end?.left != null) sticky.left = start.left
    if (start?.right != null && end?.right != null) sticky.right = end.right
    return sticky
  })
}

// ============================================================================
// 筛选
// ============================================================================

/** 筛选命中判定（列间 AND、列内 OR；空选中视为该列不参与过滤） */
export function filterTableRows(
  rows: LhTableRow[],
  filters: { column: LhTableColumn; values: (string | number)[] }[],
): LhTableRow[] {
  const active = filters.filter((f) => f.values.length > 0)
  if (active.length === 0) return [...rows]
  return rows.filter((row) =>
    active.every(({ column, values }) => {
      const method =
        column.filterMethod ?? ((value: string | number, r: LhTableRow) => r[column.prop] === value)
      return values.some((value) => method(value, row))
    }),
  )
}

// ============================================================================
// 列宽拖拽
// ============================================================================

/** 拖宽下限（px），再窄单元格内容无法容纳 */
export const LH_TABLE_MIN_COL_WIDTH = 40

/** 钳制列宽到下限（非数字原样返回，交给调用方避免覆盖字符串宽度） */
export function clampColumnWidth(width: number): number {
  return Math.max(width, LH_TABLE_MIN_COL_WIDTH)
}
