import { describe, it, expect } from 'vitest'
import {
  findNode,
  findPathByValues,
  getChildren,
  getField,
  getPanelClassNames,
  getPanelItems,
  searchNodes,
  getSelectedLabelPath,
  getCascaderClassNames,
  expandLastValue,
  isLeafNode,
  flattenNodes,
} from '../../../src/core/cascader'
import {
  getCascaderColumnAria,
  getCascaderItemAria,
  getCascaderTriggerAria,
} from '../../../src/core/cascader'
import type { LhCascaderNode } from '../../../src/core/cascader'

const mockTree: LhCascaderNode[] = [
  {
    value: 'zhili',
    label: '浙江',
    children: [
      {
        value: 'hangzhou',
        label: '杭州',
        children: [
          { value: 'xihu', label: '西湖' },
          { value: 'xiasha', label: '下沙' },
        ],
      },
      {
        value: 'ningbo',
        label: '宁波',
        children: [
          { value: 'tianyi', label: '天一广场' },
          { value: 'fenghua', label: '奉化' },
        ],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: '江苏',
    children: [
      {
        value: 'nanjing',
        label: '南京',
        children: [
          { value: 'xuanwu', label: '玄武湖' },
        ],
      },
    ],
  },
]

describe('cascader core logic', () => {
  describe('findNode', () => {
    it('should find direct node', () => {
      const result = findNode(mockTree, 'zhili')
      expect(result).not.toBeNull()
      expect(result?.node.value).toBe('zhili')
      expect(result?.path.length).toBe(1)
    })

    it('should find nested node', () => {
      const result = findNode(mockTree, 'xihu')
      expect(result).not.toBeNull()
      expect(result?.node.value).toBe('xihu')
      expect(result?.path.map((n) => n.value)).toEqual(['zhili', 'hangzhou', 'xihu'])
    })

    it('should return null for non-existent node', () => {
      const result = findNode(mockTree, 'unknown')
      expect(result).toBeNull()
    })

    it('should not search children in strict mode', () => {
      const result = findNode(mockTree, 'xihu', true)
      // In strict mode, 'xihu' is not a direct child of root
      const directFound = mockTree.some((n) => n.value === 'xihu')
      expect(directFound).toBe(false)
      if (!directFound) expect(result).toBeNull()
    })
  })

  describe('findPathByValues', () => {
    it('should find complete path from values', () => {
      const result = findPathByValues(mockTree, ['zhili', 'hangzhou', 'xihu'])
      expect(result).not.toBeNull()
      expect(result?.path).toEqual(['zhili', 'hangzhou', 'xihu'])
      expect(result?.nodes.map((n) => n.label)).toEqual(['浙江', '杭州', '西湖'])
    })

    it('should return null for invalid path', () => {
      const result = findPathByValues(mockTree, ['zhili', 'nanjing'])
      expect(result).toBeNull()
    })

    it('should handle single value', () => {
      const result = findPathByValues(mockTree, ['jiangsu'])
      expect(result).not.toBeNull()
      expect(result?.path).toEqual(['jiangsu'])
    })

    it('should return null for empty values', () => {
      const result = findPathByValues(mockTree, [])
      expect(result).toBeNull()
    })
  })

  describe('getChildren', () => {
    it('should return children array', () => {
      const children = getChildren(mockTree[0])
      expect(children.length).toBe(2)
    })

    it('should return empty array for leaf node', () => {
      const leaf = mockTree[0].children![0].children![0]
      const children = getChildren(leaf)
      expect(children.length).toBe(0)
    })

    it('should support custom children key', () => {
      const node = {
        value: 'a',
        label: 'A',
        subItems: [{ value: 'b', label: 'B' }],
      }
      const children = getChildren(node, { children: 'subItems' })
      expect(children.length).toBe(1)
    })
  })

  describe('getPanelItems', () => {
    it('should convert nodes to panel items', () => {
      const items = getPanelItems(mockTree)
      expect(items.length).toBe(2)
      expect(items[0].label).toBe('浙江')
      expect(items[0].hasChildren).toBe(true)
    })

    it('should mark expanded items', () => {
      const expanded = new Set(['zhili'])
      const items = getPanelItems(mockTree, expanded)
      expect(items[0].isExpanded).toBe(true)
      expect(items[1].isExpanded).toBe(false)
    })

    it('should handle disabled nodes', () => {
      const treeWithDisabled: LhCascaderNode[] = [
        { value: 'a', label: 'A', disabled: true },
      ]
      const items = getPanelItems(treeWithDisabled)
      expect(items[0].isDisabled).toBe(true)
    })
  })

  describe('searchNodes', () => {
    it('should find matching nodes', () => {
      const results = searchNodes(mockTree, '杭州')
      expect(results.length).toBeGreaterThan(0)
      // nodes 是完整祖先链，命中节点在末尾
      const hit = results[0].nodes[results[0].nodes.length - 1]
      expect(hit.label).toBe('杭州')
    })

    it('should not find non-existent search term', () => {
      const results = searchNodes(mockTree, '不存在')
      expect(results.length).toBe(0)
    })

    it('should return the full ancestor chain for each hit', () => {
      // 回归：曾只返回匹配节点自身，面板无法展示它属于哪条路径
      const results = searchNodes(mockTree, '西湖')
      expect(results).toHaveLength(1)
      expect(results[0].path).toEqual(['zhili', 'hangzhou', 'xihu'])
      expect(results[0].pathLabels).toEqual(['浙江', '杭州', '西湖'])
    })

    it('should match case-insensitively', () => {
      const english: LhCascaderNode[] = [
        { value: 'us', label: 'United States', children: [{ value: 'nyc', label: 'New York' }] },
      ]
      expect(searchNodes(english, 'NEW york').map((r) => r.path)).toContainEqual(['us', 'nyc'])
      expect(searchNodes(english, 'new york').map((r) => r.path)).toContainEqual(['us', 'nyc'])
    })

    it('should not recurse infinitely on cyclic data', () => {
      const cyclic: LhCascaderNode[] = [{ value: 'x', label: 'X' }]
      cyclic[0].children = cyclic
      expect(() => searchNodes(cyclic, 'X')).not.toThrow()
      expect(searchNodes(cyclic, 'X').map((r) => r.path)).toContainEqual(['x'])
    })

    it('should cap the number of results', () => {
      const big: LhCascaderNode[] = Array.from({ length: 100 }, (_, i) => ({
        value: `v${i}`,
        label: '同名片',
      }))
      expect(searchNodes(big, '同名片').length).toBe(50)
    })
  })

  describe('itemConfig', () => {
    const customTree: LhCascaderNode[] = [
      {
        value: 'root',
        label: '根',
        children: [
          { value: 'leaf1', label: '叶一', disabled: true },
          { value: 'leaf2', label: '叶二' },
        ],
      } as LhCascaderNode,
    ]

    it('reads custom field keys when provided', () => {
      const leaf = { id: 'l', name: '叶', unavailable: true }
      const root = { id: 'r', name: '根', sub: [leaf], unavailable: true }
      const tree = [root] as unknown as LhCascaderNode[]
      const config = { value: 'id', label: 'name', children: 'sub', disabled: 'unavailable' }

      const found = findNode(tree, 'l', false, [], config)
      expect(found?.node).toBe(leaf)

      const items = getPanelItems(root.sub as unknown as LhCascaderNode[], new Set(), config)
      expect(items[0].isDisabled).toBe(true)

      const labels = getSelectedLabelPath(tree, ['r', 'l'], config)
      expect(labels).toBe('根 / 叶')

      expect(expandLastValue(tree, 'l', config)).toEqual(['r', 'l'])
    })

    it('falls back to standard keys when the custom key is absent', () => {
      // getField 的自定义键只在 nullish 时回退：节点同时定义两个键时永远走自定义键，
      // 所以回退分支必须用一个**不含**自定义键的节点来检验
      const withCustom = { id: 'c', name: '自定义' }
      const stdOnly = { value: 'std', label: '标准' }
      const config = { value: 'id', label: 'name' }

      // 自定义键存在时优先
      expect(expandLastValue([withCustom] as unknown as LhCascaderNode[], 'c', config)).toEqual([
        'c',
      ])
      // 自定义键缺失时回退标准键
      expect(expandLastValue([stdOnly], 'std', config)).toEqual(['std'])
    })

    it('honours custom disabled and children keys in panel items', () => {
      const items = getPanelItems(customTree[0].children!, new Set(), {
        children: 'children',
        disabled: 'disabled',
      })
      expect(items.map((i) => i.label)).toEqual(['叶一', '叶二'])
    })
  })

  describe('getSelectedLabelPath', () => {
    it('should return joined labels', () => {
      const label = getSelectedLabelPath(mockTree, ['zhili', 'hangzhou', 'xihu'])
      expect(label).toBe('浙江 / 杭州 / 西湖')
    })

    it('should return empty string for invalid path', () => {
      const label = getSelectedLabelPath(mockTree, ['zhili', 'nanjing'])
      expect(label).toBe('')
    })
  })

  describe('getCascaderClassNames', () => {
    it('should return base class', () => {
      const classes = getCascaderClassNames({ size: 'medium', disabled: false, visible: false, readonly: false })
      expect(classes).toContain('lh-cascader')
    })

    it('should add disabled class', () => {
      const classes = getCascaderClassNames({ size: 'medium', disabled: true, visible: false, readonly: false })
      expect(classes).toContain('lh-cascader--disabled')
    })

    it('should add size class', () => {
      const classes = getCascaderClassNames({ size: 'large', disabled: false, visible: false, readonly: false })
      expect(classes).toContain('lh-cascader--large')
    })
  })

  describe('expandLastValue', () => {
    it('should expand leaf value to path', () => {
      const result = expandLastValue(mockTree, 'xihu')
      expect(result).toEqual(['zhili', 'hangzhou', 'xihu'])
    })

    it('should return null for unknown value', () => {
      const result = expandLastValue(mockTree, 'unknown')
      expect(result).toBeNull()
    })

    it('should return path for root level', () => {
      const result = expandLastValue(mockTree, 'zhili')
      expect(result).toEqual(['zhili'])
    })
  })

  describe('isLeafNode', () => {
    it('should detect leaf nodes', () => {
      const leaf = mockTree[0].children![0].children![0]
      expect(isLeafNode(leaf)).toBe(true)
    })

    it('should detect non-leaf nodes', () => {
      expect(isLeafNode(mockTree[0])).toBe(false)
    })

    it('should respect explicit leaf flag', () => {
      const node: LhCascaderNode = { value: 'a', label: 'A', leaf: true, children: [] }
      expect(isLeafNode(node)).toBe(true)
    })
  })

  describe('flattenNodes', () => {
    it('should flatten all nodes', () => {
      const result = flattenNodes(mockTree)
      // 2 root + 2 zhejiang cities + 2 hangzhou districts + 2 ningbo districts + 1 jiangsu city + 1 nanjing district
      expect(result.length).toBeGreaterThan(mockTree.length)
    })

    it('should include full path for each node', () => {
      const result = flattenNodes(mockTree)
      const xihu = result.find((r) => r.node.value === 'xihu')
      expect(xihu?.pathValues).toEqual(['zhili', 'hangzhou', 'xihu'])
    })

    it('should not recurse infinitely on cyclic data', () => {
      const cyclic: LhCascaderNode[] = [{ value: 'x', label: 'X' }]
      cyclic[0].children = cyclic
      expect(() => flattenNodes(cyclic)).not.toThrow()
      expect(flattenNodes(cyclic).map((r) => r.node.value)).toEqual(['x'])
    })
  })

  describe('round 2: getField / getChildren 健壮化', () => {
    it('getField prefers the custom key and falls back to the standard key on nullish', () => {
      expect(getField({ value: 'v', label: 'l' }, 'value')).toBe('v')
      expect(getField({ id: 'x' } as unknown as LhCascaderNode, 'value', 'id')).toBe('x')
      // 自定义键存在但值为 falsy（0）时仍走自定义键：?? 只回退 nullish
      expect(getField({ id: 0 } as unknown as LhCascaderNode, 'value', 'id')).toBe(0)
      // 自定义键 undefined 才回退标准键
      expect(
        getField({ id: undefined, value: 'std' } as unknown as LhCascaderNode, 'value', 'id'),
      ).toBe('std')
    })

    it('getChildren tolerates null/primitive nodes and non-array children', () => {
      expect(getChildren(null as unknown as LhCascaderNode)).toEqual([])
      expect(getChildren('x' as unknown as LhCascaderNode)).toEqual([])
      expect(getChildren({ children: 'nope' } as unknown as LhCascaderNode)).toEqual([])
      expect(getChildren({ children: [{ value: 'c' }] } as unknown as LhCascaderNode)).toHaveLength(1)
      expect(getChildren({ value: 'leaf' })).toEqual([])
    })

    it('getPanelClassNames follows the BEM contract', () => {
      expect(getPanelClassNames({ hoverMode: true })).toEqual([
        'lh-cascader-panel',
        'lh-cascader-panel--hover-mode',
      ])
      expect(getPanelClassNames({})).toEqual(['lh-cascader-panel'])
    })
  })
})

describe('LhCascader accessibility', () => {
  it('binds trigger aria attributes for a listbox popup', () => {
    expect(getCascaderTriggerAria(true, 'cp')).toEqual({
      'aria-expanded': true,
      'aria-controls': 'cp',
      'aria-haspopup': 'listbox',
    })
  })

  it('marks each column with its level', () => {
    expect(getCascaderColumnAria('cp-1', 1)).toEqual({ role: 'listbox', id: 'cp-1', 'aria-level': 1 })
  })

  it('maps panel item state to aria attributes', () => {
    expect(getCascaderItemAria({ selected: false })).toEqual({ role: 'option' })
    expect(
      getCascaderItemAria({ selected: true, expanded: true, hasChildren: true }),
    ).toEqual({ role: 'option', 'aria-expanded': true, 'aria-selected': true })
    expect(
      getCascaderItemAria({ selected: false, expanded: false, hasChildren: true, disabled: true }),
    ).toEqual({ role: 'option', 'aria-expanded': false, 'aria-disabled': true })
  })
})
