/**
 * 面包屑项状态（类名计算入参）
 */
export interface LhBreadcrumbItemState {
  /** 是否为最后一项（当前页） */
  isLast: boolean
  /** 是否渲染为链接（传入 to 且非末项） */
  isLink: boolean
}

/**
 * 折叠计算入参
 */
export interface LhBreadcrumbCollapseState {
  /** 项总数 */
  total: number
  /** 最大可见项数（含省略号，首项 + 省略号 + 末尾 maxItems-1 项）；小于 2 表示不折叠 */
  maxItems: number
}
