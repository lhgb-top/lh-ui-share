/** 警告语义类型 */
export type LhAlertType = 'info' | 'success' | 'warning' | 'danger'

/** 警告状态（类名计算入参） */
export interface LhAlertState {
  type: LhAlertType
  closable: boolean
  showIcon: boolean
  plain: boolean
  withTitle: boolean
}

/** 语义与 live region 角色的映射 */
export type LhAlertRole = 'alert' | 'status'
