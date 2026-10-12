import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createNamespace,
  debounce,
  deepMerge,
  generateId,
  generateRandomId,
  getEventValue,
  getScrollbarWidth,
  isEmpty,
  isNumber,
  isPlainObject,
  isString,
  throttle,
  toggleClass,
} from '../../src/utils'

describe('utils / 类型守卫与空值', () => {
  it('isEmpty only treats null / undefined / 空串 as empty', () => {
    expect(isEmpty(null)).toBe(true)
    expect(isEmpty(undefined)).toBe(true)
    expect(isEmpty('')).toBe(true)
    expect(isEmpty(0)).toBe(false)
    expect(isEmpty(false)).toBe(false)
    expect(isEmpty([])).toBe(false)
  })

  it('isString / isNumber / isPlainObject guard types', () => {
    expect(isString('x')).toBe(true)
    expect(isString(1)).toBe(false)
    expect(isNumber(1)).toBe(true)
    // NaN 是 number 类型但不被视为有效数字
    expect(isNumber(NaN)).toBe(false)
    expect(isNumber('1')).toBe(false)
    expect(isPlainObject({})).toBe(true)
    expect(isPlainObject([])).toBe(false)
    expect(isPlainObject(null)).toBe(false)
    expect(isPlainObject(new Date())).toBe(false)
  })
})

describe('utils / id 生成', () => {
  it('generateId 前缀唯一且单调递增', () => {
    const a = generateId()
    const b = generateId('row')
    expect(a.startsWith('lh_')).toBe(true)
    expect(b.startsWith('row_')).toBe(true)
    expect(a).not.toBe(b)
  })

  it('generateRandomId returns short alphanumeric ids', () => {
    const id = generateRandomId()
    expect(id).toMatch(/^[a-z0-9]{2,9}$/)
    expect(generateRandomId()).not.toBe(id)
  })
})

describe('utils / debounce & throttle', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('debounce 只在静默期后执行一次', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced()
    debounced()
    debounced('最后参数')
    vi.advanceTimersByTime(99)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('最后参数')
  })

  it('throttle 在时间窗内只执行一次', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)
    throttled()
    throttled()
    throttled()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('debounce 支持 cancel 与 flush 手动控制', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced('a')
    debounced.cancel()
    vi.advanceTimersByTime(200)
    expect(fn).not.toHaveBeenCalled()
    debounced('b')
    debounced.flush()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('b')
    // flush 后无挂起调用，重复 flush 为空操作
    debounced.flush()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('throttle 尾沿补执行窗口内最后一次调用', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = throttle(fn, 100)
    throttled('first')
    expect(fn).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(50)
    throttled('last')
    expect(fn).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(50)
    // 尾沿在窗口结束时补执行，携带最后一次参数
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith('last')
    // cancel 可终止尚未执行的尾沿
    throttled('pending')
    throttled.cancel()
    vi.advanceTimersByTime(200)
    expect(fn).toHaveBeenCalledTimes(2)
  })
})

describe('utils / deepMerge', () => {
  it('深合并普通对象，浅覆盖其它类型', () => {
    const target = { a: { x: 1, y: 2 }, b: 'keep', list: [1] as unknown }
    const merged = deepMerge(target, { a: { y: 3, z: 4 }, b: 'new', list: [2] } as never)
    expect(merged).toEqual({ a: { x: 1, y: 3, z: 4 }, b: 'new', list: [2] })
  })

  it('undefined 来源键不覆盖目标值，空来源被忽略', () => {
    const target = { a: 1 }
    expect(deepMerge(target, { a: undefined } as never)).toEqual({ a: 1 })
    expect(deepMerge(target, null as never, undefined as never)).toEqual({ a: 1 })
  })

  it('不修改来源对象', () => {
    const source = { a: { x: 1 } }
    deepMerge({ a: { x: 9 } }, source)
    expect(source).toEqual({ a: { x: 1 } })
  })
})

describe('utils / DOM 工具', () => {
  it('getScrollbarWidth 在 jsdom 下返回 >= 0 且缓存', () => {
    const first = getScrollbarWidth()
    expect(first).toBeGreaterThanOrEqual(0)
    expect(getScrollbarWidth()).toBe(first)
  })

  it('toggleClass 支持 force 三态', () => {
    const el = document.createElement('div')
    toggleClass(el, 'on')
    expect(el.classList.contains('on')).toBe(true)
    toggleClass(el, 'on')
    expect(el.classList.contains('on')).toBe(false)
    toggleClass(el, 'on', true)
    expect(el.classList.contains('on')).toBe(true)
    toggleClass(el, 'on', true)
    expect(el.classList.contains('on')).toBe(true)
    toggleClass(el, 'on', false)
    expect(el.classList.contains('on')).toBe(false)
  })

  it('getEventValue 读取输入值', () => {
    const input = document.createElement('input')
    input.value = 'hello'
    const event = new Event('input', { bubbles: true })
    Object.defineProperty(event, 'target', { value: input })
    expect(getEventValue(event)).toBe('hello')
  })
})

describe('utils / createNamespace', () => {
  it('产出 BEM 命名函数（与组件样式唯一源对齐）', () => {
    const ns = createNamespace('transfer')
    expect(ns.b()).toBe('lh-transfer')
    expect(ns.e('panel')).toBe('lh-transfer__panel')
    expect(ns.m('disabled')).toBe('lh-transfer--disabled')
    expect(ns.em('panel', 'left')).toBe('lh-transfer__panel--left')
  })

  it('is() 三态输出状态类', () => {
    const ns = createNamespace('button')
    expect(ns.is('loading', true)).toBe('is-loading')
    expect(ns.is('loading', false)).toBe('')
    expect(ns.is('loading', undefined)).toBe('')
    // 字符串状态直接作为状态名
    expect(ns.is('size', 'large')).toBe('is-large')
  })
})
