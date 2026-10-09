/** 主题预设名称枚举 */
export type ThemePresetName =
  | 'cerblue'    // 青花瓷（靛蓝）
  | 'songhua'    // 松花绿（竹影青翠）
  | 'zhusha'     // 朱砂（印泥朱红）
  | 'shuimo'     // 水墨黑白
  | 'golden'     // 藤黄（秋叶金黄）
  // `string & {}` 保持字面量的自动补全，同时开放任意自定义名称（配合 registerTheme 注册）；
  // 未注册的名称在 getThemePreset / getThemeVars 中返回 undefined
  | (string & {})

/** 主题预设配置接口 */
export interface ThemePreset {
  name: ThemePresetName
  /** 主题中文名称 */
  label: string
  /** 主题英文名称 */
  labelEn: string
  /** 主题描述 */
  description: string
  /** CSS 变量映射 */
  vars: Record<string, string>
}

/** 主题变量类型 */
export type ThemeVars = Record<string, string>
