import type {
  LhSegmentedInput,
  LhSegmentedNormalized,
  LhSegmentedState,
  LhSegmentedValue,
} from './types'
import { getNextListIndex } from '../shared/keyboard'
import type { LhAriaAttrs } from '../shared/a11y'

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
 *
 * @deprecated 实现已收敛到 `core/shared/keyboard` 的 `getNextListIndex`，
 * 新代码请直接引入内核函数；本外壳保留供下游既有引用。
 */
export function moveSegmentedIndex(
  options: LhSegmentedNormalized[],
  current: number,
  direction: 1 | -1,
): number {
  if (options.length === 0) return current
  return getNextListIndex(options, current, direction)
}

/**
 * 分段控制器的无障碍属性包：role="radiogroup"
 *
 * @param disabled 全组禁用时输出 aria-disabled
 * @param label 可达名称（无可见 label 时提供）
 */
export function getSegmentedAria(options: { disabled?: boolean; label?: string } = {}): LhAriaAttrs {
  const { disabled, label } = options
  const attrs: LhAriaAttrs = { role: 'radiogroup' }
  if (disabled) attrs['aria-disabled'] = true
  if (label) attrs['aria-label'] = label
  return attrs
}

/**
 * 分段项的无障碍属性包：role="radio" + aria-checked（单选语义）
 */
export function getSegmentedItemAria(options: {
  selected: boolean
  disabled?: boolean
}): LhAriaAttrs {
  const { selected, disabled } = options
  const attrs: LhAriaAttrs = { role: 'radio', 'aria-checked': selected }
  if (disabled) attrs['aria-disabled'] = true
  return attrs
}
