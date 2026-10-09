import type { LhComponentLanguage, LhComponentSize } from '../shared/types'
import type { ThemePresetName } from '../../theme/types'

/**
 * 默认主题预设名：青花瓷。
 * 与 styles/theme/common/variables.scss 的默认主色（$lh-primary）同源，
 * theme.spec.ts 有回归守护；UI 层据此调 getThemeVars + buildPresetStyleText 注入。
 */
export const DEFAULT_THEME = 'cerblue' satisfies ThemePresetName

export interface LhConfigState {
  size: LhComponentSize | undefined
  zIndex: number
  locale: LhComponentLanguage
  /** 主题预设名（registerTheme 注册的自定义名同样合法） */
  theme: ThemePresetName
}

export function createDefaultConfig(): LhConfigState {
  return {
    size: undefined,
    zIndex: 2000,
    locale: 'zh-CN',
    theme: DEFAULT_THEME,
  }
}
