/**
 * CSS 变量名约定
 *
 * 主题变量统一以 `--lh-` 为前缀，由 ConfigProvider 或组件根部挂到 style 上。
 * 前缀逻辑必须幂等：`getThemeVars()` 等预设来源返回的键已带 `--lh-` 前缀，
 * 若再补一次会得到 `--lh---lh-primary-color` 这类无效变量，主题切换静默失效。
 */

const LH_VAR_PREFIX = '--lh-'

/**
 * 生成 CSS 变量名：已带 `--lh-` 前缀的原样返回，否则补前缀。
 */
export function toCssVarName(key: string): string {
  return key.startsWith(LH_VAR_PREFIX) ? key : `${LH_VAR_PREFIX}${key}`
}

/**
 * 把 themeVars 形式的键值对转为可直接绑定到 :style 的 CSS 变量对象。
 */
export function cssVars(vars: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(vars)) {
    result[toCssVarName(key)] = value
  }
  return result
}

/**
 * 去掉 `--lh-` 前缀，把 CSS 变量名还原为 themeVars prop 约定的键。
 * 用于把预设主题 vars 转成 ConfigProvider 兼容的 themeVars。
 */
export function stripCssVarName(key: string): string {
  return key.startsWith(LH_VAR_PREFIX) ? key.slice(LH_VAR_PREFIX.length) : key
}
