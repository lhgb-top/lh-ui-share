import { describe, it, expect } from 'vitest'
import {
  findNode,
  findPathByValues,
  getChildren,
  getPanelItems,
  searchNodes,
  getSelectedLabelPath,
  getCascaderClassNames,
  expandLastValue,
  isLeafNode,
  flattenNodes,
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
      expect(results[0].nodes[0].label).toBe('杭州')
    })

    it('should not find non-existent search term', () => {
      const results = searchNodes(mockTree, '不存在')
      expect(results.length).toBe(0)
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
  })
})