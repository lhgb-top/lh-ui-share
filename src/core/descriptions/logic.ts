import type { LhDescriptionsItem, LhDescriptionsState } from './types'

/**
 * 生成 Descriptions 的 class 列表
 */
export function getDescriptionsClassNames(state: LhDescriptionsState): string[] {
  const classes = ['lh-descriptions']
  if (state.border) classes.push('lh-descriptions--border')
  return classes
}

/**
 * 将扁平条目按 span 归一化为行结构（纯函数，供渲染层 v-for）
 * - span 缺省为 1；非法值（<=0 / 非数字）按 1 处理
 * - 超过剩余列宽的条目钳制到剩余宽度
 * - 满行后自动换行；最后一行不足时会补位（渲染层用占位单元格填满）
 */
export function buildDescriptionRows(
  items: LhDescriptionsItem[],
  column: number
): { cells: { item: LhDescriptionsItem; span: number }[]; filler: number }[] {
  const safeColumn = Math.max(1, Math.floor(column) || 1)
  const rows: { cells: { item: LhDescriptionsItem; span: number }[]; filler: number }[] = []

  let current: { item: LhDescriptionsItem; span: number }[] = []
  let used = 0

  const pushRow = (filler: number) => {
    rows.push({ cells: current, filler })
    current = []
    used = 0
  }

  for (const item of items) {
    let span = Number(item.span)
    if (!Number.isFinite(span) || span < 1) span = 1
    span = Math.floor(span)

    // 超过本行剩余宽度：钳制到剩余宽度（至少 1 列）
    if (used + span > safeColumn) {
      span = Math.max(1, safeColumn - used)
    }
    // 单条 span 超过整行列数时钳制到整行
    if (span > safeColumn) span = safeColumn

    current.push({ item, span })
    used += span

    if (used >= safeColumn) {
      pushRow(0)
    }
  }

  if (current.length > 0) {
    pushRow(safeColumn - used)
  }

  return rows
}
