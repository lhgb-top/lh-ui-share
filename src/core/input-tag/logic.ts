import { sanitizeNumber } from '../shared/sanitize'
import type { LhInputTagInsertResult, LhInputTagState, LhInputTagTrigger } from './types'

/** 合法触发键集 */
export const LH_INPUT_TAG_TRIGGER_CONST: readonly LhInputTagTrigger[] = ['enter', 'space', 'comma']

/** 触发键合法性守卫 */
export function isValidInputTagTrigger(trigger: string): trigger is LhInputTagTrigger {
  return (LH_INPUT_TAG_TRIGGER_CONST as readonly string[]).includes(trigger)
}

/** 容器类名 */
export function getInputTagClassNames(state: LhInputTagState): string[] {
  const classes = ['lh-input-tag']
  if (state.disabled) classes.push('lh-input-tag--disabled')
  if (state.readonly) classes.push('lh-input-tag--readonly')
  return classes
}

/**
 * 判定键盘事件是否触发提交。
 * enter → Enter；space → ' ' 或历史键值 'Spacebar'；comma → ','
 */
export function isInputTagTriggerKey(
  key: string,
  trigger: LhInputTagTrigger,
): boolean {
  if (trigger === 'enter') return key === 'Enter'
  if (trigger === 'space') return key === ' ' || key === 'Spacebar'
  return key === ','
}

/**
 * 提交一个标签。
 *
 * - 输入 trim 后为空 → 不变化（empty）
 * - 未开 allowDuplicate 且已存在 → 不变化（duplicate）
 * - max 为正数且达到上限 → 不变化（max）
 * - 其余返回尾部追加的新数组
 */
export function insertInputTag(
  tags: string[],
  input: string,
  state: LhInputTagState = {},
): LhInputTagInsertResult {
  const value = String(input).trim()
  if (!value) {
    return { tags, inserted: false, reason: 'empty' }
  }
  const max = sanitizeNumber(state.max, 0, { integer: true })
  if (max > 0 && tags.length >= max) {
    return { tags, inserted: false, reason: 'max' }
  }
  if (!state.allowDuplicate && tags.includes(value)) {
    return { tags, inserted: false, reason: 'duplicate' }
  }
  return { tags: [...tags, value], inserted: true }
}

/** 删除指定下标的标签（越界返回原数组） */
export function removeInputTag(tags: string[], index: number): string[] {
  if (index < 0 || index >= tags.length) return tags
  return [...tags.slice(0, index), ...tags.slice(index + 1)]
}

/** Backspace 语义：输入框为空时删除最后一个标签 */
export function removeLastInputTag(tags: string[]): string[] {
  return tags.length === 0 ? tags : tags.slice(0, -1)
}
