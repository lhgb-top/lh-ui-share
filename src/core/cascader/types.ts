import type { LhComponentSize } from '../shared/types'

/**
 * Cascader 节点
 */
export interface LhCascaderNode {
  value: string | number
  label: string
  disabled?: boolean
  leaf?: boolean
  children?: LhCascaderNode[]
}

/**
 * Cascader 选中路径
 */
export interface LhCascaderPath {
  path: (string | number)[]
  nodes: LhCascaderNode[]
}

/**
 * Cascader 面板中的选项
 */
export interface LhCascaderPanelItem {
  value: string | number
  label: string
  isDisabled: boolean
  isExpanded: boolean
  hasChildren: boolean
}

/**
 * Cascader 状态
 */
export interface LhCascaderState {
  options: LhCascaderNode[]
  size: LhComponentSize
  disabled: boolean
  clearable: boolean
  placeholder: string
  visible: boolean
  checkStrictly: boolean
  /**
   * change/update:modelValue 是否输出完整路径。**仅对单选生效**：
   * 多选固定输出末级值数组（`(string|number)[]`，每项为一条选中路径的末级值），
   * 不受本开关影响——emitPath 与 multiple 的组合语义见各 UI 库文档
   */
  emitPath: boolean
  multiple: boolean
  cascading: boolean
  value: (string | number)[]
  selectedValue: (string | number)[] | null
}

/**
 * Cascader 搜索过滤结果
 */
export interface LhCascaderSearchResult {
  path: (string | number)[]
  nodes: LhCascaderNode[]
  pathLabels: string[]
}

/**
 * Cascader props 中的 item 属性映射
 */
export interface LhCascaderItemConfig {
  value?: string
  label?: string
  children?: string
  disabled?: string
  leaf?: string
}

/**
 * Cascader 点击事件数据
 */
export interface LhCascaderSelectEventData {
  path: (string | number)[]
  nodes: LhCascaderNode[]
  panelIndex: number
}