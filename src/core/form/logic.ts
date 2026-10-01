import type { LhFormRule } from './types'

export function getFormFieldValue(model: Record<string, unknown>, prop: string): unknown {
  return prop.split('.').reduce<unknown>((value, key) => {
    if (value && typeof value === 'object') {
      return (value as Record<string, unknown>)[key]
    }
    return undefined
  }, model)
}

export function validateFormField(
  value: unknown,
  rules: LhFormRule[] = [],
  model: Record<string, unknown>,
  requiredMessage?: string,
): string | undefined {
  for (const rule of rules) {
    const isEmpty = value === undefined || value === null || value === ''
    if (rule.required && isEmpty) {
      return rule.message || requiredMessage
    }

    if (rule.validator) {
      const message = rule.validator(value, model)
      if (message) return message
    }
  }

  return undefined
}
