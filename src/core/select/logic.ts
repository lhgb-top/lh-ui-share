import type { LhSelectOption } from './types'
import { getNextListIndex } from '../shared/keyboard'
import { getPopupTriggerAria } from '../shared/a11y'
import type { LhAriaAttrs } from '../shared/a11y'

export function findSelectOption(options: LhSelectOption[], value: unknown): LhSelectOption | undefined {
  return options.find((option) => Object.is(option.value, value))
}

/**
 * 下一个可用选项下标（方向键导航）
 *
 * @deprecated 实现已收敛到 `core/shared/keyboard` 的 `getNextListIndex`，
 * 新代码请直接引入内核函数；本外壳保留供下游既有引用。
 */
export function getNextEnabledIndex(
  options: LhSelectOption[],
  currentIndex: number,
  direction: 1 | -1,
): number {
  return getNextListIndex(options, currentIndex, direction)
}

/**
 * 选项元素 id：`{listboxId}-{index}`，供触发器的 aria-activedescendant 引用
 *
 * 确定性拼接（非随机 id）：高亮项变化时触发器只需更新 aria-activedescendant 的值，
 * 读屏软件即可播报新高亮项，无需重新挂载 DOM。
 */
export function getSelectOptionId(listboxId: string | undefined, index: number): string | undefined {
  // 负数 / 非整数下标（-1 = 无高亮）不产出 id，否则触发器会引用一个
  // 不存在的 DOM 元素，读屏软件播报找不到目标
  if (!listboxId || !Number.isInteger(index) || index < 0) return undefined
  return `${listboxId}-option-${index}`
}

/**
 * 触发器（combobox）的无障碍属性包：
 * role="combobox" + aria-expanded + aria-controls（列表盒）+ aria-activedescendant（高亮项）+ aria-haspopup="listbox"
 *
 * @param visible 列表盒是否展开
 * @param listboxId 列表盒元素 id
 * @param highlightedIndex 当前高亮项下标（-1 表示无高亮）
 */
export function getSelectTriggerAria(options: {
  visible: boolean
  listboxId?: string
  highlightedIndex: number
}): LhAriaAttrs {
  const { visible, listboxId, highlightedIndex } = options
  const attrs: LhAriaAttrs = {
    ...getPopupTriggerAria({ expanded: visible, popupId: listboxId, haspopup: 'listbox' }),
    role: 'combobox',
  }
  // 高亮项有效时把读屏焦点挂到选项上；无高亮时移除属性，避免引用失效 id
  const optionId = getSelectOptionId(listboxId, highlightedIndex)
  if (optionId) attrs['aria-activedescendant'] = optionId
  return attrs
}

/**
 * 列表盒的无障碍属性包：role="listbox"
 *
 * @param id 列表盒元素 id，与触发器的 aria-controls 对应
 */
export function getSelectListboxAria(id?: string): LhAriaAttrs {
  const attrs: LhAriaAttrs = { role: 'listbox' }
  if (id) attrs.id = id
  return attrs
}

/**
 * 选项的无障碍属性包：role="option" + aria-selected + aria-disabled
 *
 * @param listboxId 列表盒元素 id（拼接选项 id）
 * @param index 选项下标
 * @param selected 是否选中
 * @param disabled 是否禁用
 */
export function getSelectOptionAria(options: {
  listboxId?: string
  index: number
  selected: boolean
  disabled?: boolean
}): LhAriaAttrs {
  const { listboxId, index, selected, disabled } = options
  const attrs: LhAriaAttrs = { role: 'option' }
  const id = getSelectOptionId(listboxId, index)
  if (id) attrs.id = id
  if (selected) attrs['aria-selected'] = true
  if (disabled) attrs['aria-disabled'] = true
  return attrs
}
