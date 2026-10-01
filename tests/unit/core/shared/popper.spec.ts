import { describe, it, expect } from 'vitest'
import {
  parsePlacement,
  buildPlacement,
  flipDir,
  basePosition,
  fitsInViewport,
  computePosition,
  getWindowViewport,
  type DOMRectLike,
  type LhPlacement,
} from '../../../../src/core/shared/popper'

function rect(top: number, left: number, width: number, height: number): DOMRectLike {
  return { top, left, width, height, right: left + width, bottom: top + height }
}

const VIEWPORT = rect(0, 0, 1000, 800)
const TRIGGER = rect(400, 400, 100, 40) // 中心 (450, 420)
const POPPER = rect(0, 0, 200, 100)

describe('popper / parsePlacement', () => {
  it('parses direction-only placements as center align', () => {
    expect(parsePlacement('top')).toEqual({ dir: 'top', align: 'center' })
    expect(parsePlacement('bottom')).toEqual({ dir: 'bottom', align: 'center' })
    expect(parsePlacement('left')).toEqual({ dir: 'left', align: 'center' })
    expect(parsePlacement('right')).toEqual({ dir: 'right', align: 'center' })
  })

  it('parses dir + align', () => {
    expect(parsePlacement('top-start')).toEqual({ dir: 'top', align: 'start' })
    expect(parsePlacement('bottom-end')).toEqual({ dir: 'bottom', align: 'end' })
    expect(parsePlacement('left-start')).toEqual({ dir: 'left', align: 'start' })
    expect(parsePlacement('right-end')).toEqual({ dir: 'right', align: 'end' })
  })

  it('buildPlacement is the inverse of parsePlacement', () => {
    const placements: LhPlacement[] = [
      'top',
      'top-start',
      'top-end',
      'bottom',
      'bottom-start',
      'bottom-end',
      'left',
      'left-start',
      'left-end',
      'right',
      'right-start',
      'right-end',
    ]
    placements.forEach((p) => {
      const { dir, align } = parsePlacement(p)
      expect(buildPlacement(dir, align)).toBe(p)
    })
  })
})

describe('popper / flipDir', () => {
  it('flips along the primary axis', () => {
    expect(flipDir('top')).toBe('bottom')
    expect(flipDir('bottom')).toBe('top')
    expect(flipDir('left')).toBe('right')
    expect(flipDir('right')).toBe('left')
  })
})

describe('popper / basePosition', () => {
  it('places above the trigger with a gap', () => {
    const { top, left } = basePosition('top', 'center', TRIGGER, POPPER, 8)
    expect(top).toBe(400 - 100 - 8) // 292
    expect(left).toBe(400 + (100 - 200) / 2) // 350
  })

  it('places below the trigger with a gap', () => {
    const { top, left } = basePosition('bottom', 'center', TRIGGER, POPPER, 8)
    expect(top).toBe(440 + 8) // 448
    expect(left).toBe(350)
  })

  it('aligns start / end on the cross axis (bottom)', () => {
    expect(basePosition('bottom', 'start', TRIGGER, POPPER, 8).left).toBe(400)
    expect(basePosition('bottom', 'end', TRIGGER, POPPER, 8).left).toBe(500 - 200) // 300
  })

  it('places left / right of the trigger with a gap', () => {
    expect(basePosition('left', 'center', TRIGGER, POPPER, 8).left).toBe(400 - 200 - 8) // 192
    expect(basePosition('right', 'center', TRIGGER, POPPER, 8).left).toBe(500 + 8) // 508
  })

  it('aligns start / end on the cross axis (right)', () => {
    expect(basePosition('right', 'start', TRIGGER, POPPER, 8).top).toBe(400)
    expect(basePosition('right', 'end', TRIGGER, POPPER, 8).top).toBe(440 - 100) // 340
  })
})

describe('popper / fitsInViewport', () => {
  it('detects vertical fit', () => {
    // 触发器距顶部 150，上方放 100 高的弹出层仍有余量
    const topTrigger = rect(150, 400, 100, 40)
    expect(fitsInViewport('top', topTrigger, POPPER, VIEWPORT, 8, 8)).toBe(true)
    expect(fitsInViewport('bottom', topTrigger, POPPER, VIEWPORT, 8, 8)).toBe(true)
    const nearBottom = rect(750, 400, 100, 40)
    expect(fitsInViewport('bottom', nearBottom, POPPER, VIEWPORT, 8, 8)).toBe(false)
    const nearTop = rect(20, 400, 100, 40)
    expect(fitsInViewport('top', nearTop, POPPER, VIEWPORT, 8, 8)).toBe(false)
  })

  it('detects horizontal fit', () => {
    // 触发器距左缘 250，左侧放 200 宽的弹出层仍有余量
    const leftTrigger = rect(400, 250, 100, 40)
    expect(fitsInViewport('left', leftTrigger, POPPER, VIEWPORT, 8, 8)).toBe(true)
    expect(fitsInViewport('right', leftTrigger, POPPER, VIEWPORT, 8, 8)).toBe(true)
    const nearRight = rect(400, 850, 100, 40)
    expect(fitsInViewport('right', nearRight, POPPER, VIEWPORT, 8, 8)).toBe(false)
    const nearLeft = rect(400, 30, 100, 40)
    expect(fitsInViewport('left', nearLeft, POPPER, VIEWPORT, 8, 8)).toBe(false)
  })
})

