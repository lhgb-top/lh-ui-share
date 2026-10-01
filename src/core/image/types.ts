/** 图片裁切模式（原生 object-fit） */
export type LhImageFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'

/** 加载状态 */
export interface LhImageState {
  fit: LhImageFit
  error: boolean
  loaded: boolean
  preview: boolean
}

/** 预览器状态 */
export interface LhImageViewerState {
  zoom: number
  rotate: number
  index: number
  total: number
}

/** 缩放边界 */
export const LH_IMAGE_ZOOM_MIN = 0.25
export const LH_IMAGE_ZOOM_MAX = 4
export const LH_IMAGE_ZOOM_STEP = 0.25
