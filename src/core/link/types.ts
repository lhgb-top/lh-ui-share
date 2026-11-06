/**
 * Link 组件类型定义（框架无关）
 */

/** 链接语义类型：default 走常规文本色，其余走对应语义色 */
export type LhLinkType = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

/** 下划线形态：always 常驻 / hover 悬停 / none 无 */
export type LhLinkUnderline = 'always' | 'hover' | 'none'

/** Link 类名计算的输入状态（与 UI 层 props 解构默认值后的归一形态） */
export interface LhLinkState {
  type: LhLinkType
  underline: LhLinkUnderline
  disabled: boolean
}

/** Link 无障碍属性包的输入 */
export interface LhLinkAriaInput {
  /** 是否禁用 */
  disabled: boolean
  /** 是否当前页 / 当前位置（面包屑等场景，输出 aria-current="page"） */
  current?: 'page' | 'location' | true
}
