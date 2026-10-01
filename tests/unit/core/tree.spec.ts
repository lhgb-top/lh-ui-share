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
})
