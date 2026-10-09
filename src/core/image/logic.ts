import { clamp } from '../shared/sanitize'
import { LH_IMAGE_ZOOM_MAX, LH_IMAGE_ZOOM_MIN, LH_IMAGE_ZOOM_STEP } from './types'
import type { LhImageState, LhImageViewerState } from './types'
import type { LhAriaAttrs } from '../shared/a11y'

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
  return clamp(Math.round(next * 100) / 100, LH_IMAGE_ZOOM_MIN, LH_IMAGE_ZOOM_MAX)
}

/** 旋转（每次 +90°，归一化到 [0, 360)；负角度取模修正） */
export function stepRotate(rotate: number): number {
  return (((rotate + 90) % 360) + 360) % 360
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

/**
 * 图片预览器的无障碍属性包：以 dialog 语义呈现，aria-label 描述当前查看的图片
 *
 * @param id 预览器元素 id
 * @param label 预览器语义文案（如「图片预览」或带序号的「第 2 张，共 5 张」）
 */
export function getImageViewerAria(options: { id?: string; label?: string } = {}): LhAriaAttrs {
  const { id, label } = options
  const attrs: LhAriaAttrs = { role: 'dialog', 'aria-modal': true }
  if (id) attrs.id = id
  if (label) attrs['aria-label'] = label
  return attrs
}
