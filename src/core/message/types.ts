import type { SxProps } from '../shared'
import { LH_TYPES_CONST } from '../../constants'

/** 消息语义类型（四语义 + loading） */
export type LhMessageType =
  | (typeof LH_MESSAGE_TYPE_CONST)[keyof typeof LH_MESSAGE_TYPE_CONST]

/** 类型常量（在通用语义常量上补 loading） */
export const LH_MESSAGE_TYPE_CONST = {
  ...LH_TYPES_CONST,
  /** @alias 加载 */
  loading: 'loading',
} as const

/** 单条消息在服务队列中的记录形态 */
export interface LhMessageRecord {
  id: number
  type: LhMessageType
  content: string
  /** 自动关闭毫秒数，0 表示不自动关闭 */
  duration: number
  showClose: boolean
  /** 距视口顶部的偏移 px */
  offset: number
  sx?: SxProps
  onClose?: () => void
}

/** 消息状态（类名计算入参） */
export interface LhMessageState {
  type: LhMessageType
  showClose: boolean
}
