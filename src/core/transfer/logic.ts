import type { LhTransferItem, LhTransferSide } from './types'

/** 不可变分区：把全量数据按 sourceKeys 切成左右两侧 */
export function partitionTransferData(
  data: LhTransferItem[],
  sourceKeys: Array<string | number>,
): { left: LhTransferItem[]; right: LhTransferItem[] } {
  const keySet = new Set(sourceKeys)
  const left: LhTransferItem[] = []
  const right: LhTransferItem[] = []
  for (const item of data) {
    if (keySet.has(item.key)) left.push(item)
    else right.push(item)
  }
  return { left, right }
}

/** 勾选切换 */
export function toggleTransferChecked(
  checked: Array<string | number>,
  key: string | number,
): Array<string | number> {
  return checked.includes(key) ? checked.filter((k) => k !== key) : [...checked, key]
}

/** 全选/全不选某侧（跳过禁用项） */
export function toggleTransferCheckAll(
  checked: Array<string | number>,
  sideItems: LhTransferItem[],
): Array<string | number> {
  const selectable = sideItems.filter((item) => !item.disabled).map((item) => item.key)
  const allChecked = selectable.length > 0 && selectable.every((key) => checked.includes(key))
  if (allChecked) {
    const set = new Set(selectable)
    return checked.filter((key) => !set.has(key))
  }
  return Array.from(new Set([...checked, ...selectable]))
}

/**
 * 移动：把勾选项从一侧搬到另一侧，返回新的 sourceKeys。
 * 禁用项不移动（对应勾选也应被忽略）。
 */
export function moveTransferKeys(
  sourceKeys: Array<string | number>,
  data: LhTransferItem[],
  checked: Array<string | number>,
  direction: 'left-to-right' | 'right-to-left',
): Array<string | number> {
  const byKey = new Map(data.map((item) => [item.key, item]))
  const movable = checked.filter((key) => !byKey.get(key)?.disabled)
  if (direction === 'left-to-right') {
    return sourceKeys.filter((key) => !movable.includes(key))
  }
  const next = [...sourceKeys]
  for (const key of movable) {
    if (!next.includes(key)) next.push(key)
  }
  return next
}

/** 某侧的「全选」态：全部可选勾选为 all，部分为 some，否则 none */
export function getTransferCheckAllState(
  checked: Array<string | number>,
  sideItems: LhTransferItem[],
): 'all' | 'some' | 'none' {
  const selectable = sideItems.filter((item) => !item.disabled).map((item) => item.key)
  if (selectable.length === 0) return 'none'
  const count = selectable.filter((key) => checked.includes(key)).length
  if (count === 0) return 'none'
  if (count === selectable.length) return 'all'
  return 'some'
}

/** 搜索过滤（大小写不敏感） */
export function filterTransferItems(items: LhTransferItem[], query: string): LhTransferItem[] {
  if (!query) return items
  const lower = query.toLowerCase()
  return items.filter((item) => item.label.toLowerCase().includes(lower))
}

/** 容器类名 */
export function getTransferClassNames(state: { disabled: boolean }): string[] {
  const classes = ['lh-transfer']
  if (state.disabled) classes.push('lh-transfer--disabled')
  return classes
}

/** 面板侧别类名 */
export function getTransferPanelClassNames(side: LhTransferSide): string[] {
  return ['lh-transfer-panel', `lh-transfer-panel--${side}`]
}
