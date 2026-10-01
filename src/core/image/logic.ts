import { LH_IMAGE_ZOOM_MAX, LH_IMAGE_ZOOM_MIN, LH_IMAGE_ZOOM_STEP } from './types'
import type { LhImageState, LhImageViewerState } from './types'

/** 类名 */
export function getImageClassNames(state: LhImageState): string[] {
  const classes = ['lh-image']
  if (state.error) classes.push('lh-image--error')
  if (state.preview) classes.push('lh-image--previewable')
  return classes
}

/** 规范化预览列表：未传 previewSrcList 时退化为 [src] */
export function normalizePreviewList(src: string, previewSrcList: string[] | undefined): string[] {
  if (previewSrcList && previewSrcList.length > 0) return previewSrcList
  return [src]
}

/** 缩放（按步长累加并钳制） */
export function stepZoom(zoom: number, direction: 1 | -1): number {
  const next = zoom + direction * LH_IMAGE_ZOOM_STEP
  return Math.min(Math.max(Math.round(next * 100) / 100, LH_IMAGE_ZOOM_MIN), LH_IMAGE_ZOOM_MAX)
}

/** 旋转（每次 +90°，归一化到 [0, 360)） */
export function stepRotate(rotate: number): number {
  return (rotate + 90) % 360
}

/** 切图下标（循环） */
export function stepViewerIndex(index: number, total: number, delta: number): number {
  if (total <= 0) return 0
  return (index + delta + total) % total
}

/** 预览器图 transform */
export function getViewerImageStyle(state: LhImageViewerState): Record<string, string> {
  return {
    transform: `scale(${state.zoom}) rotate(${state.rotate}deg)`,
  }
}
