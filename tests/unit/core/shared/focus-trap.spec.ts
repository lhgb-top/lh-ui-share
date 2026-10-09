import { describe, it, expect, beforeEach } from 'vitest'
import {
  getFocusableElements,
  focusFirst,
  focusLast,
  saveActiveElement,
  restoreActiveElement,
  supportsInert,
  trapTabKey,
  setInertOutside,
} from '../../../../src/core/shared/focus-trap'

function mount(html: string): HTMLElement {
  document.body.innerHTML = html
  return document.body.firstElementChild as HTMLElement
}

describe('focus-trap / getFocusableElements', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('returns an empty list for an empty container', () => {
    const container = mount('<div id="c"></div>')
    expect(getFocusableElements(container)).toEqual([])
    expect(getFocusableElements(null)).toEqual([])
  })

  it('collects focusable elements in document order', () => {
    const container = mount(`
      <div>
        <button id="b1">one</button>
        <a id="a1" href="#">link</a>
        <input id="i1" />
        <select id="s1"><option>x</option></select>
        <textarea id="t1"></textarea>
        <span id="span1" tabindex="0">span</span>
      </div>
    `)
    const ids = getFocusableElements(container).map((el) => el.id)
    expect(ids).toEqual(['b1', 'a1', 'i1', 's1', 't1', 'span1'])
  })

  it('skips disabled, hidden, aria-hidden and negative tabindex', () => {
    const container = mount(`
      <div>
        <button id="ok">ok</button>
        <button id="dis" disabled>disabled</button>
        <button id="hid" hidden>hidden</button>
        <div id="ah" aria-hidden="true"><button id="ahb">inside</button></div>
        <button id="neg" tabindex="-1">neg</button>
      </div>
    `)
    const ids = getFocusableElements(container).map((el) => el.id)
    expect(ids).toEqual(['ok'])
  })

  it('skips hidden inputs', () => {
    const container = mount(`
      <div>
        <input id="hidden1" type="hidden" />
        <input id="text1" type="text" />
      </div>
    `)
    const ids = getFocusableElements(container).map((el) => el.id)
    expect(ids).toEqual(['text1'])
  })
})

describe('focus-trap / focusFirst / focusLast', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('focuses the first focusable element', () => {
    const container = mount(`
      <div>
        <button id="b1">one</button>
        <button id="b2">two</button>
      </div>
    `)
    expect(focusFirst(container)).toBe(true)
    expect(document.activeElement?.id).toBe('b1')
  })

  it('focuses the last focusable element', () => {
    const container = mount(`
      <div>
        <button id="b1">one</button>
        <button id="b2">two</button>
      </div>
    `)
    expect(focusLast(container)).toBe(true)
    expect(document.activeElement?.id).toBe('b2')
  })

  it('returns false when nothing is focusable', () => {
    const container = mount('<div>text</div>')
    expect(focusFirst(container)).toBe(false)
    expect(focusLast(container)).toBe(false)
  })
})

describe('focus-trap / saveActiveElement / restoreActiveElement', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('records and restores the previously focused element', () => {
    const outside = mount('<button id="outside">outside</button>')
    outside.focus()
    expect(saveActiveElement()?.id).toBe('outside')

    // 不能再用 mount()：它会用 innerHTML 覆盖 body，把 outside 一并移出文档，
    // restoreActiveElement 的 isConnected 守卫会直接跳过归还
    const container = document.createElement('div')
    container.innerHTML = '<button id="inside">inside</button>'
    document.body.appendChild(container)
    container.querySelector('#inside')?.focus()

    restoreActiveElement(outside)
    expect(document.activeElement?.id).toBe('outside')
  })

  it('does not restore a detached element', () => {
    const el = document.createElement('button')
    document.body.appendChild(el)
    el.focus()
    document.body.removeChild(el)

    restoreActiveElement(el)
    expect(document.activeElement).not.toBe(el)
  })
})

