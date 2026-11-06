/**
 * Text 组件类型定义（框架无关）
 */

/** 标题级别与段落：h1~h6 走标题排版，p 走正文，caption 走辅助说明小字 */
export type LhTextLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'caption'

/** 语义颜色：default 常规、secondary 次要、其余为状态色 */
export type LhTextType = 'default' | 'secondary' | 'success' | 'warning' | 'danger'

/** Text 类名计算的输入状态（与 UI 层 props 解构默认值后的归一形态） */
export interface LhTextState {
  level: LhTextLevel
  type: LhTextType
  strong: boolean
  italic: boolean
  underline: boolean
  mark: boolean
  code: boolean
  ellipsis: boolean | number
  disabled: boolean
}

/** Text 无障碍属性包的输入 */
export interface LhTextAriaInput {
  /** 省略开启时是否已折叠（可展开场景用，输出 aria-expanded） */
  expanded?: boolean
  /** 可复制按钮的文案 id（aria-labelledby 引用） */
  copyButtonId?: string
}
