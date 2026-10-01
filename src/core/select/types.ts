export interface LhSelectOption {
  label: string
  value: unknown
  disabled?: boolean
}

export interface LhSelectState {
  options: LhSelectOption[]
  highlightedIndex: number
}
