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

  it('drops ghost checked keys that are not in the data', () => {
    // 勾选集合里混入已不存在的键（上一次数据变更后未清理），不应被搬进源区
    const toLeft = moveTransferKeys([], data, ['a', 'ghost'], 'right-to-left')
    expect(toLeft).toEqual(['a'])
    const toRight = moveTransferKeys(['a', 'ghost'], data, ['ghost'], 'left-to-right')
    expect(toRight).toEqual(['a'])
  })

  it('filters by case-insensitive substring', () => {
    expect(filterTransferItems(data, '甲').length).toBe(1)
    expect(filterTransferItems(data, '')).toBe(data)
  })

  it('filters items whose label is missing', () => {
    // label 缺失时不应抛错，按空串处理（类型已放宽为 label?: string）
    const partial: LhTransferItem[] = [
      { key: 'x', label: '甲' },
      { key: 'y', label: undefined },
    ]
    expect(filterTransferItems(partial, '甲').map((i) => i.key)).toEqual(['x'])
    expect(filterTransferItems(partial, '').length).toBe(2)
  })

  it('computes class names', () => {
    expect(getTransferClassNames({ disabled: true })).toEqual(['lh-transfer', 'lh-transfer--disabled'])
    expect(getTransferPanelClassNames('left')).toEqual(['lh-transfer-panel', 'lh-transfer-panel--left'])
  })
})
