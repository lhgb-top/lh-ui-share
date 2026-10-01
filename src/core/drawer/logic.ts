/**
 * Drawer 纯函数逻辑（无框架依赖）
 */

/** 抽屉方向 */
export type LhDrawerDirection = 'right' | 'left' | 'top' | 'bottom'

/** Drawer 组件状态（供纯函数消费的子集） */
export interface LhDrawerState {
  direction?: LhDrawerDirection
  size?: string | number
  modelValue?: boolean
  title?: string
  maskClosable?: boolean
  showClose?: boolean
  lockScroll?: boolean
  closeOnEsc?: boolean
}

export const DEFAULT_DRAWER_DIRECTION: LhDrawerDirection = 'right'
export const DEFAULT_DRAWER_SIZE = '30%'

/**
 * 尺寸归一化：数字 → px，字符串原样返回（支持百分比）
 */
export function normalizeDrawerSize(size: string | number | undefined): string {
  if (size === undefined || size === null || size === '') return DEFAULT_DRAWER_SIZE
  return typeof size === 'number' ? `${size}px` : size
}

/**
 * 面板尺寸样式：左右方向作用于 width，上下方向作用于 height
 */
export function getDrawerPanelStyle(
  direction: LhDrawerDirection,
  size: string | number | undefined
): Record<string, string> {
  const value = normalizeDrawerSize(size)
  return direction === 'left' || direction === 'right' ? { width: value } : { height: value }
}

export function getDrawerClass(state: {
  direction: LhDrawerDirection
}): string[] {
  return ['lh-drawer', `lh-drawer--${state.direction}`]
}
