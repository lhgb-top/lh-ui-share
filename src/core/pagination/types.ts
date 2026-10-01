/**
 * 分页页码区间项类型：页码或省略号
 */
export type LhPaginationRangeItemType = 'page' | 'ellipsis'

/**
 * 页码区间项（ellipsis 项的 page 恒为 0，位置即语义）
 */
export interface LhPaginationRangeItem {
  type: LhPaginationRangeItemType
  page: number
}

/**
 * 页码区间计算入参
 */
export interface LhPaginationRangeState {
  /** 当前页（1 起） */
  current: number
  /** 总页数 */
  pageCount: number
  /** 当前页两侧显示的页码数，默认 1 */
  siblingCount?: number
}

/**
 * 文案模板插值参数
 */
export type LhPaginationMessageParams = Record<string, string | number>
