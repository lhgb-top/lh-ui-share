/**
 * Dialog 纯函数逻辑（无框架依赖）
 */

import type { LhDialogState } from './types'

export function canClose(state: { closeOnClickModal?: boolean; closeOnPressEscape?: boolean }, reason: 'modalClick' | 'escape'): boolean {
  if (reason === 'modalClick') return state.closeOnClickModal ?? false
  if (reason === 'escape') return state.closeOnPressEscape ?? false
  return true
}

export function getDialogStyle(state: Pick<LhDialogState, 'top' | 'zIndex' | 'position'>): Record<string, string> {
  const style: Record<string, string> = {}
  // 仅在 position 为 top 或未设置时应用 marginTop（用于 --top 定位）
  // center 和 bottom 由 flexbox 对齐处理
  if (state.top && (state.position === 'top' || !state.position)) {
    style.marginTop = state.top
  }
  if (state.zIndex) style.zIndex = String(state.zIndex)
  return style
}

export function getDialogPopperClass(state: LhDialogState): string[] {
  return [
    'lh-dialog__popper',
    state.visible ? 'lh-dialog__popper--visible' : '',
  ].filter(Boolean)
}