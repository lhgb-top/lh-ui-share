/**
 * 焦点管理工具（纯函数，无框架依赖）
 *
 * 供 Dialog / Drawer / Popover / Popconfirm / ImageViewer 等覆盖层组件共用：
 * 可聚焦元素枚举、Tab 键焦点圈、打开时记录 / 关闭时归还焦点、inert 特性检测。
 */

/**
 * 可聚焦元素选择器（不含 disabled 与负 tabindex）
 *
 * 注意：选择器只在 `[tabindex]` 这条通用分支上排除了 `-1`，
 * `button` 等标签名分支不会看 tabindex，负 tabindex 的排除由 isHiddenForFocus 兜底。
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'video[controls]',
  'audio[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/** tabindex 为负的元素可被 focus() 编程聚焦，但不在 Tab 序列中 */
function isNegativeTabindex(el: HTMLElement): boolean {
  const value = el.getAttribute('tabindex')
  return value !== null && Number(value) < 0
}

/**
 * 元素是否因自身或祖先的隐藏语义而不可达
 *
 * hidden / aria-hidden / display:none / visibility:hidden 都可能挂在任一祖先上，
 * 此时整棵子树对辅助技术不可见，Tab 也无法落入，沿祖先链整体判定。
 */
function isHiddenForFocus(el: HTMLElement): boolean {
  if (el.hasAttribute('disabled')) return true
  if (isNegativeTabindex(el)) return true
  // 行内样式与 computed style 在有布局的环境下才准确，
  // 无布局环境（jsdom）这两个属性恒为可见值，不影响判定
  let node: HTMLElement | null = el
  while (node) {
    if (node.hasAttribute('hidden')) return true
    if (node.getAttribute('aria-hidden') === 'true') return true
    const style = typeof getComputedStyle === 'function' ? getComputedStyle(node) : null
    if (style) {
      if (style.display === 'none') return true
      if (style.visibility === 'hidden') return true
    }
    node = node.parentElement
  }
  return false
}

/**
 * 枚举容器内按文档顺序、可被 Tab 键落入的元素
 */
export function getFocusableElements(container: HTMLElement | null | undefined): HTMLElement[] {
  if (!container) return []
  const nodes = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  return Array.from(nodes).filter((el) => !isHiddenForFocus(el))
}

/**
 * 聚焦容器内首个可聚焦元素
 *
 * preventScroll：弹出层 teleport 到 body 后首个 tick 内尚未落位，
 * 此时 focus() 会把页面滚到元素临时所在位置（页面底部）。
 */
export function focusFirst(container: HTMLElement | null | undefined): boolean {
  const first = getFocusableElements(container)[0]
  if (!first) return false
  first.focus({ preventScroll: true })
  return true
}

/**
 * 聚焦容器内末个可聚焦元素
 */
export function focusLast(container: HTMLElement | null | undefined): boolean {
  const list = getFocusableElements(container)
  const last = list[list.length - 1]
  if (!last) return false
  last.focus({ preventScroll: true })
  return true
}

/**
 * 记录当前活跃元素，供后续归还
 */
export function saveActiveElement(): HTMLElement | null {
  if (typeof document === 'undefined') return null
  return document.activeElement instanceof HTMLElement ? document.activeElement : null
}

/**
 * 将焦点归还给定元素（已从文档移除、或被 inert 锁定时跳过）
 *
 * 嵌套 overlay 场景下，外层 overlay 可能恰好 inert 了要归还的目标，
 * 此时 focus() 静默无效，回退到 body 避免焦点散落。
 */
export function restoreActiveElement(el: HTMLElement | null | undefined): void {
  if (!el) return
  if (typeof document === 'undefined') return
  if (!el.isConnected) return
  if (isInertedByAncestor(el)) {
    // 目标已被 inert，焦点不能落上去：移出当前焦点，让浏览器回到 body。
    // 直接 body.focus() 在部分环境（如 jsdom）不会移动 activeElement，
    // blur 当前焦点元素是规范保证的回退路径
    const active = document.activeElement
    if (active instanceof HTMLElement && active !== document.body) {
      active.blur()
    }
    return
  }
  el.focus?.()
}

/**
 * 处理 Tab / Shift+Tab，把焦点圈在容器内（首尾跳跃）
 *
 * @returns 是否拦截了该事件（容器内无焦点或焦点在边界时 preventDefault 并移动焦点）
 */
