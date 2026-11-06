import { getPopupTriggerAria, type LhAriaAttrs } from '../shared/a11y'
import type { LhMentionContext, LhMentionOption, LhMentionOptionAriaInput } from './types'

/**
 * Mentions 组件纯函数（框架无关）
 *
 * 渲染规则与 lh-ui-plus 的 mentions 模板一一对应：
 * 文本输入控件 + 前缀触发字符（默认 '@'）+ 建议下拉列表（listbox），
 * 选中后把 prefix + 提及值 + 分隔符写回文本，光标落在提及之后。
 */

const INACTIVE_CONTEXT: LhMentionContext = {
  active: false,
  prefixIndex: -1,
  searchText: '',
  end: -1,
}

/** 邮箱本地部分字符集：prefix 前紧贴这些 ASCII 字符时视为邮箱伪前缀（a@b.com） */
const EMAIL_LOCAL_CHARS = /[A-Za-z0-9._%+-]/

/**
 * 解析光标位置的提及上下文
 *
 * 从光标向前扫描，找到最近的一个 prefix 字符，且需要满足：
 * 1. prefix 前不是邮箱本地部分字符（ASCII 字母数字 / . _ % + -），否则视为
 *    邮箱伪前缀跳过继续向前找；CJK 等非 ASCII 字符不误判（你好@张 应触发）
 * 2. prefix 到光标之间不含空白（扫描遇空白即停止：@张三 你好 中光标在好后不触发）
 *
 * @param text 输入控件完整文本
 * @param caretIndex 光标位置（0 ~ text.length，越界自动钳制）
 * @param prefix 触发字符，默认 '@'
 */
export function getMentionContext(
  text: string,
  caretIndex: number,
  prefix = '@',
): LhMentionContext {
  const safeText = text ?? ''
  const caret = Math.max(0, Math.min(Math.floor(caretIndex ?? 0), safeText.length))

  for (let i = caret - 1; i >= 0; i -= 1) {
    const ch = safeText[i]
    if (ch === prefix) {
      // 邮箱伪前缀：prefix 前紧贴 ASCII 词字符则跳过继续向前找
      const before = safeText[i - 1]
      if (before !== undefined && EMAIL_LOCAL_CHARS.test(before)) continue
      return {
        active: true,
        prefixIndex: i,
        searchText: safeText.slice(i + 1, caret),
        end: caret,
      }
    }
    // 遇到空白还没找到 prefix：光标处不存在活动提及
    if (/\s/.test(ch)) return { ...INACTIVE_CONTEXT }
  }
  return { ...INACTIVE_CONTEXT }
}

/**
 * 建议面板选中后写回文本
 *
 * 用 prefix + 展示文案（label）+ 空格替换 `[prefixIndex, end)` 区间，
 * 返回新文本与建议之后的光标位置。
 *
 * 写回的是 label 而非 value：文本里需要是人可读的提及（@张三），
 * 机器标识 value 通过 onSelect 回调传给应用层。
 *
 * @param text 原文本
 * @param context 由 getMentionContext 得到的活动上下文（不活动时原样返回）
 * @param option 选中的建议项
 * @param prefix 触发字符（须与 getMentionContext 一致）
 */
export function insertMention(
  text: string,
  context: LhMentionContext,
  option: LhMentionOption,
  prefix = '@',
): { text: string; caret: number } {
  const safeText = text ?? ''
  if (!context.active || context.prefixIndex < 0) {
    return { text: safeText, caret: safeText.length }
  }
  const label = option.label
  const next = `${safeText.slice(0, context.prefixIndex)}${prefix}${label} ${safeText.slice(context.end)}`
  return { text: next, caret: context.prefixIndex + prefix.length + label.length + 1 }
}

/**
 * 从文本中提取全部已完成的提及值
 *
 * 形如 `@张三` 的片段：prefix 前为文本起点或空白，prefix 后取到下一个空白或文本尾。
 * 供提交场景收集 @ 列表（UI 层无需自己解析）。
 *
 * @param text 完整文本
 * @param prefix 触发字符，默认 '@'
 */
export function getMentions(text: string, prefix = '@'): string[] {
  const safeText = text ?? ''
  const values: string[] = []
  for (let i = 0; i < safeText.length; i += 1) {
    if (safeText[i] !== prefix) continue
    // 邮箱伪前缀跳过（与 getMentionContext 同一判定）
    const before = safeText[i - 1]
    if (before !== undefined && EMAIL_LOCAL_CHARS.test(before)) continue
    const rest = safeText.slice(i + 1)
    const match = rest.match(/^\S+/)
    if (match && match[0].length > 0) values.push(match[0])
  }
  return values
}

/**
 * 过滤建议列表（默认：label 包含搜索串，大小写不敏感）
 *
 * 空搜索串返回全部：prefix 刚输入时展示全部候选是标准行为。
 * 禁用项保留在列表中（样式置灰），交由 UI 层禁止选中。
 */
export function filterMentionOptions(
  options: readonly LhMentionOption[],
  searchText: string,
): LhMentionOption[] {
  const query = (searchText ?? '').toLowerCase()
  if (query === '') return [...options]
  return options.filter((option) => option.label.toLowerCase().includes(query))
}

/**
 * 选项元素 id：`{listboxId}-option-{index}`，供输入框的 aria-activedescendant 引用
 */
export function getMentionOptionId(listboxId: string | undefined, index: number): string | undefined {
  if (!listboxId || !Number.isInteger(index) || index < 0) return undefined
  return `${listboxId}-option-${index}`
}

/**
 * 输入框的无障碍属性包：把文本控件升级为 combobox 语义
 *
 * Mentions 与常规 combobox 差异：控件本身是文本输入（input/textarea），
 * aria-expanded 声明建议面板的展闭，haspopup 为 listbox。
 */
export function getMentionsTriggerAria(input: {
  visible: boolean
  listboxId?: string
  highlightedIndex: number
}): LhAriaAttrs {
  const { visible, listboxId, highlightedIndex } = input
  const attrs: LhAriaAttrs = {
    ...getPopupTriggerAria({ expanded: visible, popupId: listboxId, haspopup: 'listbox' }),
    role: 'combobox',
  }
  const optionId = getMentionOptionId(listboxId, highlightedIndex)
  if (optionId) attrs['aria-activedescendant'] = optionId
  return attrs
}

/** 列表盒的无障碍属性包：role="listbox" + id */
export function getMentionsListboxAria(id?: string): LhAriaAttrs {
  const attrs: LhAriaAttrs = { role: 'listbox' }
  if (id) attrs.id = id
  return attrs
}

/** 选项的无障碍属性包：role="option" + aria-selected + aria-disabled */
export function getMentionOptionAria(input: LhMentionOptionAriaInput): LhAriaAttrs {
  const attrs: LhAriaAttrs = {
    role: 'option',
    'aria-selected': input.highlighted,
  }
  if (input.disabled) attrs['aria-disabled'] = true
  return attrs
}
