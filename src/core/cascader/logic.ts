import type {
  LhCascaderNode,
  LhCascaderPanelItem,
  LhCascaderPath,
  LhCascaderSearchResult,
  LhCascaderItemConfig,
} from './types'
import { getPopupTriggerAria } from '../shared/a11y'
import type { LhAriaAttrs } from '../shared/a11y'

/**
 * 查找节点
 *
 * 祖先链判重保护循环引用数据（懒加载回填、后端数据都可能意外成环）；
 * 不用全局 visited，避免误伤 DAG 中被合法共享的子树引用。
 */
export function findNode(
  nodes: LhCascaderNode[],
  value: string | number,
  strict = false,
  ancestors: LhCascaderNode[] = [],
  itemConfig: LhCascaderItemConfig = {}
): { node: LhCascaderNode; path: LhCascaderNode[] } | null {
  for (const node of nodes) {
    if (ancestors.includes(node)) continue
    if (getField<string | number>(node, 'value', itemConfig.value) === value) {
      return { node, path: [node] }
    }
    if (!strict) {
      const children = getChildren(node, itemConfig)
      if (children.length) {
        const result = findNode(children, value, strict, [...ancestors, node], itemConfig)
        if (result) {
          return { ...result, path: [node, ...result.path] }
        }
      }
    }
  }
  return null
}

/**
 * 按字段映射读取节点属性：自定义键优先，回退标准键。
 *
 * 使 LhCascaderItemConfig 声明的 value/label/disabled/leaf 真正生效；
 * 默认键时行为与不传 itemConfig 完全一致。
 */
export function getField<T>(node: LhCascaderNode, standard: string, configKey?: string): T {
  const key = configKey ?? standard
  const record = node as unknown as Record<string, unknown>
  return (record[key] ?? record[standard]) as T
}

/**
 * 根据路径找到完整节点路径
 *
 * 不再过滤禁用子节点：禁用是「不可点选」的 UI 约束，程序化回显应当能还原任意路径，
 * 且与 findNode 的行为保持一致（禁用拦截交给组件层在面板点击时处理）。
 */
export function findPathByValues(
  nodes: LhCascaderNode[],
  values: (string | number)[],
  itemConfig: LhCascaderItemConfig = {},
  ancestors: LhCascaderNode[] = []
): LhCascaderPath | null {
  if (!values.length) return null

  let currentNodes = nodes
  const path: LhCascaderNode[] = []

  for (const value of values) {
    const found = currentNodes.find((n) => {
      if (ancestors.includes(n)) return false
      return getField<string | number>(n, 'value', itemConfig.value) === value
    })
    if (!found) return null
    path.push(found)
    ancestors = [...ancestors, found]
    currentNodes = getChildren(found, itemConfig)
  }

  return { path: values, nodes: path }
}

/**
 * 获取子节点
 *
 * 脏数据兜底：null/原始值节点返回空子树，children 非数组也返回空，
 * 不再让 TypeError 或字符串展开污染面板渲染。
 */
export function getChildren(
  node: LhCascaderNode,
  itemConfig: LhCascaderItemConfig = {}
): LhCascaderNode[] {
  if (node == null || typeof node !== 'object') return []
  const key = itemConfig.children ?? 'children'
  const record = node as unknown as Record<string, unknown>
  const children = record[key]
  return Array.isArray(children) ? (children as LhCascaderNode[]) : []
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
    value: getField<string | number>(node, 'value', itemConfig.value),
    label: getField<string>(node, 'label', itemConfig.label),
    isDisabled: !!getField<boolean>(node, 'disabled', itemConfig.disabled),
    isExpanded: expandedValues.has(getField<string | number>(node, 'value', itemConfig.value)),
    hasChildren:
      getChildren(node, itemConfig).length > 0 || getField<boolean>(node, 'leaf', itemConfig.leaf) === false,
  }))
}

/**
 * 搜索匹配项
 *
 * 结果携带完整祖先链（path / nodes / pathLabels），供 UI 展示「浙江 / 杭州 / 西湖」；
 * 大小写不敏感；默认最多 50 条，避免大树 + 高频输入时每键击 O(全量节点)。
 */
export function searchNodes(
  nodes: LhCascaderNode[],
  keyword: string,
  results: LhCascaderSearchResult[] = [],
  itemConfig: LhCascaderItemConfig = {},
  maxResults = 50
): LhCascaderSearchResult[] {
  const lowerKeyword = keyword.toLowerCase()

  function walk(
    list: LhCascaderNode[],
    ancestorNodes: LhCascaderNode[],
    ancestors: LhCascaderNode[]
  ): void {
    for (const node of list) {
      if (results.length >= maxResults) return
      if (ancestors.includes(node)) continue

      const label = getField<string>(node, 'label', itemConfig.label)
      const chain = [...ancestorNodes, node]

      if (String(label ?? '').toLowerCase().includes(lowerKeyword)) {
        results.push({
          path: chain.map((n) => getField<string | number>(n, 'value', itemConfig.value)),
          nodes: chain,
          pathLabels: chain.map((n) => getField<string>(n, 'label', itemConfig.label)),
        })
      }

      const children = getChildren(node, itemConfig)
      if (children.length) {
        walk(children, chain, [...ancestors, node])
      }
    }
  }

  walk(nodes, [], [])
  return results
}

