/**
 * Popper 定位引擎（纯函数，无框架依赖）
 *
 * 弹出层（Tooltip / Popover / Popconfirm / Dropdown 等）共用的几何计算：
 * 12 种 placement 摆放、主轴溢出翻转（flip）、交叉轴夹回（shift）。
 * 入参全部是 rect 字面量，不触碰 DOM，可直接单测。
 */

/** 弹出层方位（方向 + 对齐） */
export type LhPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'

export type LhPlacementDir = 'top' | 'bottom' | 'left' | 'right'
export type LhPlacementAlign = 'start' | 'center' | 'end'

/** 与 DOMRect 同构的最小结构，便于传值与测试 */
export interface DOMRectLike {
  top: number
  left: number
  width: number
  height: number
  right: number
  bottom: number
}

export interface ComputePositionOptions {
  /** 期望方位（默认 'bottom'） */
  placement?: LhPlacement
  /** 弹出层与触发器之间的间距（默认 8） */
  gap?: number
  /** 视口安全边距（默认 8） */
  padding?: number
  /** 主轴溢出时翻转方向（默认开启） */
  flip?: boolean
  /** 交叉轴溢出时夹回视口（默认开启） */
  shift?: boolean
}

export interface PopperPosition {
  top: number
  left: number
  /** 翻转后实际生效的方位，组件据此切换箭头类名 */
  placement: LhPlacement
  /** 箭头在交叉轴上的偏移（自弹出层交叉轴起点算起的 px），始终指向触发器中心 */
  arrowOffset: number
}

const PRIMARY_AXIS: Record<LhPlacementDir, 'x' | 'y'> = {
  top: 'y',
  bottom: 'y',
  left: 'x',
  right: 'x',
}

/**
 * 解析方位为「方向 + 对齐」
 */
export function parsePlacement(placement: LhPlacement): {
  dir: LhPlacementDir
  align: LhPlacementAlign
} {
  const [dir, align] = placement.split('-') as [LhPlacementDir, LhPlacementAlign | undefined]
  return { dir, align: align ?? 'center' }
}

/**
 * 由方向与对齐重建方位
 */
export function buildPlacement(dir: LhPlacementDir, align: LhPlacementAlign): LhPlacement {
  return align === 'center' ? dir : `${dir}-${align}`
}

/**
 * 主轴翻转：top ↔ bottom、left ↔ right
 */
export function flipDir(dir: LhPlacementDir): LhPlacementDir {
  switch (dir) {
    case 'top':
      return 'bottom'
    case 'bottom':
      return 'top'
    case 'left':
      return 'right'
    default:
      return 'left'
  }
}

/**
 * 按方位计算的基础摆放位置（不考虑视口约束）
 */
export function basePosition(
  dir: LhPlacementDir,
  align: LhPlacementAlign,
  trigger: DOMRectLike,
  popper: DOMRectLike,
  gap: number
): { top: number; left: number } {
  let top: number
  let left: number

  if (dir === 'top') {
    top = trigger.top - popper.height - gap
  } else if (dir === 'bottom') {
    top = trigger.bottom + gap
  } else if (align === 'start') {
    top = trigger.top
  } else if (align === 'end') {
    top = trigger.bottom - popper.height
  } else {
    top = trigger.top + (trigger.height - popper.height) / 2
  }

  if (dir === 'left') {
    left = trigger.left - popper.width - gap
  } else if (dir === 'right') {
    left = trigger.right + gap
  } else if (align === 'start') {
    left = trigger.left
  } else if (align === 'end') {
    left = trigger.right - popper.width
  } else {
    left = trigger.left + (trigger.width - popper.width) / 2
  }

  return { top, left }
}

/**
 * 判断指定方向上弹出层是否完整落在视口内（主轴）
 */
export function fitsInViewport(
  dir: LhPlacementDir,
  trigger: DOMRectLike,
  popper: DOMRectLike,
  viewport: DOMRectLike,
  gap: number,
  padding: number
): boolean {
  switch (dir) {
    case 'top':
      return trigger.top - gap - popper.height >= viewport.top + padding
    case 'bottom':
      return trigger.bottom + gap + popper.height <= viewport.bottom - padding
    case 'left':
      return trigger.left - gap - popper.width >= viewport.left + padding
    default:
      return trigger.right + gap + popper.width <= viewport.right - padding
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 计算弹出层位置
 *
 * 1. flip：主轴方向放不下时翻转方向（仅当翻转后放得下才翻）
 * 2. 按方位摆放
 * 3. shift：交叉轴方向夹回视口
 *
 * @param trigger 触发器 rect
 * @param popper 弹出层 rect
 * @param viewport 视口 rect（一般 { top: 0, left: 0, width: innerWidth, height: innerHeight }）
 */
export function computePosition(
  trigger: DOMRectLike,
  popper: DOMRectLike,
  viewport: DOMRectLike,
  options: ComputePositionOptions = {}
): PopperPosition {
  const gap = options.gap ?? 8
  const padding = options.padding ?? 8
  const { dir: rawDir, align } = parsePlacement(options.placement ?? 'bottom')
  let dir = rawDir

  if (options.flip !== false && !fitsInViewport(dir, trigger, popper, viewport, gap, padding)) {
    const flipped = flipDir(dir)
    if (fitsInViewport(flipped, trigger, popper, viewport, gap, padding)) {
      dir = flipped
    }
  }

  const { top, left } = basePosition(dir, align, trigger, popper, gap)
  let finalTop = top
  let finalLeft = left

  if (options.shift !== false) {
    if (PRIMARY_AXIS[dir] === 'y') {
      finalLeft = clamp(
        left,
        padding,
        Math.max(padding, viewport.width - popper.width - padding)
      )
    } else {
      finalTop = clamp(
        top,
        padding,
        Math.max(padding, viewport.height - popper.height - padding)
      )
    }
  }

  const posTop = Math.max(0, finalTop)
  const posLeft = Math.max(0, finalLeft)

  return {
    top: posTop,
    left: posLeft,
    placement: buildPlacement(dir, align),
    // 箭头指向触发器的交叉轴中心，并钳制在弹出层边界内，
    // 这样内容很宽/被 shift 夹回时箭头仍指向被点击的元素而非弹出层自身的中点
    arrowOffset:
      PRIMARY_AXIS[dir] === 'y'
        ? clamp(
            trigger.left + trigger.width / 2 - posLeft,
            padding,
            Math.max(padding, popper.width - padding)
          )
        : clamp(
            trigger.top + trigger.height / 2 - posTop,
            padding,
            Math.max(padding, popper.height - padding)
          ),
  }
}

/**
 * 由浏览器窗口构造视口 rect
 */
export function getWindowViewport(): DOMRectLike {
  const width = typeof window === 'undefined' ? 0 : window.innerWidth
  const height = typeof window === 'undefined' ? 0 : window.innerHeight
  return { top: 0, left: 0, width, height, right: width, bottom: height }
}

/**
 * rect 是否已完全离开视口（滚动时弹出层的触发器不可见即应关闭）
 */
export function isOutsideViewport(rect: DOMRectLike, viewport: DOMRectLike): boolean {
  return (
    rect.bottom <= viewport.top ||
    rect.top >= viewport.bottom ||
    rect.right <= viewport.left ||
    rect.left >= viewport.right
  )
}
