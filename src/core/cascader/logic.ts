import type {
  LhCascaderNode,
  LhCascaderPanelItem,
  LhCascaderPath,
  LhCascaderSearchResult,
  LhCascaderItemConfig,
} from './types'

/**
 * 查找节点
 */
export function findNode(
  nodes: LhCascaderNode[],
  value: string | number,
  strict = false
): { node: LhCascaderNode; path: LhCascaderNode[] } | null {
  for (const node of nodes) {
    if (node.value === value) {
      return { node, path: [node] }
    }
    if (!strict && node.children?.length) {
      const result = findNode(node.children, value, strict)
      if (result) {
        return { ...result, path: [node, ...result.path] }
      }
    }
  }
  return null
}

/**
 * 根据路径找到完整节点路径
 */
export function findPathByValues(
  nodes: LhCascaderNode[],
  values: (string | number)[]
): LhCascaderPath | null {
  if (!values.length) return null

  let currentNodes = nodes
  const path: LhCascaderNode[] = []

  for (const value of values) {
    const found = currentNodes.find((n) => n.value === value)
    if (!found) return null
    path.push(found)
    currentNodes = found.children?.filter((c) => !c.disabled) ?? []
  }

  return { path: values, nodes: path }
}

/**
 * 获取子节点
 */
export function getChildren(
  node: LhCascaderNode,
  itemConfig: LhCascaderItemConfig = {}
): LhCascaderNode[] {
  const key = itemConfig.children ?? 'children'
  return (node as any)[key] ?? []
}

/**
 * 获取面板项
 */
export function getPanelItems(
  nodes: LhCascaderNode[],
  expandedValues: Set<string | number> = new Set(),
  itemConfig: LhCascaderItemConfig = {}
): LhCascaderPanelItem[] {
  return nodes.map((node) => ({
    value: node.value,
    label: node.label,
    isDisabled: !!node.disabled,
    isExpanded: expandedValues.has(node.value),
    hasChildren: getChildren(node, itemConfig).length > 0 || node.leaf === false,
  }))
}

/**
 * 搜索匹配项
 */
export function searchNodes(
  nodes: LhCascaderNode[],
  keyword: string,
  results: LhCascaderSearchResult[] = []
): LhCascaderSearchResult[] {
  for (const node of nodes) {
    if (node.label.includes(keyword)) {
      results.push({
        path: [node.value],
        nodes: [node],
        pathLabels: [node.label],
      })
    }
    if (node.children?.length) {
      searchNodes(node.children, keyword, results)
    }
  }
  return results
}

/**
 * 获取选中节点的标签路径
 */
export function getSelectedLabelPath(
  nodes: LhCascaderNode[],
  values: (string | number)[]
): string {
  const path = findPathByValues(nodes, values)
  return path?.nodes.map((n) => n.label).join(' / ') ?? ''
}

/**
 * 获取 class 名
 */
export function getCascaderClassNames(state: {
  size: string
  disabled: boolean
  visible: boolean
  readonly: boolean
}): string[] {
  const classes: string[] = ['lh-cascader']
  if (state.size) classes.push(`lh-cascader--${state.size}`)
  if (state.disabled) classes.push('lh-cascader--disabled')
  if (state.visible) classes.push('lh-cascader--visible')
  if (state.readonly) classes.push('lh-cascader--readonly')
  return classes
}

/**
 * 获取面板 class 名
 */
export function getPanelClassNames(state: {
  hoverMode?: boolean
}): string[] {
  const classes: string[] = ['lh-cascader-panel']
  if (state.hoverMode) classes.push('lh-cascader-panel--hover-mode')
  return classes
}

/**
 * 从值数组还原完整路径（当 emitPath 为 false 时）
 */
export function expandLastValue(
  nodes: LhCascaderNode[],
  value: string | number
): (string | number)[] | null {
  const result = findNode(nodes, value)
  return result ? result.path.map((n) => n.value) : null
}

/**
 * 检查节点是否为叶子节点
 */
export function isLeafNode(
  node: LhCascaderNode,
  itemConfig: LhCascaderItemConfig = {}
): boolean {
  if (node.leaf !== undefined) return node.leaf
  const children = getChildren(node, itemConfig)
  return children.length === 0
}

/**
 * 平铺所有节点为列表
 */
export function flattenNodes(
  nodes: LhCascaderNode[]
): { node: LhCascaderNode; path: LhCascaderNode[]; pathValues: (string | number)[] }[] {
  const result: { node: LhCascaderNode; path: LhCascaderNode[]; pathValues: (string | number)[] }[] = []
  function walk(nodes: LhCascaderNode[], path: LhCascaderNode[], pathValues: (string | number)[]): void {
    for (const node of nodes) {
      const newPath = [...path, node]
      const newPathValues = [...pathValues, node.value]
      result.push({ node, path: newPath, pathValues: newPathValues })
      if (node.children?.length) {
        walk(node.children, newPath, newPathValues)
      }
    }
  }
  walk(nodes, [], [])
  return result
}