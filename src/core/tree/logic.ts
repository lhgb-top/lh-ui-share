import type { LhFlatTreeNode, LhTreeCheckState, LhTreeNode } from './types'
import { getNextListIndex } from '../shared/keyboard'
import type { LhAriaAttrs } from '../shared/a11y'

/** 是否叶子节点 */
export function isTreeNodeLeaf(node: LhTreeNode): boolean {
  if (node.isLeaf != null) return node.isLeaf
  return !node.children || node.children.length === 0
}

/**
 * 扁平化树（深度优先，父在子前）。
 * 只展开 expandedKeys 命中的节点的子树。
 *
 * 祖先键集合判重保护循环引用数据；expandedKeys 入口转 Set，O(1) 查找。
 */
export function flattenTree(
  nodes: LhTreeNode[],
  expandedKeys: string[],
  level = 0,
  parentKey: string | null = null,
  ancestorKeys: string[] = [],
  expandedSet: Set<string> = new Set(expandedKeys),
  seen: Set<string> = new Set(),
): LhFlatTreeNode[] {
  const result: LhFlatTreeNode[] = []
  for (const node of nodes) {
    if (seen.has(node.key)) continue
    const isLeaf = isTreeNodeLeaf(node)
    result.push({
      node,
      key: node.key,
      level,
      parentKey,
      ancestorKeys,
      isLeaf,
    })
    if (!isLeaf && expandedSet.has(node.key) && node.children) {
      const nextSeen = new Set(seen)
      nextSeen.add(node.key)
      result.push(
        ...flattenTree(
          node.children,
          expandedKeys,
          level + 1,
          node.key,
          [...ancestorKeys, node.key],
          expandedSet,
          nextSeen,
        ),
      )
    }
  }
  return result
}

/** 收集全部后代键（祖先链判重保护循环引用） */
export function getDescendantKeys(node: LhTreeNode, seen: Set<string> = new Set()): string[] {
  if (!node.children) return []
  const keys: string[] = []
  for (const child of node.children) {
    if (seen.has(child.key)) continue
    const nextSeen = new Set(seen)
    nextSeen.add(child.key)
    keys.push(child.key, ...getDescendantKeys(child, nextSeen))
  }
  return keys
}

