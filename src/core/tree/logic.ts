import type { LhFlatTreeNode, LhTreeCheckState, LhTreeNode } from './types'

/** 是否叶子节点 */
export function isTreeNodeLeaf(node: LhTreeNode): boolean {
  if (node.isLeaf != null) return node.isLeaf
  return !node.children || node.children.length === 0
}

/**
 * 扁平化树（深度优先，父在子前）。
 * 只展开 expandedKeys 命中的节点的子树。
 */
export function flattenTree(
  nodes: LhTreeNode[],
  expandedKeys: string[],
  level = 0,
  parentKey: string | null = null,
  ancestorKeys: string[] = [],
): LhFlatTreeNode[] {
  const result: LhFlatTreeNode[] = []
  for (const node of nodes) {
    const isLeaf = isTreeNodeLeaf(node)
    result.push({
      node,
      key: node.key,
      level,
      parentKey,
      ancestorKeys,
      isLeaf,
    })
    if (!isLeaf && expandedKeys.includes(node.key) && node.children) {
      result.push(
        ...flattenTree(node.children, expandedKeys, level + 1, node.key, [...ancestorKeys, node.key]),
      )
    }
  }
  return result
}

/** 收集全部后代键 */
export function getDescendantKeys(node: LhTreeNode): string[] {
  if (!node.children) return []
  const keys: string[] = []
  for (const child of node.children) {
    keys.push(child.key, ...getDescendantKeys(child))
  }
  return keys
}

/** 按键查节点 */
export function findTreeNode(nodes: LhTreeNode[], key: string): LhTreeNode | null {
  for (const node of nodes) {
    if (node.key === key) return node
    if (node.children) {
      const found = findTreeNode(node.children, key)
      if (found) return found
    }
  }
  return null
}

/**
 * 计算某节点的勾选态：全部后代（含自身）选中为 checked，部分为 indeterminate，否则 unchecked。
 * checkStrictly（父子不联动）时为二态，不产生半选。
 */
export function getNodeCheckState(
  node: LhTreeNode,
  checkedKeys: string[],
  checkStrictly = false,
): LhTreeCheckState {
  if (checkStrictly || isTreeNodeLeaf(node)) {
    return checkedKeys.includes(node.key) ? 'checked' : 'unchecked'
  }

  const leaves = collectLeafKeys(node)
  const checkedLeaves = leaves.filter((key) => checkedKeys.includes(key))
  if (checkedLeaves.length === 0) return 'unchecked'
  if (checkedLeaves.length === leaves.length) return 'checked'
  return 'indeterminate'
}

/** 收集子树内所有叶子键 */
export function collectLeafKeys(node: LhTreeNode): string[] {
  if (isTreeNodeLeaf(node)) return [node.key]
  const keys: string[] = []
  for (const child of node.children ?? []) {
    keys.push(...collectLeafKeys(child))
  }
  return keys
}

/**
 * 勾选/取消某节点：级联到全部后代，并向上回溯更新祖先（全选才加入、否则移除）。
 * checkStrictly（父子不联动）时只增删该键自身，不做级联与祖先回溯。
 * 返回新的 checkedKeys（去重、保序）。
 */
export function toggleCheckKeys(
  roots: LhTreeNode[],
  checkedKeys: string[],
  key: string,
  options: { checkStrictly?: boolean } = {},
): string[] {
  const node = findTreeNode(roots, key)
  if (!node || node.disabled) return [...checkedKeys]

  if (options.checkStrictly) {
    return checkedKeys.includes(key)
      ? checkedKeys.filter((k) => k !== key)
      : [...checkedKeys, key]
  }

  const next = new Set(checkedKeys)
  const descendants = [key, ...getDescendantKeys(node)]
  const shouldCheck = !checkedKeys.includes(key)

  for (const k of descendants) {
    if (shouldCheck) next.add(k)
    else next.delete(k)
  }

  // 向上回溯：自身与兄弟全选 → 父级加入；否则父级移除
  let parent = findParentNode(roots, key)
  while (parent) {
    const leaves = collectLeafKeys(parent)
    const allChecked = leaves.every((k) => next.has(k))
    if (allChecked) next.add(parent.key)
    else next.delete(parent.key)
    parent = findParentNode(roots, parent.key)
  }

  return Array.from(next)
}

/** 查父节点（顶层返回 null） */
export function findParentNode(
  nodes: LhTreeNode[],
  key: string,
  parent: LhTreeNode | null = null,
): LhTreeNode | null {
  for (const node of nodes) {
    if (node.key === key) return parent
    if (node.children && node.children.length > 0) {
      // 先判断直接命中，避免子查询返回 null 时无法区分「未找到」与「父为顶层」
      if (node.children.some((child) => child.key === key)) return node
      const found = findParentNode(node.children, key, node)
      if (found) return found
    }
  }
  return null
}

/**
 * 树的键盘导航：返回下一个可获得焦点的节点键。
 * 跳过高亮过滤后不可见的节点交由调用方预先过滤（传入已过滤的扁平列表）。
 */
export function moveTreeFocus(
  flat: LhFlatTreeNode[],
  currentKey: string | null,
  direction: 1 | -1,
): string | null {
  if (flat.length === 0) return null
  const enabled = flat.filter((item) => !item.node.disabled)
  if (enabled.length === 0) return null
  if (currentKey == null) return enabled[0].key
  const index = enabled.findIndex((item) => item.key === currentKey)
  if (index === -1) return enabled[0].key
  const next = (index + direction + enabled.length) % enabled.length
  return enabled[next].key
}

/** 树容器类名 */
export function getTreeClassNames(state: { showCheckbox: boolean }): string[] {
  const classes = ['lh-tree']
  if (state.showCheckbox) classes.push('lh-tree--checkbox')
  return classes
}

/** 树节点类名 */
export function getTreeNodeClassNames(state: {
  expanded: boolean
  selected: boolean
  disabled: boolean
  leaf: boolean
}): string[] {
  const classes = ['lh-tree-node']
  if (state.expanded) classes.push('lh-tree-node--expanded')
  if (state.selected) classes.push('lh-tree-node--selected')
  if (state.disabled) classes.push('lh-tree-node--disabled')
  if (state.leaf) classes.push('lh-tree-node--leaf')
  return classes
}

// ============================================================================
// 懒加载
// ============================================================================

/**
 * 不可变合并懒加载结果：返回新树，把 loadedMap 中记录的子节点挂到对应节点上。
 * 不修改传入的 nodes（props.data 由使用方持有）。
 */
export function mergeLoadedChildren(
  nodes: LhTreeNode[],
  loadedMap: Record<string, LhTreeNode[]>,
): LhTreeNode[] {
  if (Object.keys(loadedMap).length === 0) return nodes
  return nodes.map((node) => {
    const loaded = loadedMap[node.key]
    const next: LhTreeNode = loaded ? { ...node, children: loaded } : node
    if (next.children?.length) {
      return { ...next, children: mergeLoadedChildren(next.children, loadedMap) }
    }
    return next
  })
}

/**
 * 节点是否可发起懒加载：lazy 开启、非声明叶子（isLeaf）、且尚未加载过。
 */
export function isNodeLoadable(
  node: LhTreeNode,
  lazy: boolean,
  loadedKeys: string[],
): boolean {
  return lazy && node.isLeaf !== true && !loadedKeys.includes(node.key)
}
