import zh_CN from './lang/zh-CN'
import en_US from './lang/en-US'
// 以下为预留语言骨架（当前以英文作为兜底翻译）
// 导入即可在 lhlocale.setLocale() 中切换
import ja_JP from './lang/ja-JP'
import ko_KR from './lang/ko-KR'
import de_DE from './lang/de-DE'
import fr_FR from './lang/fr-FR'
import type { Leaves, LhLocaleMessages, LhLocaleType } from '../types/locale'
import { LH_LANGUAGE_DEFAULT } from '../constants'

export type { Leaves, LhLocaleMessageValue, LhLocaleMessages, LhLocaleType, LocaleOptions } from '../types/locale'

/**
 * 语言包内所有文案键的字面量路径联合类型（如 `'input.placeholder'`）
 *
 * 由 zh-CN 的 `as const` 结构推导，用于 `lhlocale.t()` 的键自动补全与拼写校验。
 */
export type LocalePath = Leaves<typeof zh_CN>

/**
 * `t()` 的调用签名：字面量键走精确重载（自动补全），动态路径走宽松重载
 *
 * 宽松重载保留 `const t = lhlocale.t` 解构、拼路径、未知键兜底测试等场景；
 * 两个重载的返回值一致，运行时行为完全相同。
 */
export type LhTranslate = {
  (path: LocalePath, fallback?: string): string
  (path: string, fallback?: string): string
}

/** 语言变更监听器：接收自增后的版本号 */
export type LhLocaleListener = (version: number) => void

/**
 * 内置语言包注册表
 *
 * 添加新语言步骤：
 * 1. 在 src/locales/lang/ 创建语言文件
 * 2. 在此处 import 并注册
 * 3. 在 src/constants/index.ts 中添加语言常量
 */
const locales: Record<string, LhLocaleMessages> = {
  [LH_LANGUAGE_DEFAULT]: zh_CN,
  'en-US': en_US,
  // 预留语言（已注册，可直接切换但翻译为英文兜底）
  'ja-JP': ja_JP,
  'ko-KR': ko_KR,
  'de-DE': de_DE,
  'fr-FR': fr_FR,
}

/**
 * 国际化模块（框架无关：纯事件发射器）
 *
 * 本类是 share 层的唯一 locale 实现，不携带任何框架响应式；
 * 各 UI 库的适配层负责把 version 转成各自框架的重渲染信号：
 * - vue2 / vue3 / uniapp：`ref(lhlocale.version)` + `lhlocale.subscribe(v => version.value = v)`
 * - react：`useSyncExternalStore(lhlocale.subscribe, () => lhlocale.version)`
 *
 * 使用方式：
 * ```ts
 * import { lhlocale, zhCN, enUS } from '@lh-ui/share/locales'
 * lhlocale.use({ locale: 'en-US', messages: enUS })
 * lhlocale.t('input.placeholder')
 * ```
 */
class LhLocale {
  private current: LhLocaleType = LH_LANGUAGE_DEFAULT
  private messages: LhLocaleMessages = locales[LH_LANGUAGE_DEFAULT]
  private listeners = new Set<LhLocaleListener>()
  private _version = 0

  /** 版本号：任何语言变更都会自增（UI 适配层订阅它触发重渲染） */
  get version(): number {
    return this._version
  }

  /** 订阅语言变更；返回取消订阅函数 */
  subscribe(listener: LhLocaleListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /** 版本自增并广播（注册/切换语言都会触发，语义与 plus 的 version.value++ 一致） */
  private bump(): void {
    this._version += 1
    for (const listener of this.listeners) {
      listener(this._version)
    }
  }

  /**
   * 设置语言
   */
  use(options: { locale: LhLocaleType; messages: LhLocaleMessages }): void {
    this.current = options.locale
    this.messages = options.messages
    locales[options.locale] = options.messages
    this.bump()
  }

  /**
   * 根据路径获取翻译文案
   * @param path 点号分隔的路径，如 'input.placeholder'（字面量键有自动补全）
   * @param fallback 未找到翻译时的兜底值
   *
   * 箭头函数属性：允许 `const t = lhlocale.t` 解构使用而不丢失 this。
   * 类型由 LhTranslate 重载提供：字面量键精确匹配，动态路径走宽松重载。
   */
  t: LhTranslate = (path: string, fallback?: string): string => {
    const keys = path.split('.')
    let result: unknown = this.messages

    for (const key of keys) {
      if (!result || typeof result !== 'object') {
        return fallback || path
      }
      result = (result as Record<string, unknown>)[key]
    }
    return typeof result === 'string' ? result : fallback || path
  }

  /**
   * 获取当前语言
   */
  getLocale(): LhLocaleType {
    return this.current
  }

  /**
   * 设置当前语言（仅切换，不会加载新 messages）
   */
  setLocale(locale: LhLocaleType): void {
    this.current = locale
    const msgs = locales[locale]
    if (msgs) {
      this.messages = msgs
    }
    this.bump()
  }

  /**
   * 添加自定义语言包
   */
  add(locale: string, messages: LhLocaleMessages): void {
    locales[locale] = messages
  }
}

export const lhlocale = new LhLocale()

// 默认中文语言包
export const zhCN: LhLocaleMessages = zh_CN

// 默认英文语言包
export const enUS: LhLocaleMessages = en_US
