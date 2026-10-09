/**
 * 文案模板插值（共享内核）
 *
 * 纯字符串工具，零依赖、零副作用。从 locales 层下沉到共享内核，
 * 使 core 组件（rate 的 {n} 星数、pagination 的 {total} 页数）不再反向依赖
 * locales 的单例（导入即 new LhLocale() 的模块级副作用）。
 * locales 层从此模块引入同一实现，保持单一真相源。
 */

/**
 * '{key}' 占位符替换为 params 中的值，未知占位符原样保留。
 */
export function formatMessage(template: string, params: Record<string, unknown> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  )
}
