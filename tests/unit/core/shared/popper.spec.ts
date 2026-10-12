import { describe, it, expect } from 'vitest'
import {
  parsePlacement,
  buildPlacement,
  flipDir,
  basePosition,
  fitsInViewport,
  computePosition,
  getWindowViewport,
  isOutsideViewport,
  type LhDOMRectLike,
  type LhPlacement,
} from '../../../../src/core/shared/popper'

function rect(top: number, left: number, width: number, height: number): LhDOMRectLike {
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
    // shift 关闭后不再做交叉轴夹回，仅剩最后一道安全网：
    // 不允许弹出层越过视口低侧（地板含 padding，与其它钳制约定一致）
    expect(pos.left).toBe(8)
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

describe('popper / clamping edge cases', () => {
  it('clamps against a viewport that does not start at the origin', () => {
    // 嵌套滚动容器 / iframe 场景：视口左上角不在 (0, 0)
    const vp = rect(100, 50, 1000, 800) // top=100 left=50 right=1050 bottom=900
    const trigger = rect(700, 60, 100, 40) // 靠右缘，交叉轴需向左夹回
    const pos = computePosition(trigger, POPPER, vp, { placement: 'bottom-end' })
    expect(pos.left).toBeLessThanOrEqual(vp.right - POPPER.width - 8)
    expect(pos.left).toBeGreaterThanOrEqual(vp.left + 8)
    expect(pos.top).toBeGreaterThanOrEqual(vp.top)
  })

  it('clamps the popper onto the viewport when both primary sides overflow', () => {
    // 弹出层比整个视口还高：翻转无意义，主轴夹回把它顶到 padding 边缘，
    // 而非整体伸出屏幕外（比视口高的弹出层不可能完全装进视口，断言钳制位置即可）
    const huge = rect(0, 0, 200, 900)
    const pos = computePosition(TRIGGER, huge, VIEWPORT, { placement: 'bottom' })
    expect(pos.top).toBe(8)
    expect(pos.left).toBeGreaterThanOrEqual(0)
  })

  it('treats non-finite gap and padding as the defaults', () => {
    // NaN gap/padding 曾经把 clamp 边界污染成 NaN，导致位置全部失效
    const pos = computePosition(TRIGGER, POPPER, VIEWPORT, {
      placement: 'bottom',
      gap: NaN,
      padding: NaN,
    })
    expect(Number.isFinite(pos.top)).toBe(true)
    expect(Number.isFinite(pos.left)).toBe(true)
    expect(pos.top).toBe(TRIGGER.bottom + 8)
  })

  it('never applies a negative padding', () => {
    const pos = computePosition(TRIGGER, POPPER, VIEWPORT, {
      placement: 'bottom-end',
      padding: -100,
    })
    expect(pos.left).toBeGreaterThanOrEqual(0)
    expect(pos.left + POPPER.width).toBeLessThanOrEqual(VIEWPORT.right)
  })

  it('clamps the high side so the popper never sticks out of the viewport edge', () => {
    // 回归：flip/shift 关闭时调用方接受溢出，但安全网此前只钳低侧，
    // 贴右缘的触发器 + 超宽弹出层会整体伸出视口右侧
    const trigger = rect(100, 850, 120, 40) // 贴右缘
    const wide = rect(0, 0, 700, 100)
    const pos = computePosition(trigger, wide, VIEWPORT, {
      placement: 'bottom-start',
      flip: false,
      shift: false,
    })
    expect(pos.left + wide.width).toBeLessThanOrEqual(VIEWPORT.right)
    expect(pos.left).toBeGreaterThanOrEqual(0)
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

describe('popper round 2: NaN 净化 / 非法 placement / flip 关闭语义', () => {
  it('sanitizes NaN rect fields to 0 instead of leaking NaN into the result', () => {
    // 回归：rect 字段 NaN 曾直接产出 top: NaNpx
    const dirtyTrigger = { top: NaN, left: 400, width: 100, height: 40, right: 500, bottom: NaN }
    const pos = computePosition(dirtyTrigger as unknown as LhDOMRectLike, POPPER, VIEWPORT, {
      placement: 'bottom',
    })
    expect(Number.isFinite(pos.top)).toBe(true)
    expect(Number.isFinite(pos.left)).toBe(true)
    expect(Number.isFinite(pos.arrowOffset)).toBe(true)

    const dirtyPopper = { top: 0, left: NaN, width: NaN, height: 100, right: NaN, bottom: 100 }
    const pos2 = computePosition(TRIGGER, dirtyPopper as unknown as LhDOMRectLike, VIEWPORT)
    expect(Number.isFinite(pos2.top)).toBe(true)
    expect(Number.isFinite(pos2.left)).toBe(true)
  })

  it('falls back to bottom/center for placements outside the union (JS callers)', () => {
    expect(parsePlacement('top-middle' as LhPlacement)).toEqual({ dir: 'top', align: 'center' })
    expect(parsePlacement('sideways' as LhPlacement)).toEqual({ dir: 'bottom', align: 'center' })
    expect(parsePlacement(undefined as unknown as LhPlacement)).toEqual({
      dir: 'bottom',
      align: 'center',
    })
  })

  it('flip:false accepts primary-axis overflow instead of clamping', () => {
    // 高触发器（top=100、bottom=800、视口 800）：bottom 放不下、top 也放不下（两侧均溢出）。
    // flip 默认开启时会主轴夹回；flip:false 表示调用方接受溢出，不代为搬动。
    const tall = rect(100, 400, 100, 700)
    const pos = computePosition(tall, POPPER, VIEWPORT, { placement: 'bottom', flip: false })
    expect(pos.placement).toBe('bottom')
    expect(pos.top).toBe(800 + 8) // 原样放到视口底之外

    // 默认（flip 开启）同样两侧溢出时主轴夹回视口内
    const clamped = computePosition(tall, POPPER, VIEWPORT, { placement: 'bottom' })
    expect(clamped.top).toBeLessThan(pos.top)
  })

  it('isOutsideViewport detects fully offscreen rects (round 2)', () => {
    expect(isOutsideViewport(rect(-200, 400, 100, 100), VIEWPORT)).toBe(true) // 视口上方
    expect(isOutsideViewport(rect(900, 400, 100, 100), VIEWPORT)).toBe(true) // 视口下方
    expect(isOutsideViewport(rect(100, -300, 100, 100), VIEWPORT)).toBe(true) // 视口左侧
    expect(isOutsideViewport(TRIGGER, VIEWPORT)).toBe(false) // 视口内
    // 部分可见（跨界）不算离开视口
    expect(isOutsideViewport(rect(-50, 400, 100, 100), VIEWPORT)).toBe(false)
  })
})
