import {
  findTypeAheadIndex,
  getNextGridCell,
  getNextListIndex,
  getNextRangeValue,
  getRovingTabIndex,
  isActivationKey,
  isArrowKey,
  isEscapeKey,
  isHomeOrEndKey,
  isHorizontalArrowKey,
  isSpaceKey,
  isVerticalArrowKey,
  LH_KEYS,
} from '../../../../src/core/shared/keyboard'

describe('shared/keyboard', () => {
  describe('LH_KEYS', () => {
    it('exposes stable key names', () => {
      expect(LH_KEYS.Escape).toBe('Escape')
      expect(LH_KEYS.Space).toBe(' ')
      expect(LH_KEYS.ArrowDown).toBe('ArrowDown')
      expect(LH_KEYS.Home).toBe('Home')
    })
  })

  describe('key predicates', () => {
    it('accepts both KeyboardEvent and bare key values', () => {
      expect(isEscapeKey({ key: 'Escape' })).toBe(true)
      expect(isEscapeKey(new KeyboardEvent('keydown', { key: 'Escape' }))).toBe(true)
      expect(isEscapeKey({ key: 'Enter' })).toBe(false)
    })

    it('treats Enter and Space as activation keys', () => {
      expect(isActivationKey({ key: 'Enter' })).toBe(true)
      expect(isActivationKey({ key: ' ' })).toBe(true)
      expect(isActivationKey({ key: 'a' })).toBe(false)
    })

    it('classifies arrows by axis', () => {
      expect(isArrowKey({ key: 'ArrowUp' })).toBe(true)
      expect(isVerticalArrowKey({ key: 'ArrowDown' })).toBe(true)
      expect(isVerticalArrowKey({ key: 'ArrowLeft' })).toBe(false)
      expect(isHorizontalArrowKey({ key: 'ArrowRight' })).toBe(true)
      expect(isHorizontalArrowKey({ key: 'ArrowUp' })).toBe(false)
      expect(isArrowKey({ key: 'PageUp' })).toBe(false)
    })

    it('detects Home / End and Space', () => {
      expect(isHomeOrEndKey({ key: 'Home' })).toBe(true)
      expect(isHomeOrEndKey({ key: 'End' })).toBe(true)
      expect(isHomeOrEndKey({ key: 'ArrowLeft' })).toBe(false)
      expect(isSpaceKey({ key: ' ' })).toBe(true)
      expect(isSpaceKey({ key: 'Spacebar' })).toBe(false)
    })
  })

  describe('getNextListIndex', () => {
    const items = [{}, { disabled: true }, {}]

    it('moves forward and backward, skipping disabled items', () => {
      expect(getNextListIndex(items, 0, 1)).toBe(2)
      expect(getNextListIndex(items, 2, 1)).toBe(0)
      expect(getNextListIndex(items, 0, -1)).toBe(2)
    })

    it('jumps to first / last enabled item', () => {
      expect(getNextListIndex(items, 1, 'first')).toBe(0)
      expect(getNextListIndex(items, 1, 'last')).toBe(2)
    })

    it('returns -1 for empty or fully-disabled lists', () => {
      expect(getNextListIndex([], 0, 1)).toBe(-1)
      expect(getNextListIndex([], 0, 'first')).toBe(-1)
      expect(getNextListIndex([], 0, 'last')).toBe(-1)
      const allDisabled = [{ disabled: true }, { disabled: true }]
      expect(getNextListIndex(allDisabled, 0, 1)).toBe(-1)
      expect(getNextListIndex(allDisabled, 0, -1)).toBe(-1)
      expect(getNextListIndex(allDisabled, 0, 'first')).toBe(-1)
      expect(getNextListIndex(allDisabled, 0, 'last')).toBe(-1)
    })

    it('falls back to first/last when current index is out of range', () => {
      expect(getNextListIndex(items, -1, 1)).toBe(0)
      expect(getNextListIndex(items, 99, 1)).toBe(0)
      expect(getNextListIndex(items, -1, -1)).toBe(2)
    })

    it('clamps at borders when looping is disabled', () => {
      const plain = [{}, {}, {}]
      expect(getNextListIndex(plain, 2, 1, { loop: false })).toBe(2)
      expect(getNextListIndex(plain, 0, -1, { loop: false })).toBe(0)
      expect(getNextListIndex(plain, 1, 1, { loop: false })).toBe(2)
      // 不循环时跳过中间的禁用项
      expect(getNextListIndex(items, 0, 1, { loop: false })).toBe(2)
      // 不循环时若边界项也被禁用则无可用目标
      const borderDisabled = [{}, { disabled: true }]
      expect(getNextListIndex(borderDisabled, 0, 1, { loop: false })).toBe(-1)
    })

    it('keeps disabled items selectable when skipDisabled is off', () => {
      expect(getNextListIndex(items, 0, 1, { skipDisabled: false })).toBe(1)
      expect(getNextListIndex(items, 1, 'first', { skipDisabled: false })).toBe(0)
    })

    it('supports a custom isDisabled predicate for non-standard item shapes', () => {
      // 形如树节点：禁用标记不在顶层，默认读 item.disabled 会读不到
      type Wrapped = { node: { disabled: boolean } } | { other: boolean }
      const nodes: Wrapped[] = [
        { node: { disabled: false } },
        { node: { disabled: true } },
        { other: true },
      ]
      expect(
        getNextListIndex(nodes, 0, 1, { isDisabled: (n) => 'node' in n && n.node.disabled }),
      ).toBe(2)
      expect(
        getNextListIndex(nodes, 0, 'last', { isDisabled: (n) => 'node' in n && n.node.disabled }),
      ).toBe(2)
    })
  })

  describe('findTypeAheadIndex', () => {
    const labels = ['Apple', 'Banana', 'Cherry', 'Apricot']

    it('matches labels case-insensitively from the start', () => {
      expect(findTypeAheadIndex(labels, 'a', -1)).toBe(0)
      expect(findTypeAheadIndex(labels, 'b', -1)).toBe(1)
      expect(findTypeAheadIndex(labels, 'CH', -1)).toBe(2)
    })

    it('wraps around when no match follows the start index', () => {
      // 从 Cherry 之后找不到 A 开头，环绕回 Apple
      expect(findTypeAheadIndex(labels, 'a', 2)).toBe(3)
      expect(findTypeAheadIndex(labels, 'a', 3)).toBe(0)
    })

    it('returns -1 when nothing matches or the query is empty', () => {
      expect(findTypeAheadIndex(labels, 'z', -1)).toBe(-1)
      expect(findTypeAheadIndex(labels, '', -1)).toBe(-1)
      expect(findTypeAheadIndex([], 'a', -1)).toBe(-1)
    })
  })

  describe('getRovingTabIndex', () => {
    const items = [{}, { disabled: true }, {}]

    it('returns the active index when it is enabled', () => {
      expect(getRovingTabIndex(items, 2)).toBe(2)
    })

    it('falls back to the first enabled item', () => {
      expect(getRovingTabIndex(items, 1)).toBe(0)
      expect(getRovingTabIndex(items, -1)).toBe(0)
      expect(getRovingTabIndex([{ disabled: true }], 0)).toBe(-1)
      expect(getRovingTabIndex([], 0)).toBe(-1)
    })
  })

  describe('getNextRangeValue', () => {
    const opts = { min: 0, max: 100, step: 10 }

    it('moves by step on arrow keys', () => {
      expect(getNextRangeValue(30, 'ArrowRight', opts)).toBe(40)
      expect(getNextRangeValue(30, 'ArrowUp', opts)).toBe(40)
      expect(getNextRangeValue(30, 'ArrowLeft', opts)).toBe(20)
      expect(getNextRangeValue(30, 'ArrowDown', opts)).toBe(20)
    })

    it('clamps to min / max at the borders', () => {
      expect(getNextRangeValue(95, 'ArrowRight', opts)).toBe(100)
      expect(getNextRangeValue(5, 'ArrowLeft', opts)).toBe(0)
      expect(getNextRangeValue(100, 'ArrowRight', opts)).toBe(100)
      expect(getNextRangeValue(0, 'ArrowLeft', opts)).toBe(0)
    })

    it('moves by exactly one step even from an unaligned current value', () => {
      expect(getNextRangeValue(25, 'ArrowRight', opts)).toBe(35)
      expect(getNextRangeValue(24, 'ArrowLeft', opts)).toBe(14)
    })

    it('jumps to the extremes on Home / End', () => {
      expect(getNextRangeValue(70, 'Home', opts)).toBe(0)
      expect(getNextRangeValue(20, 'End', opts)).toBe(100)
    })

    it('steps by max(step, (max-min)/10) on PageUp / PageDown by default', () => {
      // (100-0)/10 = 10 = step
      expect(getNextRangeValue(30, 'PageUp', opts)).toBe(40)
      expect(getNextRangeValue(30, 'PageDown', opts)).toBe(20)
      // 小量程下 (max-min)/10 < step 时取 step，保证大步进不小于方向键步长
      const small = { min: 0, max: 20, step: 10 }
      expect(getNextRangeValue(0, 'PageUp', small)).toBe(10)
      expect(getNextRangeValue(20, 'PageDown', small)).toBe(10)
    })

    it('honours an explicit pageStep', () => {
      expect(getNextRangeValue(30, 'PageUp', { ...opts, pageStep: 50 })).toBe(80)
      expect(getNextRangeValue(30, 'PageDown', { ...opts, pageStep: 50 })).toBe(0)
    })

    it('passes non-navigation keys through untouched', () => {
      expect(getNextRangeValue(30, 'a', opts)).toBe(30)
      expect(getNextRangeValue(30, 'Tab', opts)).toBe(30)
      expect(getNextRangeValue(30, 'Enter', opts)).toBe(30)
    })

    it('degrades to unit steps and pure clamping when step is unusable', () => {
      expect(getNextRangeValue(30, 'ArrowRight', { min: 0, max: 100, step: 0 })).toBe(31)
      expect(getNextRangeValue(30, 'ArrowLeft', { min: 0, max: 100, step: -5 })).toBe(29)
      expect(getNextRangeValue(30, 'ArrowRight', { min: 0, max: 100, step: NaN })).toBe(31)
      expect(getNextRangeValue(100, 'ArrowRight', { min: 0, max: 100, step: 0 })).toBe(100)
      // 非法 step 下 Home / End 仍直达极值
      expect(getNextRangeValue(30, 'End', { min: 0, max: 100, step: 0 })).toBe(100)
    })

    it('clamps back into range for a current value below min (range thumb swap)', () => {
      expect(getNextRangeValue(-15, 'ArrowRight', opts)).toBe(0)
    })
  })

  describe('getNextGridCell', () => {
    // 6 行 × 7 列的日期网格（42 格）
    const grid = { cols: 7, total: 42 }
    // 末行不满的网格：5 行 × 7 列 = 35 格
    const ragged = { cols: 7, total: 35 }

    it('moves horizontally within a row', () => {
      expect(getNextGridCell(0, 'ArrowRight', grid)).toBe(1)
      expect(getNextGridCell(5, 'ArrowRight', grid)).toBe(6)
      expect(getNextGridCell(6, 'ArrowLeft', grid)).toBe(5)
    })

    it('moves vertically by a full row', () => {
      expect(getNextGridCell(0, 'ArrowDown', grid)).toBe(7)
      expect(getNextGridCell(7, 'ArrowUp', grid)).toBe(0)
      expect(getNextGridCell(41, 'ArrowUp', grid)).toBe(34)
    })

    it('returns null at grid borders when not looping (UI 层据此翻页)', () => {
      // 横向跨行连续流动：行末右移进下一行行首，只有整个网格尽头才 null
      expect(getNextGridCell(6, 'ArrowRight', grid)).toBe(7)
      expect(getNextGridCell(41, 'ArrowRight', grid)).toBeNull()
      expect(getNextGridCell(0, 'ArrowLeft', grid)).toBeNull()
      expect(getNextGridCell(41, 'ArrowDown', grid)).toBeNull()
      expect(getNextGridCell(0, 'ArrowUp', grid)).toBeNull()
    })

    it('wraps around when looping', () => {
      const loop = { ...grid, loop: true }
      // 横向循环：末格右移绕回首格
      expect(getNextGridCell(41, 'ArrowRight', loop)).toBe(0)
      expect(getNextGridCell(0, 'ArrowLeft', loop)).toBe(41)
      // 41 是第 5 行第 6 列，循环绕回第 0 行第 6 列（保持列位置，而非跳到 0）
      expect(getNextGridCell(41, 'ArrowDown', loop)).toBe(6)
      // 0 是第 0 行第 0 列，循环绕回第 5 行第 0 列
      expect(getNextGridCell(0, 'ArrowUp', loop)).toBe(35)
    })

    it('jumps to the row start / end on Home / End', () => {
      expect(getNextGridCell(5, 'Home', grid)).toBe(0)
      expect(getNextGridCell(5, 'End', grid)).toBe(6)
      expect(getNextGridCell(20, 'Home', grid)).toBe(14)
      expect(getNextGridCell(20, 'End', grid)).toBe(20)
    })

    it('clamps End to the last cell when the final row is incomplete', () => {
      // 35 格网格的末行只有 0-34 的 index 28..34，End 落在 34 而非不存在的 34
      expect(getNextGridCell(30, 'End', ragged)).toBe(34)
      expect(getNextGridCell(30, 'Home', ragged)).toBe(28)
      // 末行右移到 34 后再按右键返回 null
      expect(getNextGridCell(34, 'ArrowRight', ragged)).toBeNull()
    })

    it('returns null for non-navigation keys or invalid focus', () => {
      expect(getNextGridCell(5, 'Enter', grid)).toBeNull()
      expect(getNextGridCell(5, 'PageUp', grid)).toBeNull()
      expect(getNextGridCell(5, 'a', grid)).toBeNull()
      expect(getNextGridCell(-1, 'ArrowRight', grid)).toBeNull()
      expect(getNextGridCell(42, 'ArrowRight', grid)).toBeNull()
    })

    it('returns null for degenerate grid shapes', () => {
      expect(getNextGridCell(0, 'ArrowRight', { cols: 0, total: 42 })).toBeNull()
      expect(getNextGridCell(0, 'ArrowRight', { cols: 7, total: 0 })).toBeNull()
    })
  })
})
