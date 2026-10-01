/**
 * lh-ui-plus 通用工具函数
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

/**
 * 防抖动函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let lastTime = 0
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
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
