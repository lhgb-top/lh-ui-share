export interface LhFormRule {
  required?: boolean
  message?: string
  validator?: (value: unknown, model: Record<string, unknown>) => string | undefined
}

export interface LhFormState {
  model: Record<string, unknown>
  rules?: Record<string, LhFormRule[]>
}
