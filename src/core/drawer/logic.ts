/**
 * Drawer 纯函数逻辑（无框架依赖）
 */

import type { LhAriaAttrs } from '../shared/a11y'

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

/**
 * 是否允许关闭抽屉：
 * - 'maskClick' 读 maskClosable（默认 false，避免误触）
 * - 'escape' 读 closeOnEsc（默认 true）
 *
 * 与 dialog 的 canClose 对称：此前 closeOnEsc 只在 state 中声明、logic 从不读取，
 * 现在补齐为可计算的逃逸闸门。
 */
export function canDrawerClose(
  state: Pick<LhDrawerState, 'maskClosable' | 'closeOnEsc'>,
  reason: 'maskClick' | 'escape',
): boolean {
  if (reason === 'maskClick') return state.maskClosable ?? false
  if (reason === 'escape') return state.closeOnEsc ?? true
  return true
}

/**
 * 是否应圈住焦点：打开且锁定滚动时把 Tab 序列限制在抽屉内。
 * 具体圈焦由 UI 层配合 core/shared/focus-trap 实现（同 dialog）。
 *
 * 命名带组件前缀：与 dialog 的 shouldTrapFocus 同签名不同语义（state 字段名不同），
 * star 聚合导出时同名二义会被 TS 静默丢弃，故按本仓约定显式区分（对齐
 * getDefaultDelay → getPopconfirmDefaultDelay 的处理）。
 */
export function shouldDrawerTrapFocus(state: Pick<LhDrawerState, 'modelValue' | 'lockScroll'>): boolean {
  return !!state.modelValue && !!state.lockScroll
}

/**
 * 抽屉容器的无障碍属性包：role="dialog" + aria-modal，标题存在时挂 aria-labelledby
 *
 * @param id 抽屉元素 id
 * @param titleId 标题元素 id（未传时不输出 aria-labelledby，此时应保证有 aria-label 兜底）
 */
export function getDrawerAria(options: { id?: string; titleId?: string } = {}): LhAriaAttrs {
  const { id, titleId } = options
  const attrs: LhAriaAttrs = { role: 'dialog', 'aria-modal': true }
  if (id) attrs.id = id
  if (titleId) attrs['aria-labelledby'] = titleId
  return attrs
}
