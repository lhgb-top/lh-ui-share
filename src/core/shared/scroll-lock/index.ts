/**
 * 元素滚动锁：模块级引用计数（跨组件共享同一个 target 时互不覆盖）。
 *
 * 背景：弹层族（dialog / drawer / loading 服务 / 命令式 overlay）各自快照
 * `target.style.overflow` 再写 'hidden'、关闭时写回快照——两个弹层先后打开都锁
 * 同一个 body 时，先开者先关会提前解锁（后开者仍显示但页面可滚动），或后关者
 * 按过期快照 'hidden' 写回导致永久锁死。引用计数归零才真正还原 original。
 *
 * 无 DOM 环境（SSR / 测试）下 no-op。target 为空串 original 时还原用
 * removeProperty 而非写入空值（与既有还原口径一致，避免留下空声明）。
 */

interface LockEntry {
  count: number
  original: string
}

const LOCKS = new Map<HTMLElement, LockEntry>()

/**
 * 锁定指定元素的滚动。同一元素多次锁定只记引用数，首个锁记录原始 overflow。
 * 已锁元素再锁不会覆盖 original（修复后开者把 'hidden' 当原始值的快照污染）。
 */
export function lockScrollTarget(target: HTMLElement): void {
  if (typeof document === 'undefined') return
  const entry = LOCKS.get(target)
  if (entry) {
    entry.count++
    return
  }
  LOCKS.set(target, { count: 1, original: target.style.overflow })
  target.style.overflow = 'hidden'
}

/**
 * 解锁一次。引用数归零才真正还原原始 overflow；仍有其它持有者时不动元素。
 * 未锁的元素调用是 no-op（容错关闭路径多发）。
 */
export function unlockScrollTarget(target: HTMLElement): void {
  if (typeof document === 'undefined') return
  const entry = LOCKS.get(target)
  if (!entry) return
  entry.count--
  if (entry.count > 0) return
  LOCKS.delete(target)
  if (entry.original === '') {
    target.style.removeProperty('overflow')
  } else {
    target.style.overflow = entry.original
  }
}

/**（测试 / 卸载场景用）查询某元素当前的锁引用数，未锁返回 0 */
export function scrollLockCount(target: HTMLElement): number {
  return LOCKS.get(target)?.count ?? 0
}
