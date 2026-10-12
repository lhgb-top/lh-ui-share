import type { LhAriaAttrs } from '../shared/a11y'
import type {
  LhTableCellSticky,
  LhTableColumn,
  LhTableHeaderCell,
  LhTableRow,
  LhTableSortOrder,
  LhTableVisibleRange,
} from './types'
import { computeRange } from '../shared/virtual'

/** 虚拟滚动默认行高 */
export const LH_TABLE_ROW_HEIGHT = 48

/** 窗口上下各多渲染几行（滚动白屏缓冲） */
export const LH_TABLE_OVERSCAN = 3

/**
 * 计算虚拟滚动的可视区间（委托共享内核算法，与 VirtualList 同源，修复同步）
 *
 * totalHeight 供占位元素撑高；offsetY 供窗口容器 translateY；
 * [start, end) 为实际渲染的行下标区间。
 *
 * @deprecated 保留兼容别名（vue2 等下游在用）；新代码直接用共享内核 `computeRange`
 */
export function computeVisibleRange(
  scrollTop: number,
  viewportHeight: number,
  rowHeight: number,
  total: number,
  overscan: number = LH_TABLE_OVERSCAN,
): LhTableVisibleRange {
  return computeRange(scrollTop, viewportHeight, rowHeight, total, overscan)
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
    if (typeof av === 'number' && typeof bv === 'number') {
      // NaN 不参与比较（其排序结果由实现决定、不确定），统一按「空值排末尾」处理
      const avFinite = Number.isFinite(av)
      const bvFinite = Number.isFinite(bv)
      if (!avFinite && !bvFinite) return 0
      if (!avFinite) return 1
      if (!bvFinite) return -1
      return (av - bv) * dir
    }
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
 *
 * 宽度支持数字与 `'Npx'` 字符串；其他字符串单位（如 '20%'）无法换算为固定偏移，
 * 固定列应避免使用——这类列按 0 累加，调用方需自行保证布局可接受。
 * 未声明宽度的固定列不参与偏移。
 */
export function getStickyOffsets(columns: LhTableColumn[]): LhTableCellSticky[] {
  const offsets: LhTableCellSticky[] = columns.map(() => ({}))
  const widthOf = (column: LhTableColumn): number => {
    if (typeof column.width === 'number') return column.width
    if (typeof column.width === 'string') {
      const px = /^(\d+(?:\.\d+)?)px$/.exec(column.width.trim())
      if (px) return parseFloat(px[1])
    }
    return 0
  }

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

/** 该列树的最大深度（无 children 时为 1）。祖先链判重保护循环引用 */
function getDepth(column: LhTableColumn, seen: Set<LhTableColumn> = new Set()): number {
  if (!column.children?.length) return 1
  return (
    1 +
    Math.max(
      ...column.children.map((child) => {
        if (seen.has(child)) return 0
        const nextSeen = new Set(seen)
        nextSeen.add(child)
        return getDepth(child, nextSeen)
      }),
    )
  )
}

/**
 * 递归取全部叶子列（表体按此渲染，保证列数与表头叶子数一致）。
 *
 * 用全局 seen 而非祖先链 seen：同一 column 对象被 DAG 式共享引用时只发射一次，
 * 表体列数才与表头叶子格数一致；全局 seen 同样保护循环引用。
 */
export function flattenLeafColumns(columns: LhTableColumn[]): LhTableColumn[] {
  const result: LhTableColumn[] = []
  const seen = new Set<LhTableColumn>()
  const walk = (list: LhTableColumn[]): void => {
    for (const column of list) {
      if (seen.has(column)) continue
      seen.add(column)
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
 *
 * 组列的 leafSpan 用「递归实际发射的叶子数」而非先验计数：同一 column 对象被
 * DAG 式共享引用时，全局 seen 只会发射一次（与 flattenLeafColumns 同口径），
 * 先验计数会把共享子树算两遍，导致表头列数与表体叶子列数错位。
 */
export function buildHeaderCells(columns: LhTableColumn[]): LhTableHeaderCell[] {
  const maxDepth = columns.length ? Math.max(...columns.map((c) => getDepth(c))) : 1
  const cells: LhTableHeaderCell[] = []
  let leafCursor = 0

  // 返回值 = 本层实际发射的叶子数（供父组列回填 leafSpan/colspan）
  const seen = new Set<LhTableColumn>()
  const walk = (list: LhTableColumn[], level: number): number => {
    let emitted = 0
    for (const column of list) {
      // 全局判重：DAG 共享引用只发射一次（与 flattenLeafColumns 同口径），
      // 同时保护循环引用
      if (seen.has(column)) continue
      seen.add(column)
      if (column.children?.length) {
        // 先按占位跨度入列（保持「组头先于子列」的 cells 序），递归后回填真实跨度；
        // cursor 的推进由子列递归完成（每个叶子 +1），组列不再叠加 leafSpan，
        // 否则下一个组列的起点会被重复累加（估值组会从 2 跳到 4）
        const cell: LhTableHeaderCell = {
          column,
          level,
          leafStart: leafCursor,
          leafSpan: 0,
          rowspan: 1,
          colspan: 0,
          isLeaf: false,
        }
        cells.push(cell)
        const span = walk(column.children, level + 1)
        cell.leafSpan = span
        cell.colspan = span
        emitted += span
      } else {
        cells.push({
          column,
          level,
          leafStart: leafCursor,
          leafSpan: 1,
          // 叶子列向下补齐到最大深度，填满同层更高的组表头留下的空行
          rowspan: maxDepth - level,
          colspan: 1,
          isLeaf: true,
        })
        leafCursor += 1
        emitted += 1
      }
    }
    return emitted
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

/**
 * 钳制列宽到下限（非数字原样返回，交给调用方避免覆盖字符串宽度）。
 *
 * 非有限数（NaN 等，拖拽过程中可能出现）返回下限本身，避免 NaN 往下游传。
 *
 * 重载保证「数进数出、字符串进字符串出」，调用方不必为同构变换再做类型断言。
 */
export function clampColumnWidth<W extends number | string>(width: W): W
export function clampColumnWidth(width: number | string): number | string
export function clampColumnWidth(width: number | string): number | string {
  if (typeof width !== 'number') return width
  if (!Number.isFinite(width)) return LH_TABLE_MIN_COL_WIDTH
  return Math.max(width, LH_TABLE_MIN_COL_WIDTH)
}

/**
 * 排序列的表头无障碍属性包：aria-sort 与 cycleSortOrder 的状态机对齐
 *
 * - 'asc' → aria-sort="ascending"
 * - 'desc' → aria-sort="descending"
 * - 未排序 → aria-sort="none"（显式声明「该列可排序但当前未排序」）
 * - 该列不支持排序 → 不输出任何属性
 *
 * @param sortOrder 该列当前排序态（undefined 表示未参与排序）
 * @param sortable 该列是否可排序
 */
export function getTableSortAria(options: {
  sortOrder?: LhTableSortOrder
  sortable?: boolean
}): LhAriaAttrs {
  const { sortOrder, sortable } = options
  if (!sortable) return {}
  return {
    'aria-sort':
      sortOrder === 'asc' ? 'ascending' : sortOrder === 'desc' ? 'descending' : 'none',
  }
}
