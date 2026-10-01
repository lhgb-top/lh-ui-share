/**
 * 组件尺寸
 */
import type { LH_SIZE_CONST } from '../../../constants'
import type { LH_LANGUAGE_CONST, LH_TYPES_CONST } from '../../../constants'
export type LhComponentSize = (typeof LH_SIZE_CONST)[keyof typeof LH_SIZE_CONST]
export type LhComponentLanguage = (typeof LH_LANGUAGE_CONST)[keyof typeof LH_LANGUAGE_CONST]

/**
 * 组件类型
 */
export type LhComponentType =
  (typeof LH_TYPES_CONST)[keyof typeof LH_TYPES_CONST] | 'default' | 'primary'

/**
 * 位置
 */
export type LhPosition =
  'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right' | 'left' | 'right'
