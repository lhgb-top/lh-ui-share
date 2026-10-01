import type { SxProps } from '../shared'

/** 加载遮罩选项（服务与指令共用） */
export interface LhLoadingOptions {
  /** 挂载目标：选择器字符串 / 元素；不传为全屏 */
  target?: string | HTMLElement
  /** 加载提示文案（未传时取语言包 loading.text） */
  text?: string
  /** 遮罩背景色（CSS background 值） */
  background?: string
  /** 是否锁定滚动（全屏遮罩锁 body，指定目标锁目标自身的滚动） */
  lock?: boolean
  /** 是否显示旋转图标 */
  spinner?: boolean
  sx?: SxProps
}

/** 服务句柄 */
export interface LhLoadingHandle {
  close: () => void
}

/** 遮罩展示状态（类名与样式计算入参） */
export interface LhLoadingState {
  fullscreen: boolean
  withText: boolean
}
