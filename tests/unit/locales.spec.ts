import { describe, it, expect } from 'vitest'
import { lhlocale, zhCN } from '../../src/locales'

describe('lhlocale', () => {
  // 回归：`const t = lhlocale.t` 解构使用时不得丢失 this（Cascader 曾因此崩溃）
  it('t() works when detached from the instance', () => {
    const t = lhlocale.t
    expect(t('cascader.noMatch')).toBe('无匹配数据')
    expect(t('input.placeholder')).toBe('请输入')
  })

  it('falls back to path when translation is missing', () => {
    expect(lhlocale.t('not.a.key')).toBe('not.a.key')
    expect(lhlocale.t('not.a.key', '兜底')).toBe('兜底')
  })

  it('setLocale switches messages and t() reads the new pack', () => {
    lhlocale.setLocale('en-US')
    expect(lhlocale.t('cascader.noMatch')).toBe('No matching data')
    // 还原默认语言，避免影响其他用例
    lhlocale.setLocale('zh-CN')
    expect(lhlocale.t('cascader.noMatch')).toBe('无匹配数据')
  })

  it('use() registers a custom locale pack', () => {
    lhlocale.use({ locale: 'zh-CN', messages: zhCN })
    expect(lhlocale.t('cascader.placeholder')).toBe('请选择')
  })

  // share 版为纯事件发射器：version 为数字，变更时通知订阅者（各框架适配层负责转响应式）
  it('exposes version counter and notifies subscribers on change', () => {
    const before = lhlocale.version
    const seen: number[] = []
    const unsubscribe = lhlocale.subscribe((v) => seen.push(v))
    lhlocale.setLocale('zh-CN')
    expect(lhlocale.version).toBeGreaterThan(before)
    expect(seen).toHaveLength(1)
    unsubscribe()
    lhlocale.setLocale('zh-CN')
    expect(seen).toHaveLength(1) // 取消订阅后不再通知
  })
})
