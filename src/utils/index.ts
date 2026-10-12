/**
 * lh-ui 家族通用工具函数
 */

/**
 * 生成唯一 ID
 */
let _idCounter = 0
export function generateId(prefix = 'lh'): string {
  return `${prefix}_${Date.now()}_${++_idCounter}`
}

/**
 * 生成随机 ID
 */
export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 9)
}

/**
 * 判断是否为空值
 */
export function isEmpty(val: unknown): boolean {
  return val === null || val === undefined || val === ''
}

/**
 * 类型守卫：判断是否为字符串
 */
export function isString(val: unknown): val is string {
  return typeof val === 'string'
}

/**
 * 类型守卫：判断是否为数字
 */
export function isNumber(val: unknown): val is number {
  return typeof val === 'number' && !Number.isNaN(val)
}

/**
 * 类型守卫：判断是否为普通对象
 */
export function isPlainObject(val: unknown): val is Record<string, unknown> {
  return Object.prototype.toString.call(val) === '[object Object]'
}

/** 防抖函数（带 cancel / flush 手动控制） */
export interface LhDebounced<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void
  /** 取消尚未执行的挂起调用 */
  cancel(): void
  /** 立即执行尚未触发的挂起调用（无挂起时为空操作） */
  flush(): void
}

/**
 * 防抖动函数：静默期内的多次调用只执行最后一次。
 * 定时器闭包不再黑盒——需要提前终止（组件卸载）用 cancel，需要立即取结果用 flush。
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
): LhDebounced<T> {
  let timer: ReturnType<typeof setTimeout> | null = null
  // 箭头闭包词法捕获 this，跨 setTimeout 边界保留调用方 this（直接别名 this 会触发
  // @typescript-eslint/no-this-alias，见仓内 lint 规则集）
  let pendingCall: (() => void) | null = null

  const debounced = function (this: unknown, ...args: Parameters<T>) {
    pendingCall = () => fn.apply(this, args)
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      const call = pendingCall
      pendingCall = null
      call?.()
    }, delay)
  } as LhDebounced<T>

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    pendingCall = null
  }

  debounced.flush = () => {
    if (!timer) return
    clearTimeout(timer)
    timer = null
    const call = pendingCall
    pendingCall = null
    call?.()
  }

  return debounced
}

/** 节流函数（头沿立即执行 + 尾沿补执行，带 cancel） */
export interface LhThrottled<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void
  /** 取消尚未执行的尾沿调用 */
  cancel(): void
}

/**
 * 节流函数：时间窗内只执行一次——窗口起点立即执行（头沿），
 * 窗口内的最后一次调用在窗口结束时补执行（尾沿），滚动/拖拽等高频事件不再丢结尾帧。
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
): LhThrottled<T> {
  let lastTime = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  const throttled = function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now()
    const remaining = delay - (now - lastTime)
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      lastTime = now
      fn.apply(this, args)
    } else if (!timer) {
      timer = setTimeout(() => {
        timer = null
        lastTime = Date.now()
        fn.apply(this, args)
      }, remaining)
    }
  } as LhThrottled<T>

  throttled.cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    lastTime = 0
  }

  return throttled
}

/**
 * 深合并对象
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  for (const source of sources) {
    if (!source) continue
    for (const key of Object.keys(source)) {
      const targetVal = target[key]
      const sourceVal = source[key]
      if (isPlainObject(targetVal) && isPlainObject(sourceVal)) {
        (target as Record<string, any>)[key] = deepMerge(targetVal as Record<string, any>, sourceVal as Record<string, any>)
      } else if (sourceVal !== undefined) {
        (target as Record<string, any>)[key] = sourceVal
      }
    }
  }
  return target
}

/**
 * 获取滚动条宽度
 */
let _scrollbarWidth: number | undefined
export function getScrollbarWidth(): number {
  if (_scrollbarWidth !== undefined) return _scrollbarWidth
  // SSR / 非 DOM 环境（如 uniapp 的部分端）下没有 document，直接视为无滚动条
  if (typeof document === 'undefined') return 0
  const outer = document.createElement('div')
  outer.style.visibility = 'hidden'
  outer.style.overflow = 'scroll'
  document.body.appendChild(outer)
  const inner = document.createElement('div')
  outer.appendChild(inner)
  _scrollbarWidth = outer.offsetWidth - inner.offsetWidth
  outer.remove()
  return _scrollbarWidth
}

/**
 * 添加/移除 CSS class
 */
export function toggleClass(el: HTMLElement, className: string, force?: boolean): void {
  if (force === true) {
    el.classList.add(className)
  } else if (force === false) {
    el.classList.remove(className)
  } else {
    el.classList.toggle(className)
  }
}

/**
 * 从事件中提取目标值
 */
export function getEventValue(e: Event): string {
  const target = e.target as HTMLInputElement
  return target.value
}

// composables（useLhSize 等）依赖 Vue，属于各框架 UI 层，不在 share 导出；
// BEM 纯函数版 createNamespace 供各框架 composables 包装
export { createNamespace } from './namespace'
export type { LhNamespace } from './namespace'

// CSS 变量工具：toCssVarName 幂等前缀（防止 --lh---lh- 二次前缀），cssVars 快捷转换，
// stripCssVarName 反向剥前缀（usePresetTheme 产出 ConfigProvider 兼容 themeVars 用）
export { toCssVarName, cssVars, stripCssVarName } from './css-var'
