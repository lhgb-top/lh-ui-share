/**
 * Dialog 纯类型定义（无框架依赖）
 */

export interface LhDialogState {
  visible: boolean
  lockScroll: boolean
  closeOnClickModal: boolean
  closeOnPressEscape: boolean
  width: string | number | undefined
  top: string | undefined
  zIndex: number | undefined
  position: 'top' | 'center' | 'bottom' | undefined
}