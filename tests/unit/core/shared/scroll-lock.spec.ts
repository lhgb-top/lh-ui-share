/**
 * 滚动锁引用计数：跨组件共享同一 target 时不互相覆盖。
 */
import { describe, expect, it, beforeEach } from 'vitest'
import { lockScrollTarget, unlockScrollTarget, scrollLockCount } from '../../../../src/core/shared/scroll-lock'

const creatBody = (): HTMLElement => {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

describe('scroll-lock 引用计数', () => {
  let target: HTMLElement

  beforeEach(() => {
    target = creatBody()
    target.style.overflow = ''
  })

  it('单次锁定 / 解锁还原原始值', () => {
    lockScrollTarget(target)
    expect(target.style.overflow).toBe('hidden')
    expect(scrollLockCount(target)).toBe(1)
    unlockScrollTarget(target)
    expect(target.style.overflow).toBe('')
    expect(scrollLockCount(target)).toBe(0)
  })

  it('原有非空 overflow 值被还原（而非清空）', () => {
    target.style.overflow = 'auto'
    lockScrollTarget(target)
    expect(target.style.overflow).toBe('hidden')
    unlockScrollTarget(target)
    expect(target.style.overflow).toBe('auto')
  })

  it('两个持有者：先关者不解锁，后关者解锁（修复提前解锁）', () => {
    lockScrollTarget(target)
    lockScrollTarget(target)
    expect(target.style.overflow).toBe('hidden')
    // 第一个弹层关闭：仍有持有者，body 保持锁定
    unlockScrollTarget(target)
    expect(target.style.overflow).toBe('hidden')
    expect(scrollLockCount(target)).toBe(1)
    // 第二个弹层关闭：引用归零，还原
    unlockScrollTarget(target)
    expect(target.style.overflow).toBe('')
  })

  it('嵌套弹层关到只剩一个时不会按过期快照锁死', () => {
    // A、B 依次打开（B 的快照已是 'hidden'——若各存各的，B 关闭后会把
    // 'hidden' 当原始值写回，页面永久锁死；引用计数下只有首个锁记录原始值）
    lockScrollTarget(target)
    lockScrollTarget(target)
    unlockScrollTarget(target)
    unlockScrollTarget(target)
    unlockScrollTarget(target) // 多余调用 no-op，不抛错
    expect(target.style.overflow).toBe('')
    expect(scrollLockCount(target)).toBe(0)
  })

  it('未锁元素解锁是 no-op', () => {
    expect(() => unlockScrollTarget(target)).not.toThrow()
    expect(target.style.overflow).toBe('')
  })

  it('不同 target 的锁互不影响', () => {
    const other = creatBody()
    other.style.overflow = 'scroll'
    lockScrollTarget(target)
    lockScrollTarget(other)
    unlockScrollTarget(target)
    expect(other.style.overflow).toBe('hidden')
    expect(target.style.overflow).toBe('')
  })
})
