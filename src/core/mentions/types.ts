/**
 * Mentions 组件类型定义（框架无关）
 */

/** 选项：label 为展示文案，value 为写入文本的提及值（默认与 label 相同） */
export interface LhMentionOption {
  label: string
  value?: string
  disabled?: boolean
}

/** 提及上下文：描述光标位置是否处于一个「待完成的提及片段」内 */
export interface LhMentionContext {
  /** 是否存在活动提及（应展示建议面板） */
  active: boolean
  /** 触发字符（'@'）在文本中的下标；不活动时为 -1 */
  prefixIndex: number
  /** 搜索串：prefix 之后到光标之间的文本（用于过滤选项） */
  searchText: string
  /** 建议面板选中后应替换的文本区间终点（= 光标位置，不活动时为 -1） */
  end: number
}

/** 选项无障碍属性包的输入 */
export interface LhMentionOptionAriaInput {
  /** 列表盒 id（拼接选项 id） */
  listboxId?: string
  /** 选项下标 */
  index: number
  /** 是否高亮 */
  highlighted: boolean
  /** 是否禁用 */
  disabled: boolean
}
