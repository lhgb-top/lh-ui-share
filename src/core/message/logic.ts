import type { LhAlertRole } from '../alert/types'
import type { LhMessageRecord, LhMessageState, LhMessageType } from './types'

/** 默认自动关闭时长（loading 语义不自动关闭） */
export const LH_MESSAGE_DURATION_DEFAULT = 3000

/** 队列最大同时显示条数，超出时移除最早的 */
export const LH_MESSAGE_MAX_DEFAULT = 5

/** 距视口顶部默认偏移 px */
export const LH_MESSAGE_OFFSET_DEFAULT = 20

/** 语义 → live region 角色映射（APG，同 Alert）：warning/danger/error 立即播报，info/success/loading 温和播报 */
export function getMessageRole(type: LhMessageType): LhAlertRole {
  return type === 'warning' || type === 'danger' || type === 'error' ? 'alert' : 'status'
}

/** 各语义对应的图标名；loading 由 LhSpinner 呈现，返回 null */
export function getMessageIconName(type: LhMessageType): string | null {
  if (type === 'loading') return null
  const icons: Record<Exclude<LhMessageType, 'loading'>, string> = {
    info: 'info',
    success: 'check',
    warning: 'warning',
    danger: 'error',
    error: 'error',
  }
  return icons[type]
}

/** 计算消息类名 */
export function getMessageClassNames(state: LhMessageState): string[] {
  const classes = ['lh-message__item', `lh-message__item--${state.type}`]
  if (state.showClose) classes.push('lh-message__item--closable')
  return classes
}

/**
 * 解析自动关闭时长：
 * - loading 语义默认不自动关闭（返回 0），显式传了 duration 则尊重显式值
 * - 其余语义未传时取默认值
 */
export function resolveMessageDuration(duration: number | undefined, type: LhMessageType): number {
  if (duration !== undefined) return duration
  return type === 'loading' ? 0 : LH_MESSAGE_DURATION_DEFAULT
}

/**
 * 队列超限裁剪：保留最新（数组末尾）的 max 条，被移除的记录在 removed 中返回，
 * 由调用方负责触发其 onClose。输入数组按时间正序（先来在前）。
 */
export function clampMessageQueue<T extends { id: number | string }>(
  items: T[],
  max: number,
): { kept: T[]; removed: T[] } {
  if (max <= 0 || items.length <= max) return { kept: items, removed: [] }
  return { kept: items.slice(items.length - max), removed: items.slice(0, items.length - max) }
}

/** 生成队列记录（服务层把用户选项归一为记录） */
export function createMessageRecord(
  partial: Omit<LhMessageRecord, 'id' | 'duration' | 'offset'> & {
    duration?: number
    offset?: number
  },
  seq: number,
): LhMessageRecord {
  return {
    ...partial,
    id: seq,
    duration: resolveMessageDuration(partial.duration, partial.type),
    offset: partial.offset ?? LH_MESSAGE_OFFSET_DEFAULT,
  }
}