describe('focus-trap / trapTabKey', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('wraps from the last element to the first on Tab', () => {
    const container = mount(`
      <div>
        <button id="b1">one</button>
        <button id="b2">two</button>
      </div>
    `)
    const last = container.querySelector('#b2') as HTMLElement
    last.focus()

    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    const handled = trapTabKey(container, event)

    expect(handled).toBe(true)
    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement?.id).toBe('b1')
  })

  it('wraps from the first element to the last on Shift+Tab', () => {
    const container = mount(`
      <div>
        <button id="b1">one</button>
        <button id="b2">two</button>
      </div>
    `)
    container.querySelector('#b1')?.focus()

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    })
    const handled = trapTabKey(container, event)

    expect(handled).toBe(true)
    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement?.id).toBe('b2')
  })

  it('pulls focus inside when it is outside the container', () => {
    const container = mount(`
      <div>
        <button id="b1">one</button>
        <button id="b2">two</button>
      </div>
    `)
    const outside = document.createElement('button')
    outside.id = 'outside'
    document.body.appendChild(outside)
    outside.focus()

    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    expect(trapTabKey(container, event)).toBe(true)
    expect(document.activeElement?.id).toBe('b1')
  })

  it('lets natural Tab order pass through in the middle of the container', () => {
    const container = mount(`
      <div>
        <button id="b1">one</button>
        <button id="b2">two</button>
      </div>
    `)
    container.querySelector('#b1')?.focus()

    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    expect(trapTabKey(container, event)).toBe(false)
    expect(event.defaultPrevented).toBe(false)
  })

  it('locks focus when the container has nothing focusable', () => {
    const container = mount('<div>text</div>')
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    expect(trapTabKey(container, event)).toBe(true)
    expect(event.defaultPrevented).toBe(true)
  })

  it('wraps to the first element when focus sits on a tabindex="-1" node inside', () => {
    const container = mount(`
      <div id="c" tabindex="-1">
        <button id="b1">one</button>
        <button id="b2">two</button>
      </div>
    `)
    // 焦点落在不在 Tab 序列中的容器自身：默认 Tab 会逃逸出容器，必须拦回首位
    container.focus()
    expect(container.contains(document.activeElement)).toBe(true)

    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    expect(trapTabKey(container, event)).toBe(true)
    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement?.id).toBe('b1')
  })

  it('ignores non-Tab keys', () => {
    const container = mount('<div><button id="b1">one</button></div>')
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    expect(trapTabKey(container, event)).toBe(false)
  })
})

