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
import { deepMerge } from '../utils'
import { formatMessage } from '../core/shared/format'

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
 * 第二参数两种用法：
 * - 传 string：等价于原 fallback（未找到翻译时的兜底值）；
 * - 传对象：按 `{key}` 占位符插值（见 formatMessage），未找到翻译时回退 path 本身。
 */
export type LhTranslate = {
  (path: LocalePath, fallbackOrParams?: string | Record<string, unknown>): string
  (path: string, fallbackOrParams?: string | Record<string, unknown>): string
}

/** `tm()` 的调用签名：取数组文案（月份名 / 星期名等），t() 只返回字符串 */
export type LhTranslateArray = (path: string, fallback?: string[]) => string[]

/**
 * 文案模板插值：'{key}' 占位符替换为 params 中的值，未知占位符原样保留。
 *
 * 实现已下沉到 core/shared/format（共享内核），此处再导出保持
 * `@lh-ui/share/locales` 的导出面不变；rate / pagination 等 core 组件
 * 直接从 shared 引入，不再反向依赖 locales 的单例。
 */
export { formatMessage } from '../core/shared/format'

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
  /** 用户注册的语言包（use/add 写入），遮蔽内置注册表；内置包永不被覆写 */
  private userLocales = new Map<string, LhLocaleMessages>()
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
      try {
        listener(this._version)
      } catch (error) {
        // 隔离坏订阅者：一个监听器抛错不能让后续监听器收不到变更
        if (typeof console !== 'undefined') {
          console.error('[lhlocale] listener error:', error)
        }
      }
    }
  }

  /** 解析语言包：用户注册优先于内置注册表 */
  private resolve(locale: string): LhLocaleMessages | undefined {
    return this.userLocales.get(locale) ?? locales[locale]
  }

  /**
   * 注册并切换语言
   *
   * messages 只登记进用户注册表，不再覆写内置注册表
   * （此前 `locales[locale] = messages` 会永久销毁 'zh-CN' 等内置语言包）。
   */
  use(options: { locale: LhLocaleType; messages: LhLocaleMessages }): void {
    this.userLocales.set(options.locale, options.messages)
    this.current = options.locale
    this.messages = options.messages
    this.bump()
  }

  /**
   * 根据路径获取翻译文案
   * @param path 点号分隔的路径，如 'input.placeholder'（字面量键有自动补全）
   * @param fallbackOrParams string 兜底值，或 `{key}` 插值参数（见 formatMessage）
   *
   * 箭头函数属性：允许 `const t = lhlocale.t` 解构使用而不丢失 this。
   * 类型由 LhTranslate 重载提供：字面量键精确匹配，动态路径走宽松重载。
   */
  t: LhTranslate = (path: string, fallbackOrParams?): string => {
    const keys = path.split('.')
    let result: unknown = this.messages

    for (const key of keys) {
      if (!result || typeof result !== 'object') {
        result = undefined
        break
      }
      result = (result as Record<string, unknown>)[key]
    }

    const text =
      typeof result === 'string'
        ? result
        : typeof fallbackOrParams === 'string'
          ? fallbackOrParams
          : path
    const params =
      fallbackOrParams && typeof fallbackOrParams === 'object' ? fallbackOrParams : undefined
    return params ? formatMessage(text, params) : text
  }

  /**
   * 根据路径获取数组文案（如 `datepicker.months`、`datepicker.weeks`）
   *
   * t() 只返回字符串，数组叶子经此访问；未命中或非数组返回 fallback（缺省 []）。
   */
  tm: LhTranslateArray = (path: string, fallback?: string[]): string[] => {
    const keys = path.split('.')
    let result: unknown = this.messages

    for (const key of keys) {
      if (!result || typeof result !== 'object') {
        return fallback ?? []
      }
      result = (result as Record<string, unknown>)[key]
    }

    return Array.isArray(result) ? result.map((item) => String(item)) : (fallback ?? [])
  }

  /**
   * 获取当前语言
   */
  getLocale(): LhLocaleType {
    return this.current
  }

  /**
   * 设置当前语言（仅切换，不会加载新 messages）
   *
   * 未注册的语言回退默认语言包内容：getLocale() 报告请求的语言，
   * t() 不再拿旧语言的文案，二者不脱节。
   */
  setLocale(locale: LhLocaleType): void {
    this.current = locale
    this.messages = this.resolve(locale) ?? locales[LH_LANGUAGE_DEFAULT]
    this.bump()
  }

  /**
   * 添加自定义语言包：与该语言「当前生效的包」（用户注册包优先，其次内置包）
   * 深合并——部分文案覆盖、其余键保持可用，不再像旧实现那样整包替换。
   * 目标是当前语言时立即生效并广播版本。
   */
  add(locale: string, messages: LhLocaleMessages): void {
    const base = this.userLocales.get(locale) ?? locales[locale] ?? {}
    const merged = deepMerge({}, base, messages) as LhLocaleMessages
    this.userLocales.set(locale, merged)
    if (locale === this.current) {
      this.messages = merged
      this.bump()
    }
  }
}

export const lhlocale = new LhLocale()

// 默认中文语言包
export const zhCN: LhLocaleMessages = zh_CN

// 默认英文语言包
export const enUS: LhLocaleMessages = en_US
