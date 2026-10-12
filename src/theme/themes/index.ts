import type { LhThemePreset, LhThemePresetName, LhThemeVars } from '../types'

/** 青花瓷主题配置 */
const LhCerblue: LhThemePreset = {
  name: 'cerblue',
  label: '青花瓷',
  labelEn: 'Ceramic Blue',
  description: '青花瓷釉下彩，清雅素净',
  vars: {
    '--lh-primary-color': '#2B4C7C',
    '--lh-primary-color-hover': '#3D649E',
    '--lh-primary-color-active': '#1F3A5F',
    '--lh-primary-color-bg': '#E8EDF3',
    '--lh-primary-color-border': '#D4DCE8',
  },
}

/** 松花绿主题配置 */
const LhSonghua: LhThemePreset = {
  name: 'songhua',
  label: '松花绿',
  labelEn: 'Pine Green',
  description: '竹林修竹，生机勃勃',
  vars: {
    '--lh-primary-color': '#5B8C5A',
    '--lh-primary-color-hover': '#7BB079',
    // 按压底色：与主色同明度、更饱和的深松绿，墨字对比 4.75:1（原 #4B7A4A 仅 3.70:1）
    '--lh-primary-color-active': '#4F8F4C',
    '--lh-primary-color-bg': '#E8F5E8',
    '--lh-primary-color-border': '#D0E8CF',
    // 松花属浅主色，白字对比度仅 3.93:1，改用墨字（4.73:1）
    '--lh-color-on-primary': '#101410',
    // active 色在悬停底上作选中文字仅 3.48:1，选中态单独加深（按钮 active 底色不受影响）
    '--lh-selected-color': '#456F44',
  },
}

/** 朱砂主题配置 */
const LhZhusha: LhThemePreset = {
  name: 'zhusha',
  label: '朱砂',
  labelEn: 'Vermilion',
  description: '传统印章朱砂红，喜庆庄重',
  vars: {
    '--lh-primary-color': '#B23A3A',
    '--lh-primary-color-hover': '#C45050',
    '--lh-primary-color-active': '#9A3030',
    '--lh-primary-color-bg': '#FDF0F0',
    '--lh-primary-color-border': '#F0D8D8',
  },
}

/** 水墨黑白主题配置 */
const LhShuimo: LhThemePreset = {
  name: 'shuimo',
  label: '水墨',
  labelEn: 'Ink Wash',
  description: '水墨丹青，素雅极简',
  vars: {
    '--lh-primary-color': '#2C2C2C',
    '--lh-primary-color-hover': '#5A5A5A',
    '--lh-primary-color-active': '#1A1A1A',
    '--lh-primary-color-bg': '#F5F5F5',
    '--lh-primary-color-border': '#E0E0E0',
  },
}

/** 藤黄主题配置 */
const LhGolden: LhThemePreset = {
  name: 'golden',
  label: '藤黄',
  labelEn: 'Golden Autumn',
  description: '深秋枫黄，温暖金黄',
  vars: {
    '--lh-primary-color': '#B8860B',
    '--lh-primary-color-hover': '#D4A843',
    // 按压底色：墨字对比 4.70:1（原 #9A7208 仅 3.94:1；选中文字已由 --lh-selected-color 承担）
    '--lh-primary-color-active': '#A87F0A',
    '--lh-primary-color-bg': '#FBF6EA',
    '--lh-primary-color-border': '#F0E8D0',
    // 藤黄属浅主色，白字对比度仅 3.25:1，改用墨字（5.31:1）
    '--lh-color-on-primary': '#1E1A16',
    // active 色在白底/页面上作选中文字仅 3.41:1，加深至 #82600A（悬停底 5.37:1）
    '--lh-selected-color': '#82600A',
  },
}

/** 所有预设主题列表 */
export const LH_THEME_PRESETS: LhThemePreset[] = [LhCerblue, LhSonghua, LhZhusha, LhShuimo, LhGolden]

/**
 * 注册（或覆盖）一个主题预设，供 getThemePreset / getThemeVars 按名取用。
 *
 * 同名覆盖：传入已有 name 时替换该预设（内置预设也可被覆盖）。
 * 注意：vars 里的 CSS 变量只服务 JS 运行时消费（如 ConfigProvider 注入 style）；
 * 组件 SCSS 用到的令牌仍在 styles/theme/common/variables.scss——
 * 覆盖内置主题的 primary 色值时两边需同步修改（theme.spec 有一致性回归）。
 */
export function registerTheme(preset: LhThemePreset): void {
  const index = LH_THEME_PRESETS.findIndex((t) => t.name === preset.name)
  if (index >= 0) LH_THEME_PRESETS[index] = preset
  else LH_THEME_PRESETS.push(preset)
}

/** 根据名称获取主题配置（未注册名称返回 undefined） */
export function getThemePreset(name: LhThemePresetName): LhThemePreset | undefined {
  return LH_THEME_PRESETS.find((t) => t.name === name)
}

/** 根据名称获取主题 CSS 变量（未注册名称返回 undefined） */
export function getThemeVars(name: LhThemePresetName): LhThemeVars | undefined {
  return getThemePreset(name)?.vars
}

export { LhCerblue, LhSonghua, LhZhusha, LhShuimo, LhGolden }