/**
 * 获取选中节点的标签路径
 */
export function getSelectedLabelPath(
  nodes: LhCascaderNode[],
  values: (string | number)[],
  itemConfig: LhCascaderItemConfig = {}
): string {
  const path = findPathByValues(nodes, values, itemConfig)
  return path?.nodes.map((n) => getField<string>(n, 'label', itemConfig.label)).join(' / ') ?? ''
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
  value: string | number,
  itemConfig: LhCascaderItemConfig = {}
): (string | number)[] | null {
  const result = findNode(nodes, value, false, [], itemConfig)
  return result ? result.path.map((n) => getField<string | number>(n, 'value', itemConfig.value)) : null
}

/**
 * 检查节点是否为叶子节点
 */
export function isLeafNode(
  node: LhCascaderNode,
  itemConfig: LhCascaderItemConfig = {}
): boolean {
  const leaf = getField<boolean | undefined>(node, 'leaf', itemConfig.leaf)
  if (leaf !== undefined) return leaf
  const children = getChildren(node, itemConfig)
  return children.length === 0
}

/**
 * 将自定义字段结构的节点树归一化为标准 LhCascaderNode 树
 * （itemConfig 声明 value/label/children 等字段别名；标准结构经此函数为恒等变换）
 *
 * 与 getField/getChildren 不同：本函数一次性把整棵树转成标准结构，
 * 后续逻辑无需再逐层传 itemConfig 读别名。
 */
export function normalizeCascaderNodes(
  nodes: readonly unknown[],
  itemConfig: LhCascaderItemConfig = {}
): LhCascaderNode[] {
  return nodes.map((raw) => {
    // 输入可能是任意字段结构的原始对象，统一按 LhCascaderNode 读别名
    const node = (raw == null || typeof raw !== 'object' ? {} : raw) as LhCascaderNode
    const normalized: LhCascaderNode = {
      value: getField<string | number>(node, 'value', itemConfig.value),
      label: getField<string>(node, 'label', itemConfig.label),
    }
    const disabled = getField<boolean | undefined>(node, 'disabled', itemConfig.disabled)
    if (disabled !== undefined) normalized.disabled = disabled
    const leaf = getField<boolean | undefined>(node, 'leaf', itemConfig.leaf)
    if (leaf !== undefined) normalized.leaf = leaf
    const children = getChildren(node, itemConfig)
    if (children.length) normalized.children = normalizeCascaderNodes(children, itemConfig)
    return normalized
  })
}

/**
 * 平铺所有节点为列表
 *
 * 祖先链判重保护循环引用。
 */
export function flattenNodes(
  nodes: LhCascaderNode[],
  itemConfig: LhCascaderItemConfig = {}
): { node: LhCascaderNode; path: LhCascaderNode[]; pathValues: (string | number)[] }[] {
  const result: { node: LhCascaderNode; path: LhCascaderNode[]; pathValues: (string | number)[] }[] = []
  function walk(
    list: LhCascaderNode[],
    path: LhCascaderNode[],
    pathValues: (string | number)[],
    ancestors: LhCascaderNode[]
  ): void {
    for (const node of list) {
      if (ancestors.includes(node)) continue
      const newPath = [...path, node]
      const newPathValues = [...pathValues, getField<string | number>(node, 'value', itemConfig.value)]
      result.push({ node, path: newPath, pathValues: newPathValues })
      const children = getChildren(node, itemConfig)
      if (children.length) {
        walk(children, newPath, newPathValues, [...ancestors, node])
      }
    }
  }
  walk(nodes, [], [], [])
  return result
}
/**
 * 触发器的无障碍属性包：级联面板以 listbox 语义弹出
 *
 * @param visible 面板是否展开
 * @param panelId 面板元素 id（未传时不输出 aria-controls）
 */
export function getCascaderTriggerAria(visible: boolean, panelId?: string): LhAriaAttrs {
  return getPopupTriggerAria({ expanded: visible, popupId: panelId, haspopup: 'listbox' })
}

/**
 * 面板列的无障碍属性包：每列是一个 listbox，level 标注层级深度（从 1 开始）
 *
 * @param id 列元素 id
 * @param level 列层级（1 = 第一级）
 */
export function getCascaderColumnAria(id?: string, level?: number): LhAriaAttrs {
  const attrs: LhAriaAttrs = { role: 'listbox' }
  if (id) attrs.id = id
  if (level != null) attrs['aria-level'] = level
  return attrs
}

/**
 * 面板项的无障碍属性包（级联面板项已有 isExpanded / isDisabled 数据，此处映射到 aria）：
 * role="option" + aria-expanded（有子级时）+ aria-disabled + aria-selected
 */
export function getCascaderItemAria(options: {
  selected: boolean
  expanded?: boolean
  disabled?: boolean
  hasChildren?: boolean
}): LhAriaAttrs {
  const { selected, expanded, disabled, hasChildren } = options
  const attrs: LhAriaAttrs = { role: 'option' }
  if (hasChildren) attrs['aria-expanded'] = !!expanded
  if (selected) attrs['aria-selected'] = true
  if (disabled) attrs['aria-disabled'] = true
  return attrs
}
