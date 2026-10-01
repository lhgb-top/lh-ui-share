import type { SxProps } from '../shared'
import { LH_TYPES_CONST } from '../../constants'

/** 通知语义类型（四语义，无 loading） */
export type LhNotificationType =
  (typeof LH_TYPES_CONST)[keyof typeof LH_TYPES_CONST]

/** 通知弹出位置（四角） */
export type LhNotificationPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'

/** 位置常量 */
export const LH_NOTIFICATION_POSITION_CONST = {
  'top-right': 'top-right',
  'top-left': 'top-left',
  'bottom-right': 'bottom-right',
  'bottom-left': 'bottom-left',
} as const

/** 单条通知在服务队列中的记录形态 */
export interface LhNotificationRecord {
  id: number
  type: LhNotificationType
  title: string
  content: string
  /** 自动关闭毫秒数，0 表示不自动关闭 */
  duration: number
  position: LhNotificationPosition
  showClose: boolean
  sx?: SxProps
  onClick?: () => void
  onClose?: () => void
}
