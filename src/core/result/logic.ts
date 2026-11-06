import type { LhIconName } from '../icon'
import type { LhResultState, LhResultStatus } from './types'

/** 合法状态集（UI 层做 prop 校验与文档生成时复用） */
export const LH_RESULT_STATUS_CONST: readonly LhResultStatus[] = [
  'success',
  'warning',
  'info',
  'error',
]

/** 各状态的默认图标（消费现有 LhIcon 图标集） */
const RESULT_ICON_NAMES: Record<LhResultStatus, LhIconName> = {
  success: 'check',
  warning: 'warning',
  error: 'error',
  info: 'info',
}

/** 状态合法性守卫（自定义 status 字符串落入前先过此关） */
export function isValidResultStatus(status: string): status is LhResultStatus {
  return (LH_RESULT_STATUS_CONST as readonly string[]).includes(status)
}

/** 结果页类名 */
export function getResultClassNames(state: LhResultState): string[] {
  return ['lh-result', `lh-result--${state.status}`]
}

/** 图标名：显式传 icon（含空串=不要图标）优先，未传时回退状态默认图标 */
export function getResultIconName(
  status: LhResultStatus,
  icon?: string,
): LhIconName | '' | undefined {
  if (icon !== undefined) return icon as LhIconName | ''
  return RESULT_ICON_NAMES[status]
}
