/**
 * @lh-ui/share —— lh-ui 家族唯一的框架无关共享层
 *
 * 优先使用子路径导入（分层与 tree-shaking 更清晰）：
 *   import { getSize } from '@lh-ui/share/core/button'
 *   import { sxToStyle } from '@lh-ui/share/core/shared/sx'
 *   import { LH_SIZE_CONST } from '@lh-ui/share/constants'
 *   import { lhlocale, zhCN, enUS } from '@lh-ui/share/locales'
 *   import { LH_THEME_PRESETS, getThemeVars } from '@lh-ui/share/theme'
 *   import { createNamespace } from '@lh-ui/share/utils'
 * 根入口仅作便捷聚合。
 */

export * from './core'
export * from './constants'
export * from './locales'
export * from './theme'
export * from './utils'