export function trapTabKey(container: HTMLElement, event: KeyboardEvent): boolean {
  if (event.key !== 'Tab' || event.defaultPrevented) return false

  const list = getFocusableElements(container)
  if (list.length === 0) {
    event.preventDefault()
    return true
  }

  const first = list[0]
  const last = list[list.length - 1]
  const active =
    typeof document !== 'undefined' && document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
  const inside = active !== null && container.contains(active)
  // 用列表索引而非引用边界判定：焦点可能落在容器内不在 Tab 序列中的元素上
  // （如 tabindex="-1" 的容器自身），此时默认 Tab 会把焦点带出容器外
  const idx = inside && active !== null ? list.indexOf(active) : -1

  if (event.shiftKey) {
    if (idx <= 0) {
      event.preventDefault()
      last.focus()
      return true
    }
  } else {
    if (idx === -1 || idx === list.length - 1) {
      event.preventDefault()
      first.focus()
      return true
    }
  }
  return false
}

/**
 * 元素是否因自身或祖先的 inert 而不可交互
 */
function isInertedByAncestor(el: HTMLElement): boolean {
  let node: HTMLElement | null = el
  while (node) {
    if (node.hasAttribute('inert')) return true
    node = node.parentElement
  }
  return false
}

/**
 * 当前环境是否支持 inert 属性（渐进增强，不支持时回退焦点圈方案）
 */
export function supportsInert(): boolean {
  return typeof HTMLElement !== 'undefined' && 'inert' in HTMLElement.prototype
}

/** 节点 → 持有它 inert 的容器集合（支持嵌套 overlay 共享同一被锁节点） */
const nodeOwners = new WeakMap<HTMLElement, Set<HTMLElement>>()
/** 容器 → 它当前锁定的节点集合（解锁时按容器所有权精确释放） */
const ownedNodes = new WeakMap<HTMLElement, Set<HTMLElement>>()

/** 释放容器持有的全部 inert 所有权（无人持有时才移除 inert 属性） */
function releaseOwned(container: HTMLElement): void {
  const owned = ownedNodes.get(container)
  if (!owned) return
  owned.forEach((el) => {
    const owners = nodeOwners.get(el)
    if (!owners) return
    owners.delete(container)
    if (owners.size === 0) {
      el.removeAttribute('inert')
      nodeOwners.delete(el)
    }
  })
  ownedNodes.delete(container)
}

/**
 * 给容器以外的 DOM 节点加 / 去 inert，阻止焦点流到覆盖层背后
 *
 * - 遍历 container 的祖先链分叉：每层把不含 container 的兄弟子树 inert，
 *   覆盖 overlay 未 teleport 到 body 的嵌套场景。
 * - 所有权注册表保证幂等：重复加锁只登记所有权、不重复 setAttribute；
 *   解锁时仅当被锁节点已无任何容器持有时才移除 inert，避免嵌套 overlay 互相误伤。
 * - `locked` 是「额外豁免」清单：其中的节点不加 inert（如另一个仍打开的 overlay 容器）。
 * - 容器已脱离文档却仍持有旧锁（卸载时漏调 unlock）时先释放残留所有权，
 *   避免已移除子树的兄弟节点永远 inert；断连状态下加锁没有意义。
 *
 * @param container 覆盖层根元素
 * @param active true 加锁、false 解锁
 * @param locked 额外豁免不加 inert 的节点
 * @returns 被加锁的节点（解锁时用）
 */
export function setInertOutside(
  container: HTMLElement,
  active: boolean,
  locked: HTMLElement[] = []
): HTMLElement[] {
  if (!supportsInert()) return []
  if (typeof document === 'undefined' || !document.body) return locked

  if (active) {
    if (!container.isConnected) {
      releaseOwned(container)
      return Array.from(new Set(locked))
    }

    const owned = ownedNodes.get(container) ?? new Set<HTMLElement>()
    const exempt = new Set(locked)

    // 从 container 向上走到 body，每层 inert 不含 container 的兄弟子树
    let node: HTMLElement | null = container
    while (node && node !== document.body) {
      // 显式注解切断 TS 的推断循环（lib.dom 下 parentElement 与 contains 组合会触发 TS7022）
      const parentEl: HTMLElement | null = node.parentElement
      if (!parentEl) break
      Array.from(parentEl.children).forEach((child) => {
        const el = child as HTMLElement
        if (el === node || el.contains(container) || container.contains(el)) return
        if (exempt.has(el)) return
        const owners = nodeOwners.get(el) ?? new Set<HTMLElement>()
        if (owners.size === 0) {
          el.setAttribute('inert', '')
        }
        owners.add(container)
        nodeOwners.set(el, owners)
        owned.add(el)
      })
      node = parentEl
    }

    ownedNodes.set(container, owned)
    return Array.from(owned)
  }

  // 解锁：仅释放本容器持有的所有权，无人持有时才移除 inert
  releaseOwned(container)
  return []
}