describe('focus-trap / inert', () => {
  // jsdom 未必实现 inert，用桩补上一份映射到 attribute 的属性，让加锁/解锁路径必然执行
  let installed = false
  beforeEach(() => {
    document.body.innerHTML = ''
    if (!('inert' in HTMLElement.prototype)) {
      Object.defineProperty(HTMLElement.prototype, 'inert', {
        configurable: true,
        get(this: HTMLElement) {
          return this.hasAttribute('inert')
        },
        set(this: HTMLElement, value: boolean) {
          if (value) this.setAttribute('inert', '')
          else this.removeAttribute('inert')
        },
      })
      installed = true
    }
  })
  afterEach(() => {
    if (installed) {
      delete (HTMLElement.prototype as Record<string, unknown>).inert
      installed = false
    }
  })

  it('toggles inert on body-level siblings', () => {
    const sibling = document.createElement('div')
    sibling.id = 'sibling'
    document.body.appendChild(sibling)
    const container = document.createElement('div')
    container.id = 'overlay'
    document.body.appendChild(container)

    const locked = setInertOutside(container, true)
    expect(locked.map((el) => el.id)).toContain('sibling')
    expect(sibling.inert).toBe(true)

    setInertOutside(container, false, locked)
    expect(sibling.inert).toBe(false)
  })

  it('keeps outer overlay locked while inner overlay is open', () => {
    const behind = document.createElement('div')
    behind.id = 'behind'
    document.body.appendChild(behind)
    const outer = document.createElement('div')
    outer.id = 'outer'
    document.body.appendChild(outer)
    const inner = document.createElement('div')
    inner.id = 'inner'
    outer.appendChild(inner)

    const outerLocked = setInertOutside(outer, true)
    expect(behind.inert).toBe(true)

    const innerLocked = setInertOutside(inner, true)
    // 内层加锁不能把外层自己的内容也 inert 掉
    expect(outer.inert).toBe(false)
    expect(innerLocked.map((el) => el.id)).not.toContain('outer')

    // 关闭内层：外层的锁定状态必须保留
    setInertOutside(inner, false, innerLocked)
    expect(behind.inert).toBe(true)

    setInertOutside(outer, false, outerLocked)
    expect(behind.inert).toBe(false)
  })

  it('locks siblings for a container nested deep in the tree (no teleport to body)', () => {
    const wrapper = document.createElement('div')
    wrapper.id = 'wrapper'
    document.body.appendChild(wrapper)
    const uncle = document.createElement('div')
    uncle.id = 'uncle'
    wrapper.appendChild(uncle)
    const parent = document.createElement('div')
    parent.id = 'parent'
    wrapper.appendChild(parent)
    const container = document.createElement('div')
    container.id = 'overlay'
    parent.appendChild(container)

    const locked = setInertOutside(container, true)
    // 祖先链各层不含 container 的兄弟子树被锁定，祖先自身与 container 不被锁定
    expect(locked.map((el) => el.id)).toEqual(['uncle'])
    expect(wrapper.inert).toBe(false)
    expect(parent.inert).toBe(false)
    expect(container.inert).toBe(false)
    expect(uncle.inert).toBe(true)

    setInertOutside(container, false, locked)
    expect(uncle.inert).toBe(false)
  })

  it('is idempotent when locking the same container twice', () => {
    const sibling = document.createElement('div')
    sibling.id = 'sibling'
    document.body.appendChild(sibling)
    const container = document.createElement('div')
    container.id = 'overlay'
    document.body.appendChild(container)

    const first = setInertOutside(container, true)
    const second = setInertOutside(container, true)
    expect(second.map((el) => el.id)).toEqual(['sibling'])
    expect(sibling.inert).toBe(true)

    // 一次解锁即释放全部所有权
    setInertOutside(container, false, first)
    expect(sibling.inert).toBe(false)
  })

  it('falls back to body when the restore target is inerted by an ancestor', () => {
    const outer = document.createElement('div')
    outer.id = 'outer'
    document.body.appendChild(outer)
    const trigger = document.createElement('button')
    trigger.id = 'trigger'
    outer.appendChild(trigger)
    const overlay = document.createElement('div')
    overlay.id = 'overlay'
    document.body.appendChild(overlay)

    trigger.focus()
    const locked = setInertOutside(overlay, true)
    expect(outer.inert).toBe(true)

    // 关闭 overlay 时归还焦点，但 trigger 已被 inert，应回退 body 而非散落
    restoreActiveElement(trigger)
    expect(document.activeElement).toBe(document.body)

    setInertOutside(overlay, false, locked)
  })

  it('honors the locked list as an exemption (round 2)', () => {
    // 回归：第三个参数曾是死参数——签名暗示「豁免这些节点」但从未被读取
    const keep = document.createElement('div')
    keep.id = 'keep-interactive'
    document.body.appendChild(keep)
    const sibling = document.createElement('div')
    sibling.id = 'sibling'
    document.body.appendChild(sibling)
    const container = document.createElement('div')
    container.id = 'overlay'
    document.body.appendChild(container)

    const locked = setInertOutside(container, true, [keep])
    expect(keep.inert).toBe(false)
    expect(sibling.inert).toBe(true)
    expect(locked.map((el) => el.id)).not.toContain('keep-interactive')

    setInertOutside(container, false, locked)
    expect(sibling.inert).toBe(false)
  })

  it('releases stale ownership when a disconnected container is re-locked (round 2)', () => {
    const sibling = document.createElement('div')
    sibling.id = 'stale-sibling'
    document.body.appendChild(sibling)
    const container = document.createElement('div')
    container.id = 'overlay'
    document.body.appendChild(container)

    setInertOutside(container, true)
    expect(sibling.inert).toBe(true)

    // 模拟泄漏路径：容器被直接移除且从未解锁，兄弟节点残留 inert
    container.remove()
    expect(sibling.inert).toBe(true)

    // 断连状态下再加锁：先释放残留所有权，拒绝在断连子树上继续锁
    const again = setInertOutside(container, true)
    expect(sibling.inert).toBe(false)
    expect(again).toEqual([])
  })

  it('reports inert capability via supportsInert (round 2)', () => {
    // jsdom 30 支持 inert：能力检测结果应为布尔且与实际可用性一致
    expect(typeof supportsInert()).toBe('boolean')
    expect(supportsInert()).toBe(true)
  })
})