/** 按键查节点（祖先链判重保护循环引用） */
export function findTreeNode(
  nodes: LhTreeNode[],
  key: string,
  seen: Set<string> = new Set(),
): LhTreeNode | null {
  for (const node of nodes) {
    if (seen.has(node.key)) continue
    if (node.key === key) return node
    if (node.children) {
      const nextSeen = new Set(seen)
      nextSeen.add(node.key)
      const found = findTreeNode(node.children, key, nextSeen)
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

  const leaves = collectCheckableLeafKeys(node)
  // 未加载的非叶子（isLeaf 非 true 且无 children）：collectCheckableLeafKeys 返回空数组，
  // 但 toggleCheckKeys 会把它的自身键写入 checkedKeys。此处与 isSubtreeFullyChecked 的
  // next.has(node.key) 分支同义——键在即 checked，否则 unchecked（空子树不可能半选）
  if (leaves.length === 0) {
    return checkedKeys.includes(node.key) ? 'checked' : 'unchecked'
  }
  const checkedLeaves = leaves.filter((key) => checkedKeys.includes(key))
  if (checkedLeaves.length === 0) return 'unchecked'
  if (checkedLeaves.length === leaves.length) return 'checked'
  return 'indeterminate'
}

/**
 * 收集子树内所有「参与勾选计数」的叶子键（祖先链判重保护循环引用）。
 *
 * 跳过禁用子树——与 collectCascadeKeys / isSubtreeFullyChecked 同规则：
 * 禁用节点的键既不会被 toggleCheckKeys 级联写入，也不该计入全选分母，
 * 否则父级勾选后会因禁用后代缺位而恒显 indeterminate。
 */
function collectCheckableLeafKeys(node: LhTreeNode, seen: Set<string> = new Set()): string[] {
  if (node.disabled) return []
  if (isTreeNodeLeaf(node)) return [node.key]
  const keys: string[] = []
  for (const child of node.children ?? []) {
    if (seen.has(child.key)) continue
    const nextSeen = new Set(seen)
    nextSeen.add(child.key)
    keys.push(...collectCheckableLeafKeys(child, nextSeen))
  }
  return keys
}

/** 收集子树内所有叶子键（祖先链判重保护循环引用） */
export function collectLeafKeys(node: LhTreeNode, seen: Set<string> = new Set()): string[] {
  if (isTreeNodeLeaf(node)) return [node.key]
  const keys: string[] = []
  for (const child of node.children ?? []) {
    if (seen.has(child.key)) continue
    const nextSeen = new Set(seen)
    nextSeen.add(child.key)
    keys.push(...collectLeafKeys(child, nextSeen))
  }
  return keys
}

/**
 * 子树是否「完全勾选」：用于级联回溯时判定父级该不该加入。
 *
 * 与 collectLeafKeys 的纯叶子计数不同：
 * - 跳过禁用子树（禁用节点不参与「全选」判定，其键也不被级联写入）；
 * - 未加载的非叶子节点（isLeaf 非 true 且无 children）要求**自身键也在 next 中**才算全选——
 *   否则空子树恒真会让父级被误选，破坏「父选中 ⇒ 全部后代选中」的不变量。
 */
function isSubtreeFullyChecked(
  node: LhTreeNode,
  next: Set<string>,
  seen: Set<LhTreeNode> = new Set()
): boolean {
  // 祖先链判重保护循环引用：环上重复访问按「不阻塞全选」处理
  if (seen.has(node)) return true
  seen.add(node)
  if (node.disabled) return true
  if (isTreeNodeLeaf(node)) return next.has(node.key)
  if (node.isLeaf !== true && (!node.children || node.children.length === 0)) {
    return next.has(node.key)
  }
  return (node.children ?? []).every((child) => isSubtreeFullyChecked(child, next, seen))
}

/**
 * 收集子树内所有「可参与级联」的后代键（跳过禁用节点）。祖先链判重保护循环引用。
 */
function collectCascadeKeys(
  node: LhTreeNode,
  keys: string[] = [],
  seen: Set<LhTreeNode> = new Set()
): string[] {
  if (node.disabled || seen.has(node)) return keys
  seen.add(node)
  keys.push(node.key)
  for (const child of node.children ?? []) {
    collectCascadeKeys(child, keys, seen)
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
  const descendants = collectCascadeKeys(node)
  const shouldCheck = !checkedKeys.includes(key)

  for (const k of descendants) {
    if (shouldCheck) next.add(k)
    else next.delete(k)
  }

  // 向上回溯：子树完全勾选 → 父级加入；否则父级移除。
  // 禁用父级不参与级联（键不写入、也不移除，保持「其键不被级联改写」的不变量）
  let parent = findParentNode(roots, key)
  while (parent) {
    if (!parent.disabled) {
      if (isSubtreeFullyChecked(parent, next)) next.add(parent.key)
      else next.delete(parent.key)
    }
    parent = findParentNode(roots, parent.key)
  }

  return Array.from(next)
}

/** 查父节点（顶层返回 null；祖先链判重保护循环引用） */
export function findParentNode(
  nodes: LhTreeNode[],
  key: string,
  parent: LhTreeNode | null = null,
  seen: Set<string> = new Set(),
): LhTreeNode | null {
  for (const node of nodes) {
    if (seen.has(node.key)) continue
    if (node.key === key) return parent
    if (node.children && node.children.length > 0) {
      const nextSeen = new Set(seen)
      nextSeen.add(node.key)
      // 先判断直接命中，避免子查询返回 null 时无法区分「未找到」与「父为顶层」
      if (node.children.some((child) => child.key === key)) return node
      const found = findParentNode(node.children, key, node, nextSeen)
      if (found) return found
    }
  }
  return null
}

/**
 * 树的键盘导航：返回下一个可获得焦点的节点键。
 * 跳过高亮过滤后不可见的节点交由调用方预先过滤（传入已过滤的扁平列表）。
 */
/**
 * 树节点的 ↑/↓ 焦点移动：在扁平可见列表中循环移动，跳过禁用项。
 * 纯函数，DOM 查询与 focus 由调用方负责。
 *
 * @deprecated 导航算法已收敛到 `core/shared/keyboard` 的 `getNextListIndex`，
 * 本外壳保留旧签名与「当前值无效时回退首项」的既有语义，供下游既有引用。
 */
export function moveTreeFocus(
  flat: LhFlatTreeNode[],
  currentKey: string | null,
  direction: 1 | -1,
): string | null {
  if (flat.length === 0) return null
  const enabled = flat.filter((item) => !item.node.disabled)
  if (enabled.length === 0) return null
  // 当前 key 无效（被收起或禁用）时无论方向都回到首个可用项（保持旧行为）
  const index = currentKey == null ? -1 : enabled.findIndex((item) => item.key === currentKey)
  if (index < 0) return enabled[0].key

  const next = getNextListIndex(enabled, index, direction)
  return next < 0 ? null : enabled[next].key
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
 * 祖先链判重保护循环引用，避免反复挂载导致无限递归。
 */
export function mergeLoadedChildren(
  nodes: LhTreeNode[],
  loadedMap: Record<string, LhTreeNode[]>,
  seen: Set<string> = new Set(),
): LhTreeNode[] {
  if (Object.keys(loadedMap).length === 0) return nodes
  return nodes.map((node) => {
    if (seen.has(node.key)) return node
    const nextSeen = new Set(seen)
    nextSeen.add(node.key)
    const loaded = loadedMap[node.key]
    const next: LhTreeNode = loaded ? { ...node, children: loaded } : node
    if (next.children?.length) {
      return { ...next, children: mergeLoadedChildren(next.children, loadedMap, nextSeen) }
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

/**
 * 树容器的无障碍属性包：role="tree"
 *
 * @param id 树元素 id（树项的 aria-labelledby 等引用，按需传）
 */
export function getTreeAria(id?: string): LhAriaAttrs {
  const attrs: LhAriaAttrs = { role: 'tree' }
  if (id) attrs.id = id
  return attrs
}

/**
 * 树项的无障碍属性包：role="treeitem" + aria-level + aria-expanded + aria-selected + aria-checked
 *
 * @param level 层级（根为 1）
 * @param expanded 是否展开（叶子节点不输出，避免无意义的 aria-expanded="false"）
 * @param selected 是否选中
 * @param checked 勾选态（showCheckbox 时输出：true / false / 'indeterminate'）
 * @param disabled 是否禁用
 */
export function getTreeNodeAria(options: {
  level: number
  expanded?: boolean
  leaf?: boolean
  selected?: boolean
  checked?: boolean | 'indeterminate'
  disabled?: boolean
}): LhAriaAttrs {
  const { level, expanded, leaf, selected, checked, disabled } = options
  const attrs: LhAriaAttrs = { role: 'treeitem', 'aria-level': level }
  if (!leaf) attrs['aria-expanded'] = !!expanded
  if (selected) attrs['aria-selected'] = true
  if (checked !== undefined) attrs['aria-checked'] = checked
  if (disabled) attrs['aria-disabled'] = true
  return attrs
}
