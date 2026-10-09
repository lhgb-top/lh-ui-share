/**
 * Popper 定位引擎（纯函数，无框架依赖）
 *
 * 弹出层（Tooltip / Popover / Popconfirm / Dropdown 等）共用的几何计算：
 * 12 种 placement 摆放、主轴溢出翻转（flip）、交叉轴夹回（shift）。
 * 入参全部是 rect 字面量，不触碰 DOM，可直接单测。
 */

import { clamp, sanitizeNumber } from '../sanitize'

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

const PLACEMENT_DIRS: readonly string[] = ['top', 'bottom', 'left', 'right']

/**
 * 解析方位为「方向 + 对齐」
 *
 * 运行时兜底：JS 侧可能传入类型联合之外的字符串（如 'top-middle'），
 * 非法方向回退 'bottom'、非法对齐回退 'center'，避免垃圾值流进 BEM 类名。
 */
export function parsePlacement(placement: LhPlacement): {
  dir: LhPlacementDir
  align: LhPlacementAlign
} {
  const [rawDir, rawAlign] = String(placement).split('-')
  const dir = PLACEMENT_DIRS.includes(rawDir) ? (rawDir as LhPlacementDir) : 'bottom'
  const align: LhPlacementAlign = rawAlign === 'start' || rawAlign === 'end' ? rawAlign : 'center'
  return { dir, align }
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

/** rect 字段净化：非有限字段归 0，NaN rect 不再流入定位结果（`top: NaNpx`） */
function safeRect(rect: DOMRectLike): DOMRectLike {
  const n = (v: number): number => (Number.isFinite(v) ? v : 0)
  return {
    top: n(rect.top),
    left: n(rect.left),
    width: n(rect.width),
    height: n(rect.height),
    right: n(rect.right),
    bottom: n(rect.bottom),
  }
}

/**
 * 计算弹出层位置
 *
 * 1. flip：主轴方向放不下时翻转方向（仅当翻转后放得下才翻）
 * 2. 按方位摆放
 * 3. shift：交叉轴方向夹回视口
 * 4. 主轴夹回：flip 开启且两侧都放不下时（如 trigger 比 viewport 还高），
 *    主轴也夹进视口；flip 关闭表示调用方接受溢出，不代为搬动
 *
 * 入参 rect 先做字段级非有限净化。
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
  const gap = sanitizeNumber(options.gap, 8)
  const padding = sanitizeNumber(options.padding, 8, { min: 0 })
  const safeTrigger = safeRect(trigger)
  const safePopper = safeRect(popper)
  const safeViewport = safeRect(viewport)
  const { dir: rawDir, align } = parsePlacement(options.placement ?? 'bottom')
  let dir = rawDir

  const fitsOriginal = fitsInViewport(dir, safeTrigger, safePopper, safeViewport, gap, padding)
  const fitsFlipped = fitsInViewport(
    flipDir(dir),
    safeTrigger,
    safePopper,
    safeViewport,
    gap,
    padding
  )
  const bothOverflow = !fitsOriginal && !fitsFlipped

  if (options.flip !== false && !fitsOriginal && fitsFlipped) {
    dir = flipDir(dir)
  }

  const { top, left } = basePosition(dir, align, safeTrigger, safePopper, gap)
  let finalTop = top
  let finalLeft = left

  if (options.shift !== false) {
    if (PRIMARY_AXIS[dir] === 'y') {
      finalLeft = clamp(
        left,
        safeViewport.left + padding,
        Math.max(safeViewport.left + padding, safeViewport.right - safePopper.width - padding)
      )
    } else {
      finalTop = clamp(
        top,
        safeViewport.top + padding,
        Math.max(safeViewport.top + padding, safeViewport.bottom - safePopper.height - padding)
      )
    }
  }

  // 主轴夹回：flip 开启且两侧都放不下时才兜底，flip: false 的调用方接受溢出
  if (options.flip !== false && bothOverflow) {
    if (PRIMARY_AXIS[dir] === 'y') {
      finalTop = clamp(
        finalTop,
        safeViewport.top + padding,
        Math.max(safeViewport.top + padding, safeViewport.bottom - safePopper.height - padding)
      )
    } else {
      finalLeft = clamp(
        finalLeft,
        safeViewport.left + padding,
        Math.max(safeViewport.left + padding, safeViewport.right - safePopper.width - padding)
      )
    }
  }

  // 最后一道安全网：任何路径都不允许弹出层完全离开视口低侧
  const posTop = Math.max(safeViewport.top + padding, finalTop)
  const posLeft = Math.max(safeViewport.left + padding, finalLeft)

  // 交叉轴箭头钳制的安全边界：padding 不应超过弹出层一半，否则上下界反转
  const arrowPadY = Math.min(padding, safePopper.width / 2)
  const arrowPadX = Math.min(padding, safePopper.height / 2)

  return {
    top: posTop,
    left: posLeft,
    placement: buildPlacement(dir, align),
    // 箭头指向触发器的交叉轴中心，并钳制在弹出层边界内，
    // 这样内容很宽/被 shift 夹回时箭头仍指向被点击的元素而非弹出层自身的中点
    arrowOffset:
      PRIMARY_AXIS[dir] === 'y'
        ? clamp(
            safeTrigger.left + safeTrigger.width / 2 - posLeft,
            arrowPadY,
            Math.max(arrowPadY, safePopper.width - arrowPadY)
          )
        : clamp(
            safeTrigger.top + safeTrigger.height / 2 - posTop,
            arrowPadX,
            Math.max(arrowPadX, safePopper.height - arrowPadX)
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
