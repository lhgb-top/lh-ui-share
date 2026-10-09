import { describe, expect, it } from 'vitest'
import {
  getImageClassNames,
  getViewerImageStyle,
  normalizePreviewList,
  stepRotate,
  stepViewerIndex,
  stepZoom,
  getImageViewerAria,
} from '../../../src/core/image'

describe('LhImage core', () => {
  it('computes class names', () => {
    expect(
      getImageClassNames({ fit: 'cover', error: true, loaded: false, preview: true }),
    ).toEqual(['lh-image', 'lh-image--error', 'lh-image--previewable'])
  })

  it('normalizes the preview list', () => {
    expect(normalizePreviewList('a.png', undefined)).toEqual(['a.png'])
    expect(normalizePreviewList('a.png', ['b.png', 'c.png'])).toEqual(['b.png', 'c.png'])
    expect(normalizePreviewList('a.png', [])).toEqual(['a.png'])
  })

  it('steps zoom with clamping', () => {
    expect(stepZoom(1, 1)).toBe(1.25)
    expect(stepZoom(4, 1)).toBe(4)
    expect(stepZoom(0.25, -1)).toBe(0.25)
  })

  it('rotates modulo 360', () => {
    expect(stepRotate(0)).toBe(90)
    expect(stepRotate(270)).toBe(0)
  })

  it('wraps the viewer index', () => {
    expect(stepViewerIndex(0, 3, -1)).toBe(2)
    expect(stepViewerIndex(2, 3, 1)).toBe(0)
  })

  it('builds the image transform', () => {
    expect(getViewerImageStyle({ zoom: 1.5, rotate: 90, index: 0, total: 1 })).toEqual({
      transform: 'scale(1.5) rotate(90deg)',
    })
  })

  it('normalizes rotations into [0, 360) including negatives (round 2)', () => {
    // 回归：JS 的 % 保留被除数符号，stepRotate(-90) 曾返回 -90 破坏区间约定
    expect(stepRotate(0)).toBe(90)
    expect(stepRotate(270)).toBe(0)
    expect(stepRotate(-90)).toBe(0)
    expect(stepRotate(-180)).toBe(270)
    expect(stepRotate(360)).toBe(90)
  })
})

describe('LhImage accessibility', () => {
  it('emits viewer aria attributes', () => {
    expect(getImageViewerAria({ id: 'v1', label: '图片预览' })).toEqual({
      role: 'dialog',
      'aria-modal': true,
      id: 'v1',
      'aria-label': '图片预览',
    })
  })
})