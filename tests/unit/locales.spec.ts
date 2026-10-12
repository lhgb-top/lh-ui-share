import { describe, it, expect } from 'vitest'
import { lhlocale, zhCN } from '../../src/locales'
import { LH_LANGUAGE_CONST } from '../../src/constants'

describe('lhlocale', () => {
  // 语言常量与 registry 必须一致：常量里开放的语言，share 都已注册了骨架包
  it('exposes six locales matching the language constant', () => {
    expect(LH_LANGUAGE_CONST).toEqual({
      zhCN: 'zh-CN',
      enUS: 'en-US',
      jaJP: 'ja-JP',
      koKR: 'ko-KR',
      deDE: 'de-DE',
      frFR: 'fr-FR',
    })
    for (const code of Object.values(LH_LANGUAGE_CONST)) {
      expect(() => lhlocale.setLocale(code)).not.toThrow()
    }
    // 还原默认语言，避免影响后续用例
    lhlocale.setLocale(LH_LANGUAGE_CONST.zhCN)
  })
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

  it('formats the calendar panel title per locale', () => {
    // 月名由调用方从 month1~12 取好再代入，模板只决定顺序与连接符
    expect(lhlocale.t('datepicker.panelTitle')).toBe('{year}年{month}')
    expect(
      lhlocale.t('datepicker.panelTitle', { year: 2026, month: lhlocale.t('datepicker.month10') }),
    ).toBe('2026年10月')
    lhlocale.setLocale('en-US')
    expect(lhlocale.t('datepicker.panelTitle')).toBe('{month} {year}')
    expect(
      lhlocale.t('datepicker.panelTitle', { year: 2026, month: lhlocale.t('datepicker.month10') }),
    ).toBe('Oct 2026')
    lhlocale.setLocale('zh-CN')
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

describe('lhlocale 健壮化与扩展（round 2）', () => {
  // 注意：lhlocale 是单例，本块内用例按「只读 → 变更」排序，避免互相污染
  it('isolates throwing listeners so later subscribers still get notified', () => {
    const seen: number[] = []
    const unsubscribe1 = lhlocale.subscribe(() => {
      throw new Error('坏订阅者')
    })
    const unsubscribe2 = lhlocale.subscribe((v) => seen.push(v))
    expect(() => lhlocale.setLocale('zh-CN')).not.toThrow()
    expect(seen).toHaveLength(1)
    unsubscribe1()
    unsubscribe2()
  })

  it('setLocale falls back to default messages for unregistered locales', () => {
    lhlocale.setLocale('zh-CN')
    // JS 侧可绕过类型传入未注册语言：getLocale 报告请求值，文案回退默认包
    lhlocale.setLocale('xx-XX' as never)
    expect(lhlocale.getLocale()).toBe('xx-XX')
    expect(lhlocale.t('cascader.noMatch')).toBe('无匹配数据')
    lhlocale.setLocale('zh-CN')
  })

  it('t() interpolates {key} placeholders when params are given', () => {
    expect(lhlocale.t('pagination.total', { total: 12 })).toBe('共 12 条')
    // 未知占位符原样保留
    expect(lhlocale.t('pagination.total', {})).toBe('共 {total} 条')
    // string 第二参仍是 fallback 语义
    expect(lhlocale.t('not.a.key', '兜底')).toBe('兜底')
  })

  it('tm() reads array leaves like month names', () => {
    const months = lhlocale.tm('datepicker.months')
    expect(months.length).toBe(12)
    // 未命中路径返回 fallback / 空数组
    expect(lhlocale.tm('not.an.array', ['一'])).toEqual(['一'])
    expect(lhlocale.tm('not.an.array')).toEqual([])
  })

  it('add() deep-merges over the effective pack instead of replacing it', () => {
    lhlocale.setLocale('zh-CN')
    const before = lhlocale.version
    lhlocale.add('zh-CN', { cascader: { noMatch: '没有匹配项' } } as never)
    expect(lhlocale.version).toBeGreaterThan(before)
    expect(lhlocale.t('cascader.noMatch')).toBe('没有匹配项')
    // 回归：旧实现整包替换，未覆盖的键会丢失；现在其余键仍可读
    expect(lhlocale.t('input.placeholder')).toBe('请输入')
    // 非当前语言不广播
    const v2 = lhlocale.version
    lhlocale.add('de-DE', { cascader: { noMatch: 'de fallback' } } as never)
    expect(lhlocale.version).toBe(v2)
  })

  it('use() shadows the locale without destroying the built-in registry', () => {
    // use() 传入的包应尽量完整（整包语义）；这里只验证遮蔽与内置包安全
    const partial = { cascader: { noMatch: '自定义命中提示' } } as never
    lhlocale.use({ locale: 'zh-CN', messages: partial })
    expect(lhlocale.t('cascader.noMatch')).toBe('自定义命中提示')
    lhlocale.setLocale('en-US')
    expect(lhlocale.t('cascader.noMatch')).toBe('No matching data')
    // 切回后用户包仍然遮蔽（文档化语义：use 注册的用户包优先于内置包）
    lhlocale.setLocale('zh-CN')
    expect(lhlocale.t('cascader.noMatch')).toBe('自定义命中提示')
  })
})
