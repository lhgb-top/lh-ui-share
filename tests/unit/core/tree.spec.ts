import { describe, expect, it } from 'vitest'
import {
  collectLeafKeys,
  findParentNode,
  findTreeNode,
  flattenTree,
  getDescendantKeys,
  getNodeCheckState,
  getTreeClassNames,
  getTreeNodeClassNames,
  isNodeLoadable,
  isTreeNodeLeaf,
  mergeLoadedChildren,
  moveTreeFocus,
  toggleCheckKeys,
  getTreeAria,
  getTreeNodeAria,
} from '../../../src/core/tree'
import type { LhTreeNode } from '../../../src/core/tree'

const tree: LhTreeNode[] = [
  {
    key: 'a',
    label: '甲',
    children: [
      { key: 'a-1', label: '甲一' },
      { key: 'a-2', label: '甲二' },
    ],
  },
  { key: 'b', label: '乙', children: [{ key: 'b-1', label: '乙一' }] },
  { key: 'c', label: '丙' },
]

describe('LhTree core', () => {
  it('detects leaves', () => {
    expect(isTreeNodeLeaf({ key: 'x', label: 'x' })).toBe(true)
    expect(isTreeNodeLeaf({ key: 'x', label: 'x', children: [] })).toBe(true)
    expect(isTreeNodeLeaf({ key: 'x', label: 'x', children: [{ key: 'y', label: 'y' }] })).toBe(false)
    expect(isTreeNodeLeaf({ key: 'x', label: 'x', isLeaf: true, children: [{ key: 'y', label: 'y' }] })).toBe(true)
  })

  it('flattens only expanded subtrees', () => {
    expect(flattenTree(tree, []).map((n) => n.key)).toEqual(['a', 'b', 'c'])
    expect(flattenTree(tree, ['a']).map((n) => n.key)).toEqual(['a', 'a-1', 'a-2', 'b', 'c'])
    expect(flattenTree(tree, ['a', 'b']).map((n) => n.key)).toEqual(['a', 'a-1', 'a-2', 'b', 'b-1', 'c'])
  })

  it('records level and ancestors when flattening', () => {
    const flat = flattenTree(tree, ['a'])
    const child = flat.find((n) => n.key === 'a-1')
    expect(child?.level).toBe(1)
    expect(child?.parentKey).toBe('a')
    expect(child?.ancestorKeys).toEqual(['a'])
  })

  it('collects descendants and leaves', () => {
    expect(getDescendantKeys(tree[0])).toEqual(['a-1', 'a-2'])
    expect(collectLeafKeys(tree[0])).toEqual(['a-1', 'a-2'])
    expect(collectLeafKeys({ key: 'c', label: '丙' })).toEqual(['c'])
  })

  it('finds nodes and parents', () => {
    expect(findTreeNode(tree, 'a-1')?.label).toBe('甲一')
    expect(findTreeNode(tree, 'nope')).toBeNull()
    expect(findParentNode(tree, 'a-1')?.key).toBe('a')
    expect(findParentNode(tree, 'a')).toBeNull()
    expect(findParentNode(tree, 'nope')).toBeNull()
  })

  it('computes check states', () => {
    expect(getNodeCheckState(tree[0], [])).toBe('unchecked')
    expect(getNodeCheckState(tree[0], ['a-1'])).toBe('indeterminate')
    expect(getNodeCheckState(tree[0], ['a-1', 'a-2'])).toBe('checked')
    expect(getNodeCheckState(tree[2], ['c'])).toBe('checked')
  })

  it('cascades checks down and updates ancestors', () => {
    // 勾选父级 → 全部后代选中
    expect(toggleCheckKeys(tree, [], 'a').sort()).toEqual(['a', 'a-1', 'a-2'])
    // 勾选全部子级 → 父级自动选中
    expect(toggleCheckKeys(tree, ['a-1'], 'a-2').sort()).toEqual(['a', 'a-1', 'a-2'])
    // 取消子级 → 父级移除
    expect(toggleCheckKeys(tree, ['a', 'a-1', 'a-2'], 'a-1').sort()).toEqual(['a-2'])
  })

  it('ignores disabled nodes', () => {
    const withDisabled: LhTreeNode[] = [{ key: 'x', label: 'x', disabled: true }]
    expect(toggleCheckKeys(withDisabled, [], 'x')).toEqual([])
  })

  it('skips disabled subtrees when cascading checks', () => {
    const withDisabled: LhTreeNode[] = [
      {
        key: 'p',
        label: 'p',
        children: [
          { key: 'ok', label: 'ok' },
          { key: 'no', label: 'no', disabled: true, children: [{ key: 'no-1', label: 'no1' }] },
        ],
      },
    ]
    // 勾选父级：禁用子树不进入 checkedKeys
    expect(toggleCheckKeys(withDisabled, [], 'p').sort()).toEqual(['ok', 'p'])
    // 勾选可用子级：禁用子树不阻断父级判定为全选
    expect(toggleCheckKeys(withDisabled, [], 'ok').sort()).toEqual(['ok', 'p'])
  })

  it('keeps getNodeCheckState consistent with toggleCheckKeys under disabled subtrees', () => {
    // 回归：勾选态计算曾把禁用后代计入分母（collectLeafKeys 不跳过禁用），
    // 而级联写入从不写入禁用键——父级勾选后恒显 indeterminate，
    // 违反「父选中 ⇒ 全部可用后代选中」的不变量
    const withDisabled: LhTreeNode[] = [
      {
        key: 'p',
        label: 'p',
        children: [
          { key: 'ok', label: 'ok' },
          { key: 'no', label: 'no', disabled: true, children: [{ key: 'no-1', label: 'no1' }] },
        ],
      },
    ]
    const checked = toggleCheckKeys(withDisabled, [], 'p')
    expect(getNodeCheckState(withDisabled[0], checked)).toBe('checked')
    // 禁用节点自身仍按 checkedKeys 显示，不被半选污染
    const noNode = withDisabled[0].children![1]
    expect(getNodeCheckState(noNode, checked)).toBe('unchecked')
    expect(getNodeCheckState(noNode, [...checked, 'no', 'no-1'])).toBe('checked')
  })

  it('does not treat an unloaded subtree as fully checked', () => {
    // 懒加载场景：isLeaf:false 且尚未加载的节点不是叶子，
    // 勾选其兄弟时父级不应因「空子树恒真」被误判为全选
    const lazyTree: LhTreeNode[] = [
      {
        key: 'p',
        label: 'p',
        children: [
          { key: 'lazy', label: 'lazy', isLeaf: false },
          { key: 'ok', label: 'ok' },
        ],
      },
    ]
    expect(toggleCheckKeys(lazyTree, [], 'ok').sort()).toEqual(['ok'])
    // 显式勾选未加载节点本身（且兄弟已全选）后，父级才计入全选
    expect(toggleCheckKeys(lazyTree, ['ok'], 'lazy').sort()).toEqual(['lazy', 'ok', 'p'])
  })

  it('shows an unloaded non-leaf as checked when its own key is checked', () => {
    // 回归：toggleCheckKeys 会把未加载非叶子的自身键写入 checkedKeys，
    // 显示侧勾选态必须与之同步，否则出现"键在 checkedKeys 里却显示未选"
    const lazyRoot: LhTreeNode = { key: 'a', label: 'a', isLeaf: false }
    expect(getNodeCheckState(lazyRoot, ['a'], false)).toBe('checked')
    expect(getNodeCheckState(lazyRoot, [], false)).toBe('unchecked')
    const toggled = toggleCheckKeys([lazyRoot], [], 'a')
    expect(toggled).toEqual(['a'])
    expect(getNodeCheckState(lazyRoot, toggled, false)).toBe('checked')
  })

  it('does not recurse infinitely on cyclic data', () => {
    const cyclic: LhTreeNode[] = [{ key: 'x', label: 'x' }]
    cyclic[0].children = cyclic
    expect(() => flattenTree(cyclic, ['x'])).not.toThrow()
    expect(() => findTreeNode(cyclic, 'x')).not.toThrow()
    expect(() => getDescendantKeys(cyclic[0])).not.toThrow()
    expect(flattenTree(cyclic, ['x']).map((n) => n.key)).toEqual(['x'])
  })

  it('moves focus skipping disabled nodes', () => {
    const flat = flattenTree([...tree, { key: 'd', label: '丁', disabled: true }], [])
    expect(moveTreeFocus(flat, null, 1)).toBe('a')
    expect(moveTreeFocus(flat, 'c', 1)).toBe('a')
    expect(moveTreeFocus(flat, 'a', -1)).toBe('c')
    expect(moveTreeFocus([], null, 1)).toBeNull()
  })

  it('computes class names', () => {
    expect(getTreeClassNames({ showCheckbox: true })).toEqual(['lh-tree', 'lh-tree--checkbox'])
    expect(
      getTreeNodeClassNames({ expanded: true, selected: true, disabled: false, leaf: true }),
    ).toEqual(['lh-tree-node', 'lh-tree-node--expanded', 'lh-tree-node--selected', 'lh-tree-node--leaf'])
  })
  it('merges loaded children immutably', () => {
    const source: LhTreeNode[] = [{ key: 'a', label: 'a' }, { key: 'b', label: 'b', children: [{ key: 'b-1', label: 'b1' }] }]
    const loaded = { a: [{ key: 'a-1', label: 'a1' }] }
    const merged = mergeLoadedChildren(source, loaded)
    // 原树不被修改
    expect(source[0].children).toBeUndefined()
    expect(merged[0].children).toEqual([{ key: 'a-1', label: 'a1' }])
    // 已有子树保持原引用内容
    expect(merged[1].children?.[0].key).toBe('b-1')
    // 空加载结果视为叶子（无子树可展开）
    expect(mergeLoadedChildren(source, { a: [] })[0].children).toEqual([])
    expect(mergeLoadedChildren(source, {})).toBe(source)
  })

  it('detects loadable nodes', () => {
    const node = { key: 'a', label: 'a' }
    expect(isNodeLoadable(node, true, [])).toBe(true)
    expect(isNodeLoadable(node, false, [])).toBe(false)
    expect(isNodeLoadable(node, true, ['a'])).toBe(false)
    expect(isNodeLoadable({ ...node, isLeaf: true }, true, [])).toBe(false)
  })

  it('toggles checks strictly without cascade when checkStrictly', () => {
    expect(toggleCheckKeys(tree, [], 'a', { checkStrictly: true })).toEqual(['a'])
    // 不级联到后代
    expect(toggleCheckKeys(tree, ['a'], 'a', { checkStrictly: true })).toEqual([])
    expect(toggleCheckKeys(tree, ['a-1'], 'a', { checkStrictly: true })).toEqual(['a-1', 'a'])
  })

  it('computes binary check state when checkStrictly', () => {
    // 父级只勾自己，无半选
    expect(getNodeCheckState(tree[0], ['a'], true)).toBe('checked')
    expect(getNodeCheckState(tree[0], [], true)).toBe('unchecked')
    // 子级勾选不影响父级状态
    expect(getNodeCheckState(tree[0], ['a-1'], true)).toBe('unchecked')
  })

  it('does not cascade-check a disabled ancestor (round 2)', () => {
    // 回归：isSubtreeFullyChecked 对禁用节点恒真（vacuous truth），
    // 回溯循环曾把「部分子树未勾选」的禁用父级误写进勾选集
    const guarded: LhTreeNode[] = [
      {
        key: 'p',
        label: '禁用父',
        disabled: true,
        children: [
          { key: 'a', label: '甲' },
          { key: 'b', label: '乙' },
        ],
      },
    ]
    const next = toggleCheckKeys(guarded, [], 'a')
    expect(next).toContain('a')
    expect(next).not.toContain('p')
    expect(next).not.toContain('b')
  })

  it('terminates on cyclic trees in cascade helpers (round 2)', () => {
    // 回归：collectCascadeKeys / isSubtreeFullyChecked 缺环守卫，
    // 勾选环上节点会栈溢出（其余 walker 均已有守卫）
    const selfRef: LhTreeNode = { key: 's', label: '自环' }
    selfRef.children = [selfRef]
    expect(() => toggleCheckKeys([selfRef], [], 's')).not.toThrow()

    const cycleRoot: LhTreeNode = { key: 'r', label: '环根', children: [] }
    const cycleChild: LhTreeNode = { key: 'c', label: '环子', children: [] }
    cycleRoot.children = [cycleChild]
    cycleChild.children = [cycleRoot]
    expect(() => toggleCheckKeys([cycleRoot], [], 'r')).not.toThrow()
  })
})

describe('LhTree accessibility', () => {
  it('marks the tree container', () => {
    expect(getTreeAria('tr')).toEqual({ role: 'tree', id: 'tr' })
  })

  it('binds treeitem aria attributes', () => {
    expect(getTreeNodeAria({ level: 2, expanded: true, selected: true })).toEqual({
      role: 'treeitem',
      'aria-level': 2,
      'aria-expanded': true,
      'aria-selected': true,
    })
    // 叶子节点不输出 aria-expanded，避免无意义的 false
    expect(getTreeNodeAria({ level: 1, leaf: true, checked: 'indeterminate' })).toEqual({
      role: 'treeitem',
      'aria-level': 1,
      'aria-checked': 'indeterminate',
    })
    expect(getTreeNodeAria({ level: 1, leaf: true, disabled: true })).toHaveProperty(
      'aria-disabled',
      true,
    )
  })
})