/** 预设主题样式的注入元素 id（供 UI 层按 id 查找并替换 <style>） */
export const LH_PRESET_THEME_STYLE_ID = 'lh-preset-theme'

/**
 * 暗色页面底色（与 `styles/theme/common/var-dark.scss` 的 `--lh-bg-color-page` 同源）。
 * 预设主色若在这个底上糊成一团，就需要在暗色块里提亮。
 */
const DARK_PAGE_BG = '#1A1A2E'

/** 主色与暗色页面底的对比度低于此值时判定为「深主色」，需在暗色下提亮 */
const DARK_PRIMARY_CONTRAST_THRESHOLD = 3

/** 提亮后的主色底上改用墨字，保证按钮文字对比度（与 songhua/golden 的 on-primary 同口径） */
const INK_ON_LIGHTENED_PRIMARY = '#101410'

/** 通道值转 WCAG 相对亮度所需的线性化（sRGB 传递函数） */
function linearizeChannel(value: number): number {
  const normalized = value / 255
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
}

/**
 * 计算 `#RRGGBB` 的 WCAG 相对亮度。非 hex 输入（如含 `var()` 的动态值）返回
 * undefined，调用方按「无法判定」处理。
 */
export function getRelativeLuminance(color: string | undefined): number | undefined {
  if (!color) return undefined
  const match = /^#([0-9a-f]{6})$/i.exec(color.trim())
  if (!match) return undefined
  const hex = match[1]
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return (
    0.2126 * linearizeChannel(r) + 0.7152 * linearizeChannel(g) + 0.0722 * linearizeChannel(b)
  )
}

/** 两色的 WCAG 对比度（1~21，恒 >= 1）；任一非 hex 返回 undefined */
export function getContrastRatio(a: string | undefined, b: string | undefined): number | undefined {
  const la = getRelativeLuminance(a)
  const lb = getRelativeLuminance(b)
  if (la === undefined || lb === undefined) return undefined
  const lighter = Math.max(la, lb)
  const darker = Math.min(la, lb)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * 由预设 vars 推导暗色块需要重定义的变量：
 * - `--lh-primary-color-bg` / `--lh-selected-color` 固定重定义，让预设主色在暗色模式下
 *   仍有足够的底色透明度与文字对比度（`var()` 引用会在应用元素上求值，天然跟随当前主色）。
 * - 深主色预设（相对暗色页面底对比度不足 3:1，如水墨 / 青花瓷 / 朱砂）额外提亮
 *   `--lh-primary-color`：直接 `color-mix(var(--lh-primary-color) …)` 会形成 CSS 自引用
 *   循环，所以把主色字面值代入。同时派生更亮的 hover 与稍暗的 active、并把主色底上的
 *   文字翻成墨字——提亮后白字对比度反而不足 3:1。
 *
 * 导出给 docs 的 ThemeStudio 预览区与导出文本共用，保证两处一致。
 */
export function buildPresetDarkVars(vars: Record<string, string>): Record<string, string> {
  const dark: Record<string, string> = {
    '--lh-primary-color-bg': 'color-mix(in srgb, var(--lh-primary-color) 25%, transparent)',
    '--lh-selected-color': 'color-mix(in srgb, var(--lh-primary-color) 40%, #fff)',
  }

  const primary = vars['--lh-primary-color']
  const contrast = getContrastRatio(primary, DARK_PAGE_BG)
  if (primary && contrast !== undefined && contrast < DARK_PRIMARY_CONTRAST_THRESHOLD) {
    dark['--lh-primary-color'] = `color-mix(in srgb, ${primary} 55%, #fff)`
    dark['--lh-primary-color-hover'] = 'color-mix(in srgb, var(--lh-primary-color) 70%, #fff)'
    dark['--lh-primary-color-active'] = 'color-mix(in srgb, var(--lh-primary-color) 85%, #000)'
    dark['--lh-color-on-primary'] = INK_ON_LIGHTENED_PRIMARY
  }

  return dark
}

/**
 * 把预设 vars 拼成一段可注入的样式文本：
 * - `:root` 块放预设声明的全部变量（基础五个 `--lh-primary-*`，浅主色预设额外的
 *   `--lh-color-on-primary` / `--lh-selected-color`）；
 * - 暗色块由 {@link buildPresetDarkVars} 推导：重定义底色/选中色，并为深主色预设提亮主色
 *   （水墨这类近黑主色在暗色页面上原本与背景融为一体，按钮不可见）。
 *   该暗色块在注入文本中位于 `:root` 块之后，同特异性下后者胜，
 *   故浅主色预设在 `:root` 里声明的 `--lh-selected-color` 明色值不会泄漏进暗色。
 *
 * 只能写 `<style>` 元素（特异性 0,1,0），**不能**写 `documentElement` 的内联
 * style（特异性 1,0,0,0）——内联优先级高于一切样式表，会压过
 * `var-dark.scss` 的整段暗色变量，导致暗色模式下配色失真。
 */
export function buildPresetStyleText(vars: Record<string, string>): string {
  const rootLines = Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n')
  const darkLines = Object.entries(buildPresetDarkVars(vars))
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n')
  return `:root {
${rootLines}
}

[data-theme='dark'],
.dark {
${darkLines}
}`
}
