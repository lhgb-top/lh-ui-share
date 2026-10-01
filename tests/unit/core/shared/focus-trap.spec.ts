import { describe, it, expect, beforeEach } from 'vitest'
import {
  getFocusableElements,
  focusFirst,
  focusLast,
  saveActiveElement,
  restoreActiveElement,
  trapTabKey,
  supportsInert,
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

  it('ignores non-Tab keys', () => {
    const container = mount('<div><button id="b1">one</button></div>')
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    expect(trapTabKey(container, event)).toBe(false)
  })
})

describe('focus-trap / inert', () => {
  it('reports environment support without throwing', () => {
    expect(typeof supportsInert()).toBe('boolean')
  })

  it('toggles inert on body-level siblings', () => {
    document.body.innerHTML = ''
    const sibling = document.createElement('div')
    sibling.id = 'sibling'
    document.body.appendChild(sibling)
    const container = document.createElement('div')
    container.id = 'overlay'
    document.body.appendChild(container)

    const locked = setInertOutside(container, true)
    if (supportsInert()) {
      expect(locked.map((el) => el.id)).toContain('sibling')
      expect(sibling.hasAttribute('inert')).toBe(true)

      setInertOutside(container, false, locked)
      expect(sibling.hasAttribute('inert')).toBe(false)
    } else {
      expect(locked).toEqual([])
    }
  })
})
