import type {
  LhSegmentedInput,
  LhSegmentedNormalized,
  LhSegmentedState,
  LhSegmentedValue,
} from './types'

/** 规范化选项：字符串快捷写法 → { label, value } */
export function normalizeSegmentedOptions(options: LhSegmentedInput[]): LhSegmentedNormalized[] {
  return options.map((option) => {
    if (typeof option === 'object' && option !== null) {
      return { label: option.label, value: option.value, disabled: !!option.disabled }
    }
    return { label: String(option), value: option as LhSegmentedValue, disabled: false }
  })
}

/** 全组禁用时整组不可交互 */
export function isSegmentedDisabled(options: LhSegmentedNormalized[], disabled?: boolean): boolean {
  if (disabled) return true
  return options.length > 0 && options.every((option) => option.disabled)
}

/** 类名 */
export function getSegmentedClassNames(state: LhSegmentedState): string[] {
  const classes = ['lh-segmented']
  if (state.disabled) classes.push('lh-segmented--disabled')
  if (state.block) classes.push('lh-segmented--block')
  return classes
}

/**
 * roving tabindex 方向键移动：返回下一个**启用**选项的下标（无可用项返回当前）。
 * 首尾循环，禁用项跳过。
 */
export function moveSegmentedIndex(
  options: LhSegmentedNormalized[],
  current: number,
  direction: 1 | -1,
): number {
  if (options.length === 0) return current
  const step = direction
  for (let i = 1; i <= options.length; i++) {
    const next = (current + step * i + options.length * Math.abs(i)) % options.length
    if (!options[next].disabled) return next
  }
  return current
}
