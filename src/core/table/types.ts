/** 单元格对齐 */
export type LhTableAlign = 'left' | 'center' | 'right'

/** 排序方向 */
export type LhTableSortOrder = 'asc' | 'desc'

/** 行数据类型 */
export type LhTableRow = Record<string, any>

/** 筛选选项 */
export interface LhTableFilterOption {
  /** 选项文案 */
  text: string
  /** 选项值（参与 filterMethod 比对） */
  value: string | number
}

/** 列配置 */
export interface LhTableColumn {
  /** 数据字段名 */
  prop: string
  /** 列标题 */
  label: string
  /** 列宽（数字为 px） */
  width?: number | string
  /** 对齐 */
  align?: LhTableAlign
  /** 固定列（需配合 width） */
  fixed?: 'left' | 'right'
  /** 可排序 */
  sortable?: boolean
  /** 自定义单元格插槽名 */
  slot?: string
  /** 值格式化 */
  formatter?: (row: LhTableRow, value: any) => string
  /** 子列（配置即得多级表头，可无限嵌套） */
  children?: LhTableColumn[]
  /** 列筛选选项（仅叶子列生效） */
  filters?: LhTableFilterOption[]
  /** 自定义筛选判定（默认按 prop 全等比对） */
  filterMethod?: (value: string | number, row: LhTableRow) => boolean
  /** 筛选面板是否多选（默认 true） */
  filterMultiple?: boolean
  /** 该列可拖宽（需为数字 width 的叶子列） */
  resizable?: boolean
}

/** 表头单元格布局（多级表头展开后的扁平描述） */
export interface LhTableHeaderCell {
  /** 对应列配置 */
  column: LhTableColumn
  /** 所处表头层级（0 起） */
  level: number
  /** 在叶子列序中的起始下标 */
  leafStart: number
  /** 跨越的叶子列数 */
  leafSpan: number
  /** 跨越的表头行数（补齐到最大深度） */
  rowspan: number
  /** 跨越的叶子列数（= leafSpan，与 aria-colspan 同义） */
  colspan: number
  /** 是否叶子列 */
  isLeaf: boolean
}

/** 可视区间（虚拟滚动） */
export interface LhTableVisibleRange {
  /** 起始行下标（含） */
  start: number
  /** 结束行下标（不含） */
  end: number
  /** 窗口偏移量 px */
  offsetY: number
  /** 全量高度 px */
  totalHeight: number
}

/** 固定列偏移 */
export interface LhTableCellSticky {
  left?: number
  right?: number
}
