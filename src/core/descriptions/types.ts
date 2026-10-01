export interface LhDescriptionsItem {
  /** 条目标签 */
  label: string
  /** 条目内容（也可用作用域插槽传入） */
  value?: string | number
  /** 占据的列数（默认 1，超出 column 会被钳制） */
  span?: number
}

export interface LhDescriptionsState {
  /** 每行展示的列数 */
  column: number
  /** 是否展示边框（带边框的表格布局） */
  border: boolean
}
