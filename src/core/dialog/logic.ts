/**
 * Dialog 纯函数逻辑（无框架依赖）
 */

import type { LhDialogState } from './types'
import type { LhAriaAttrs } from '../shared/a11y'

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
/**
 * 是否应圈住焦点：可见且锁定滚动时把 Tab 序列限制在对话框内（APG dialog 模式）。
 *
 * 具体圈焦由 UI 层配合 core/shared/focus-trap 实现：打开时 saveActiveElement +
 * focusFirst、keydown 时 trapTabKey、inert 由 setInertOutside 处理、关闭时
 * restoreActiveElement 归还焦点。本函数只把「是否启用」变成 core 可计算的决策。
 */
export function shouldTrapFocus(state: Pick<LhDialogState, 'visible' | 'lockScroll'>): boolean {
  return !!state.visible && !!state.lockScroll
}

/**
 * 对话框容器的无障碍属性包：role="dialog" + aria-modal，标题存在时挂 aria-labelledby
 *
 * @param id 对话框元素 id（供触发侧 aria-describedby 等引用，按需传）
 * @param titleId 标题元素 id（未传时不输出 aria-labelledby，此时应保证有 aria-label 兜底）
 */
export function getDialogAria(options: { id?: string; titleId?: string } = {}): LhAriaAttrs {
  const { id, titleId } = options
  const attrs: LhAriaAttrs = { role: 'dialog', 'aria-modal': true }
  if (id) attrs.id = id
  if (titleId) attrs['aria-labelledby'] = titleId
  return attrs
}
