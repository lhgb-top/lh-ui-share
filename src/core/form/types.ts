export interface LhFormRule {
  required?: boolean
  message?: string
  /**
   * 触发时机标记（blur / change / submit……）
   *
   * core 不解释该字段：UI 层按事件把规则过滤后再传入 validateFormField，
   * 这里仅承载声明，保持数据结构可表达完整校验意图。
   */
  trigger?: string
  /** 内置类型校验；空值跳过（与 required 同规则：没填不报错） */
  type?: 'string' | 'number' | 'boolean' | 'array' | 'email' | 'url'
  /** 正则校验（仅对字符串值生效） */
  pattern?: string | RegExp
  /** 数值下限（number 值）或最小长度（string / array 值） */
  min?: number
  /** 数值上限（number 值）或最大长度（string / array 值） */
  max?: number
  /** 精确长度（string / array 值） */
  len?: number
  /** 自定义校验器：返回错误文案，通过时不返回；支持异步（返回 Promise） */
  validator?: (
    value: unknown,
    model: Record<string, unknown>
  ) => string | undefined | Promise<string | undefined>
}

export interface LhFormState {
  model: Record<string, unknown>
  rules?: Record<string, LhFormRule[]>
}
