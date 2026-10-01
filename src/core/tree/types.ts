/** 树节点数据 */
export interface LhTreeNode {
  /** 唯一键 */
  key: string
  /** 显示文本 */
  label: string
  /** 子节点 */
  children?: LhTreeNode[]
  /** 禁用 */
  disabled?: boolean
  /** 是否叶子（不传按 children 推断） */
  isLeaf?: boolean
}

/** 扁平化后的节点（渲染用） */
export interface LhFlatTreeNode {
  node: LhTreeNode
  key: string
  level: number
  parentKey: string | null
  /** 祖先链（不含自身） */
  ancestorKeys: string[]
  /** 是否叶子 */
  isLeaf: boolean
}

/** 勾选状态 */
export type LhTreeCheckState = 'checked' | 'indeterminate' | 'unchecked'
