/**
 * ConfigProvider 纯函数逻辑
 */
import type { LhComponentSize } from '../shared/types'
import type { LhThemePresetName } from '../../theme/types'
import type { LhConfigState } from './types'
import { createDefaultConfig, LH_THEME_DEFAULT } from './types'

/**
 * 合并配置（局部 > 全局 > 默认）
 */
export function mergeConfig(
  defaults: Partial<LhConfigState>,
  global: Partial<LhConfigState>,
  local: Partial<LhConfigState>,
): LhConfigState {
  return {
    ...createDefaultConfig(),
    ...defaults,
    ...global,
    ...local,
  }
}

/**
 * 获取有效尺寸
 */
export function getEffectiveSize(
  localSize: LhComponentSize | undefined,
  globalSize: LhComponentSize | undefined,
): LhComponentSize | undefined {
  return localSize || globalSize
}

/**
 * 获取有效 zIndex
 */
export function getEffectiveZIndex(localZIndex: number | undefined, globalZIndex: number): number {
  return localZIndex ?? globalZIndex
}

/**
 * 获取有效主题预设名（局部 > 全局 > 默认青花瓷）。
 *
 * 只返回预设名——vars 的取值与 <style> 注入由 UI 层调
 * getThemeVars(name) + buildPresetStyleText(vars) 完成，core 不碰 DOM。
 */
export function getEffectiveTheme(
  localTheme: LhThemePresetName | undefined,
  globalTheme: LhThemePresetName | undefined,
): LhThemePresetName {
  return localTheme || globalTheme || LH_THEME_DEFAULT
}
