import type { LhComponentSize } from '../shared/types'

export interface LhSliderMark {
  label: string
  value: number
}

export interface LhSliderState {
  value: number | [number, number] | null
  min: number
  max: number
  step: number
  disabled: boolean
  range: boolean
  showInput: boolean
  size: LhComponentSize
  marks: Record<number, string> | undefined
}