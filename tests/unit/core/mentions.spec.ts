import { describe, it, expect } from 'vitest'
import {
  filterMentionOptions,
  getMentionContext,
  getMentions,
  getMentionsListboxAria,
  getMentionOptionAria,
  getMentionsTriggerAria,
  insertMention,
} from '../../../src/core/mentions'
import type { LhMentionOption } from '../../../src/core/mentions'

const members: LhMentionOption[] = [
  { label: '张三', value: 'zhangsan' },
  { label: '张无忌', value: 'zhangwuji' },
  { label: '李四', value: 'lisi' },
]

describe('Mentions Core Logic', () => {
  describe('getMentionContext', () => {
    it('should detect active mention right after prefix', () => {
      const ctx = getMentionContext('你好@张', 4)
      expect(ctx.active).toBe(true)
      expect(ctx.prefixIndex).toBe(2)
      expect(ctx.searchText).toBe('张')
      expect(ctx.end).toBe(4)
    })

    it('should treat caret at text start as inactive', () => {
      const ctx = getMentionContext('', 0)
      expect(ctx).toEqual({ active: false, prefixIndex: -1, searchText: '', end: -1 })
    })

    it('should stay active with empty search string', () => {
      // 刚输入 @，还未键入搜索串：应展示全部候选
      const ctx = getMentionContext('你好@', 3)
      expect(ctx.active).toBe(true)
      expect(ctx.searchText).toBe('')
    })

    it('should treat prefix at text start as active', () => {
      const ctx = getMentionContext('@张', 2)
      expect(ctx.active).toBe(true)
      expect(ctx.prefixIndex).toBe(0)
    })

    it('should ignore email-like pseudo prefix', () => {
      // @ 前紧贴普通字符（邮箱 a@b），不触发提及
      const ctx = getMentionContext('联系 a@b', 7)
      expect(ctx.active).toBe(false)
    })

    it('should be inactive when whitespace sits between prefix and caret', () => {
      // 提及词已闭合（@张三 你好），光标在好之后不应再弹出
      const ctx = getMentionContext('@张三 你好', 7)
      expect(ctx.active).toBe(false)
    })

    it('should be inactive when whitespace precedes caret without prefix', () => {
      const ctx = getMentionContext('你好 世界', 5)
      expect(ctx.active).toBe(false)
    })

    it('should clamp out-of-range caret', () => {
      const tooFar = getMentionContext('@张', 99)
      expect(tooFar.active).toBe(true)
      expect(tooFar.end).toBe(2)
      const negative = getMentionContext('@张', -5)
      expect(negative.active).toBe(false)
    })
  })

  describe('insertMention', () => {
    it('should replace the pending mention segment and place caret after it', () => {
      const ctx = getMentionContext('你好@张', 4)
      const result = insertMention('你好@张', ctx, members[0])
      expect(result.text).toBe('你好@张三 ')
      expect(result.caret).toBe(6)
    })

    it('should handle prefix at text start', () => {
      const ctx = getMentionContext('@张', 2)
      const result = insertMention('@张', ctx, members[2])
      expect(result.text).toBe('@李四 ')
      expect(result.caret).toBe(4)
    })

    it('should handle custom prefix', () => {
      const ctx = getMentionContext('你好#张', 4, '#')
      expect(ctx.active).toBe(true)
      const result = insertMention('你好#张', ctx, members[0], '#')
      expect(result.text).toBe('你好#张三 ')
    })

    it('should return text unchanged for inactive context', () => {
      const result = insertMention('你好', { active: false, prefixIndex: -1, searchText: '', end: -1 }, members[0])
      expect(result.text).toBe('你好')
      expect(result.caret).toBe(2)
    })
  })

  describe('getMentions', () => {
    it('should extract completed mentions', () => {
      expect(getMentions('@张三 你好 @李四')).toEqual(['张三', '李四'])
    })

    it('should ignore pseudo prefixes', () => {
      expect(getMentions('a@b @张三')).toEqual(['张三'])
    })

    it('should handle custom prefix', () => {
      expect(getMentions('#张三 #李四', '#')).toEqual(['张三', '李四'])
    })

    it('should return empty array for text without mention', () => {
      expect(getMentions('你好世界')).toEqual([])
      expect(getMentions('')).toEqual([])
    })
  })

  describe('filterMentionOptions', () => {
    it('should filter by label inclusion, case-insensitive', () => {
      expect(filterMentionOptions(members, '张').map((o) => o.label)).toEqual(['张三', '张无忌'])
      const latin: LhMentionOption[] = [{ label: 'Alice' }, { label: 'bob' }]
      expect(filterMentionOptions(latin, 'AL').map((o) => o.label)).toEqual(['Alice'])
    })

    it('should return all options for empty search', () => {
      expect(filterMentionOptions(members, '')).toHaveLength(3)
    })

    it('should return empty array for no match', () => {
      expect(filterMentionOptions(members, '王')).toEqual([])
    })
  })

  describe('aria builders', () => {
    it('should build combobox trigger aria', () => {
      const aria = getMentionsTriggerAria({ visible: true, listboxId: 'lb', highlightedIndex: 1 })
      expect(aria.role).toBe('combobox')
      expect(aria['aria-expanded']).toBe(true)
      expect(aria['aria-controls']).toBe('lb')
      expect(aria['aria-haspopup']).toBe('listbox')
      expect(aria['aria-activedescendant']).toBe('lb-option-1')
      const closed = getMentionsTriggerAria({ visible: false, listboxId: 'lb', highlightedIndex: -1 })
      expect(closed['aria-expanded']).toBe(false)
      expect(closed['aria-activedescendant']).toBeUndefined()
    })

    it('should build listbox and option aria', () => {
      expect(getMentionsListboxAria('lb')).toEqual({ role: 'listbox', id: 'lb' })
      expect(getMentionsListboxAria()).toEqual({ role: 'listbox' })
      expect(getMentionOptionAria({ listboxId: 'lb', index: 0, highlighted: true, disabled: false })).toEqual(
        { role: 'option', 'aria-selected': true },
      )
      expect(
        getMentionOptionAria({ listboxId: 'lb', index: 0, highlighted: false, disabled: true }),
      ).toEqual({ role: 'option', 'aria-selected': false, 'aria-disabled': true })
    })
  })
})