describe('popper / computePosition', () => {
  it('keeps the requested placement when it fits', () => {
    const pos = computePosition(TRIGGER, POPPER, VIEWPORT, { placement: 'top' })
    expect(pos.placement).toBe('top')
    expect(pos.top).toBe(292)
    expect(pos.left).toBe(350)
  })

  it('defaults to bottom', () => {
    expect(computePosition(TRIGGER, POPPER, VIEWPORT, {}).placement).toBe('bottom')
  })

  it('respects a custom gap', () => {
    const pos = computePosition(TRIGGER, POPPER, VIEWPORT, { placement: 'bottom', gap: 20 })
    expect(pos.top).toBe(440 + 20)
  })

  it('flips when the primary axis overflows', () => {
    const nearBottom = rect(750, 400, 100, 40)
    const pos = computePosition(nearBottom, POPPER, VIEWPORT, { placement: 'bottom' })
    expect(pos.placement).toBe('top')
    expect(pos.top).toBe(750 - 100 - 8)
  })

  it('does not flip when the flipped side also overflows', () => {
    const hugePopper = rect(0, 0, 200, 900)
    const pos = computePosition(TRIGGER, hugePopper, VIEWPORT, { placement: 'bottom' })
    expect(pos.placement).toBe('bottom')
  })

  it('can disable flip', () => {
    const nearBottom = rect(750, 400, 100, 40)
    const pos = computePosition(nearBottom, POPPER, VIEWPORT, {
      placement: 'bottom',
      flip: false,
    })
    expect(pos.placement).toBe('bottom')
  })

  it('shifts the popper back into the viewport on the cross axis', () => {
    // 触发器左缘在视口外，bottom-start 的弹出层会跟着溢出，需夹回
    const nearLeft = rect(400, -100, 100, 40)
    const pos = computePosition(nearLeft, POPPER, VIEWPORT, { placement: 'bottom-start' })
    expect(pos.placement).toBe('bottom-start')
    expect(pos.left).toBe(8) // padding
  })

  it('shifts right-aligned poppers that overflow the right edge', () => {
    // 触发器右缘超出视口，bottom-end 的弹出层跟着溢出，夹到右内边距
    const nearRight = rect(400, 950, 100, 40)
    const pos = computePosition(nearRight, POPPER, VIEWPORT, { placement: 'bottom-end' })
    expect(pos.left).toBe(1000 - 200 - 8) // 792
  })

  it('can disable shift', () => {
    const nearLeft = rect(400, -100, 100, 40)
    const pos = computePosition(nearLeft, POPPER, VIEWPORT, {
      placement: 'bottom-start',
      shift: false,
    })
    // shift 关闭后不再夹回，但仍受非负约束
    expect(pos.left).toBe(0)
  })

  it('never returns negative coordinates', () => {
    const pos = computePosition(TRIGGER, rect(0, 0, 5000, 5000), VIEWPORT, {
      placement: 'top-start',
      shift: false,
    })
    expect(pos.top).toBeGreaterThanOrEqual(0)
    expect(pos.left).toBeGreaterThanOrEqual(0)
  })

  it('points the arrow at the trigger center on the cross axis', () => {
    // top/bottom：交叉轴为 x，箭头偏移 = 触发器中心 x - 弹出层 left
    const pos = computePosition(TRIGGER, POPPER, VIEWPORT, { placement: 'bottom' })
    expect(pos.arrowOffset).toBe(450 - pos.left)
  })

  it('keeps the arrow inside the popper when the trigger is off-center', () => {
    // 触发器在弹出层右缘之外，箭头被钳到弹出层右内边距处
    const farRight = rect(400, 960, 100, 40)
    const pos = computePosition(farRight, POPPER, VIEWPORT, { placement: 'bottom-end' })
    expect(pos.arrowOffset).toBeLessThanOrEqual(POPPER.width - 8)
    expect(pos.arrowOffset).toBeGreaterThanOrEqual(8)

    // 触发器在弹出层左缘之外，箭头被钳到左内边距处
    const farLeft = rect(400, -60, 100, 40)
    const pos2 = computePosition(farLeft, POPPER, VIEWPORT, { placement: 'bottom-start' })
    expect(pos2.arrowOffset).toBe(8)
  })

  it('points the arrow at the trigger center on left/right placements', () => {
    const pos = computePosition(TRIGGER, POPPER, VIEWPORT, { placement: 'right' })
    expect(pos.arrowOffset).toBe(420 - pos.top)
  })

  it('handles all 12 placements without throwing', () => {
    const placements: LhPlacement[] = [
      'top',
      'top-start',
      'top-end',
      'bottom',
      'bottom-start',
      'bottom-end',
      'left',
      'left-start',
      'left-end',
      'right',
      'right-start',
      'right-end',
    ]
    placements.forEach((p) => {
      const pos = computePosition(TRIGGER, POPPER, VIEWPORT, { placement: p })
      expect(Number.isFinite(pos.top)).toBe(true)
      expect(Number.isFinite(pos.left)).toBe(true)
    })
  })
})

describe('popper / getWindowViewport', () => {
  it('returns a viewport-sized rect at the origin', () => {
    const v = getWindowViewport()
    expect(v.top).toBe(0)
    expect(v.left).toBe(0)
    expect(v.right).toBe(v.width)
    expect(v.bottom).toBe(v.height)
  })
})
