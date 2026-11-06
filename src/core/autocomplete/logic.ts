import { getPopupTriggerAria, type LhAriaAttrs } from '../shared/a11y'
import type {
  LhAutocompleteFilterOptions,
  LhAutocompleteOption,
  LhAutocompleteOptionAriaInput,
  LhAutocompleteTriggerAriaInput,
} from './types'

/**
 * Autocomplete 组件纯函数（框架无关）
 *
 * 渲染规则与 lh-ui-plus 的 autocomplete 模板一一对应：
 * 输入框（combobox） + 下拉建议列表（listbox），选中后 label 回填输入框。
 * 定位 / 点击外部 / 过渡由 UI 层 hooks 承接，本层只管过滤、id 与 aria 语义。
 */

/**
 * 过滤建议列表
 *
 * - 空查询串（trim 后为空）返回全部选项：focus 触发场景需要展示全部候选，
 *   是否展示空查询面板由 UI 层的 trigger 语义决定，本函数不做隐藏判断
 * - trim 默认开启：首尾空白不参与匹配，但显式传 false 时保留原样匹配
 * - 禁用项保留在列表中（样式置灰），交由 UI 层禁止选中：过滤只管可见性
 */
export function filterSuggestions(
  options: readonly LhAutocompleteOption[],
  query: string,
  opts: LhAutocompleteFilterOptions = {},
): LhAutocompleteOption[] {
  const { caseSensitive = false, trim = true, matcher } = opts
  const normalized = trim ? (query ?? '').trim() : (query ?? '')
  if (normalized === '') return [...options]
  if (matcher) return options.filter((option) => matcher(option, normalized))
  return options.filter((option) => {
    const target = caseSensitive ? option.label : option.label.toLowerCase()
    const needle = caseSensitive ? normalized : normalized.toLowerCase()
    return target.includes(needle)
  })
}

/**
 * 选项元素 id：`{listboxId}-option-{index}`，供触发器的 aria-activedescendant 引用
 *
 * 确定性拼接（非随机 id）：高亮项变化时触发器只需更新 aria-activedescendant 的值，
 * 读屏软件即可播报新高亮项，无需重新挂载 DOM。
 */
export function getAutocompleteOptionId(
  listboxId: string | undefined,
  index: number,
): string | undefined {
  // 负数 / 非整数下标（-1 = 无高亮）不产出 id，否则触发器会引用一个
  // 不存在的 DOM 元素，读屏软件播报找不到目标
  if (!listboxId || !Number.isInteger(index) || index < 0) return undefined
  return `${listboxId}-option-${index}`
}

/**
 * 触发器（combobox）的无障碍属性包：
 * role="combobox" + aria-expanded + aria-controls（列表盒）+ aria-activedescendant（高亮项）
 *
 * 与 select 的 combobox 语义同构（APG combobox pattern）。
 */
export function getAutocompleteTriggerAria(input: LhAutocompleteTriggerAriaInput): LhAriaAttrs {
  const { visible, listboxId, highlightedIndex } = input
  const attrs: LhAriaAttrs = {
    ...getPopupTriggerAria({ expanded: visible, popupId: listboxId, haspopup: 'listbox' }),
    role: 'combobox',
  }
  const optionId = getAutocompleteOptionId(listboxId, highlightedIndex)
  if (optionId) attrs['aria-activedescendant'] = optionId
  return attrs
}

/** 列表盒的无障碍属性包：role="listbox" + id（与触发器的 aria-controls 对应） */
export function getAutocompleteListboxAria(id?: string): LhAriaAttrs {
  const attrs: LhAriaAttrs = { role: 'listbox' }
  if (id) attrs.id = id
  return attrs
}

/** 选项的无障碍属性包：role="option" + aria-selected + aria-disabled */
export function getAutocompleteOptionAria(input: LhAutocompleteOptionAriaInput): LhAriaAttrs {
  const attrs: LhAriaAttrs = {
    role: 'option',
    'aria-selected': input.highlighted,
  }
  if (input.disabled) attrs['aria-disabled'] = true
  return attrs
}

/**
 * 取选项的提交值：未显式给 value 时以 label 兜底
 *
 * 选项允许只写 label（多数场景 label 即值），避免 UI 层各自判空散写。
 */
export function getAutocompleteOptionValue(option: LhAutocompleteOption): string | number {
  return option.value ?? option.label
}
