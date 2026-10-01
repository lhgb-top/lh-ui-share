import type {
  LhComponentLanguage,
  LhComponentSize,
  LhComponentType,
} from '../../core/shared/types'

export type LhTypes<T extends string | undefined = undefined> = T extends string
  ? LhComponentType | T
  : LhComponentType
export type LhSizes<T extends string | undefined = undefined> = T extends string
  ? LhComponentSize | T
  : LhComponentSize
export type LhLanguages<T extends string | undefined = undefined> = T extends string
  ? LhComponentLanguage | T
  : LhComponentLanguage

export interface LhBaseProps<
  T extends string | undefined = undefined,
  S extends string | undefined = undefined,
  L extends string | undefined = undefined,
> {
  type?: T extends string ? LhTypes<T> : LhTypes
  size?: S extends string ? LhSizes<S> : LhSizes
  disabled?: boolean
  loading?: boolean
  plain?: boolean
  block?: boolean
  icon?: string
  nativeType?: string
  href?: string
  target?: string
  title?: string
  alt?: string
  lang?: L extends string ? LhLanguages<L> : LhLanguages
  langPath?: string
  // 老年人专用
  old?: boolean
}
