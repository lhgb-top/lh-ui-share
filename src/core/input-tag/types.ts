/** 提交标签的触发键 */
export type LhInputTagTrigger = 'enter' | 'space' | 'comma'

/** 标签输入组件状态（插入 / 删除计算的入参） */
export interface LhInputTagState {
  /** 标签上限（非正数表示不限制） */
  max?: number
  /** 允许重复标签 */
  allowDuplicate?: boolean
  /** 只读（不生成标签、不响应删除键） */
  readonly?: boolean
  /** 禁用 */
  disabled?: boolean
}

/** 插入结果（不可变更新：返回新数组而非原地修改） */
export interface LhInputTagInsertResult {
  /** 新标签数组 */
  tags: string[]
  /** 是否实际插入（空串 / 重复 / 超上限均为 false） */
  inserted: boolean
  /** 插入失败原因（供 UI 层决定是否提示） */
  reason?: 'empty' | 'duplicate' | 'max'
}
