/**
 * Autocomplete 组件类型定义（框架无关）
 */

/** 选项：label 为展示与输入回填文案，value 为提交值（默认与 label 相同） */
export interface LhAutocompleteOption {
  label: string
  value?: string | number
  disabled?: boolean
}

/** 过滤选项 */
export interface LhAutocompleteFilterOptions {
  /** 大小写敏感（默认 false） */
  caseSensitive?: boolean
  /** 去除查询串首尾空白后再匹配（默认 true） */
  trim?: boolean
  /**
   * 自定义匹配判定（默认：label 包含查询串）
   *
   * 交由调用方覆盖以支持拼音首字母、远程数据等场景；返回 true 表示保留。
   */
  matcher?: (option: LhAutocompleteOption, query: string) => boolean
}

/** 触发器（combobox）无障碍属性包的输入 */
export interface LhAutocompleteTriggerAriaInput {
  /** 下拉面板是否展开 */
  visible: boolean
  /** 列表盒 id（aria-controls 引用） */
  listboxId?: string
  /** 当前高亮项下标（-1 = 无高亮） */
  highlightedIndex: number
}

/** 选项无障碍属性包的输入 */
export interface LhAutocompleteOptionAriaInput {
  /** 列表盒 id（拼接选项 id） */
  listboxId?: string
  /** 选项下标 */
  index: number
  /** 是否高亮 */
  highlighted: boolean
  /** 是否禁用 */
  disabled: boolean
}
