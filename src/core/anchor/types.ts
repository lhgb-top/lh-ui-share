/** 锚点项 */
export interface LhAnchorItem {
  /** 目标元素 id */
  id: string
  /** 显示文本 */
  title: string
  /** 子级锚点 */
  children?: LhAnchorItem[]
}

/** 扁平化后的锚点项（渲染用） */
export interface LhFlatAnchorItem {
  id: string
  title: string
  level: number
}
