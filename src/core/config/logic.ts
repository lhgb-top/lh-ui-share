/**
 * ConfigProvider 纯函数逻辑
 */
import type { LhComponentSize } from '../shared/types'
import type { LhConfigState } from './types'
import { createDefaultConfig } from './types'

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
