import type { LhIconName } from '../icon'
import type { LhNotificationPosition, LhNotificationType } from './types'
import type { LhAriaAttrs } from '../shared/a11y'

/** 默认自动关闭时长（通知比消息停留更久） */
export const LH_NOTIFICATION_DURATION_DEFAULT = 4500

/** 堆叠间距 px */
export const LH_NOTIFICATION_GAP_DEFAULT = 16

/** 语义 → 图标名（消费现有 LhIcon 图标集） */
export function getNotificationIconName(type: LhNotificationType): LhIconName {
  const icons: Record<LhNotificationType, LhIconName> = {
    info: 'info',
    success: 'check',
    warning: 'warning',
    danger: 'error',
    error: 'error',
  }
  return icons[type]
}

/** 计算通知卡片类名 */
export function getNotificationClassNames(state: {
  type: LhNotificationType
  showClose: boolean
  clickable: boolean
}): string[] {
  const classes = ['lh-notification__item', `lh-notification__item--${state.type}`]
  if (state.showClose) classes.push('lh-notification__item--closable')
  if (state.clickable) classes.push('lh-notification__item--clickable')
  return classes
}

/** 位置是否贴顶（决定容器 top/bottom 与入场方向） */
export function isTopPosition(position: LhNotificationPosition): boolean {
  return position.startsWith('top')
}

/** 是否水平贴右（决定容器 left/right） */
export function isRightPosition(position: LhNotificationPosition): boolean {
  return position.endsWith('right')
}

/**
 * 把队列按弹出位置分组（保持组内时间正序），服务层按组渲染到四角容器
 */
export function groupNotificationsByPosition<T extends { position: LhNotificationPosition }>(
  items: T[],
): Record<LhNotificationPosition, T[]> {
  const groups: Record<LhNotificationPosition, T[]> = {
    'top-right': [],
    'top-left': [],
    'bottom-right': [],
    'bottom-left': [],
  }
  for (const item of items) {
    // 未知 position（JS 侧脏数据）兜底进默认的 top-right，不因单条脏数据崩掉整队分组
    const position = groups[item.position] ? item.position : 'top-right'
    groups[position].push(item)
  }
  return groups
}

/**
 * 自定义堆叠时的位移计算：返回每条通知相对视口边缘的偏移 px（贴近边缘的第一条为 0，
 * 后续依次累加前面条目的高度 + 间距）。贴底容器由调用方自行取反方向。
 */
export function computeStackOffsets(
  heights: number[],
  gap = LH_NOTIFICATION_GAP_DEFAULT,
): number[] {
  const offsets: number[] = []
  let acc = 0
  for (const height of heights) {
    offsets.push(acc)
    acc += height + gap
  }
  return offsets
}

/**
 * 语义 → live region 角色映射（APG，与 message / alert 同范式）：
 * - error/warning 性质立即播报 → role="alert"
 * - 温和通知排队播报 → role="status"
 */
export function getNotificationRole(type: LhNotificationType): 'alert' | 'status' {
  return type === 'warning' || type === 'danger' || type === 'error' ? 'alert' : 'status'
}

/**
 * 通知项的无障碍属性包：role 来自 getNotificationRole
 */
export function getNotificationAria(type: LhNotificationType): LhAriaAttrs {
  return { role: getNotificationRole(type) }
}
