import { describe, expect, it } from 'vitest'
import {
  filterTransferItems,
  getTransferCheckAllState,
  getTransferClassNames,
  getTransferPanelClassNames,
  moveTransferKeys,
  partitionTransferData,
  toggleTransferChecked,
  toggleTransferCheckAll,
} from '../../../src/core/transfer'
import type { LhTransferItem } from '../../../src/core/transfer'

const data: LhTransferItem[] = [
  { key: 'a', label: '甲' },
  { key: 'b', label: '乙', disabled: true },
  { key: 'c', label: '丙' },
]

describe('LhTransfer core', () => {
  it('partitions data by source keys', () => {
    const { left, right } = partitionTransferData(data, ['a'])
    expect(left.map((i) => i.key)).toEqual(['a'])
    expect(right.map((i) => i.key)).toEqual(['b', 'c'])
  })

  it('toggles a single checked key', () => {
    expect(toggleTransferChecked(['a'], 'b')).toEqual(['a', 'b'])
    expect(toggleTransferChecked(['a', 'b'], 'a')).toEqual(['b'])
  })

  it('toggles check-all skipping disabled items', () => {
    expect(toggleTransferCheckAll([], data)).toEqual(['a', 'c'])
    expect(toggleTransferCheckAll(['a', 'c'], data)).toEqual([])
  })

  it('computes check-all state', () => {
    expect(getTransferCheckAllState([], data)).toBe('none')
    expect(getTransferCheckAllState(['a'], data)).toBe('some')
    expect(getTransferCheckAllState(['a', 'c'], data)).toBe('all')
  })

  it('moves keys right and left, ignoring disabled', () => {
    const toRight = moveTransferKeys(['a'], data, ['a', 'b'], 'left-to-right')
    expect(toRight).toEqual([])
    const toLeft = moveTransferKeys([], data, ['a', 'b'], 'right-to-left')
    expect(toLeft).toEqual(['a'])
  })

  it('filters by case-insensitive substring', () => {
    expect(filterTransferItems(data, '甲').length).toBe(1)
    expect(filterTransferItems(data, '')).toBe(data)
  })

  it('computes class names', () => {
    expect(getTransferClassNames({ disabled: true })).toEqual(['lh-transfer', 'lh-transfer--disabled'])
    expect(getTransferPanelClassNames('left')).toEqual(['lh-transfer-panel', 'lh-transfer-panel--left'])
  })
})
