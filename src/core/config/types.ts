import type { LhComponentLanguage, LhComponentSize } from '../shared/types'

export interface LhConfigState {
  size: LhComponentSize | undefined
  zIndex: number
  locale: LhComponentLanguage
}

export function createDefaultConfig(): LhConfigState {
  return {
    size: undefined,
    zIndex: 2000,
    locale: 'zh-CN',
  }
}
