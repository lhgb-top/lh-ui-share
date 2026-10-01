/** 虚拟列表可视区间 */
export interface LhVirtualRange {
  /** 起始下标（含） */
  start: number
  /** 结束下标（不含） */
  end: number
  /** 窗口偏移 px */
  offsetY: number
  /** 全量高度 px */
  totalHeight: number
}

/** 虚拟列表项（动态高度模式） */
export interface LhVirtualItem {
  /** 该项的估算/实测高度 */
  size: number
  /** 该项相对列表顶部的偏移 */
  offset: number
}
