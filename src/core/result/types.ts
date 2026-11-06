/** 结果页状态 */
export type LhResultStatus = 'success' | 'warning' | 'info' | 'error'

/** 结果页状态输入（类名与图标计算的入参） */
export interface LhResultState {
  status: LhResultStatus
}
