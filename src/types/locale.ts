import { LH_LANGUAGE_CONST } from './components'

export type LhLocaleType = (typeof LH_LANGUAGE_CONST)[keyof typeof LH_LANGUAGE_CONST]
export type LhLocaleMessageValue =
  | string
  | readonly LhLocaleMessageValue[]
  | {
      readonly [key: string]: LhLocaleMessageValue
    }
export type LhLocaleMessages = Record<string, LhLocaleMessageValue>

/**
 * 从语言包结构推导所有「字符串叶子」的点号路径联合类型
 *
 * 递归遍历对象：字符串叶子取其完整路径（如 `'input.placeholder'`）；
 * 数组键（如 `datepicker.months`）返回 `never` —— 数组不按键寻址，
 * `t()` 的点号路径无法命中它们。
 *
 * 用法：`type LhLocalePath = LhLeaves<typeof zhCN>`，给 `lhlocale.t()` 提供字面量键
 * 自动补全。动态拼路径的场景走 `t()` 的宽松重载，不被此类型约束。
 */
export type LhLeaves<T, Prefix extends string = ''> = T extends readonly unknown[]
  ? never
  : T extends string
    ? Prefix extends ''
      ? never
      : Prefix
    : T extends object
      ? {
          [K in keyof T]: LhLeaves<
            T[K],
            Prefix extends '' ? K & string : `${Prefix}.${K & string}`
          >
        }[keyof T]
      : never

export interface LhLocaleOptions {
  locale: LhLocaleType
  messages: LhLocaleMessages
}
