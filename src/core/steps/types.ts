/**
 * 步骤状态
 */
export type LhStepStatus = 'wait' | 'process' | 'finish' | 'error'

/**
 * 步骤条方向
 */
export type LhStepsDirection = 'horizontal' | 'vertical'

/**
 * 步骤状态计算入参
 */
export interface LhStepStatusState {
  /** 步骤索引（0 起） */
  index: number
  /** 当前步骤索引 */
  current: number
  /** Steps 级整体覆盖状态（设置后所有步骤均为该状态） */
  forced?: LhStepStatus
}

/**
 * 步骤类名计算入参
 */
export interface LhStepClassState {
  status: LhStepStatus
  clickable: boolean
  /** 是否为当前行的最后一项（横向折行时由 UI 层测量，用于隐藏行末连接线） */
  lineLast?: boolean
}
