/**
 * 无障碍内核（纯函数，无框架依赖）
 *
 * 本仓是纯函数共享层，aria 属性的实际落图在 UI 层；本模块提供两件事：
 * 1. 原子构建器 —— 统一属性名拼写与「假值省略」语义，杜绝三库漂移
 * 2. 组合属性包 —— 弹出层触发器 / 表单控件 / 装饰件等通用形态，UI 层 v-bind 即可
 *
 * 约定：布尔型 aria 属性假值输出 undefined（不渲染该属性），
 * 避免出现 aria-expanded="false" 之外的无效值（如 aria-invalid="false" 是合法的，
 * 但 aria-current="false" 在多数读屏软件里会被忽略，故统一省略）。
 */

/** aria 属性包的形状：键为 'aria-*' 或 'role'，值为 string | number | boolean | undefined */
export type LhAriaAttrs = Record<string, string | number | boolean | undefined>

/** aria-haspopup 的合法取值（APG） */
export type LhAriaHaspopup = 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | 'combobox'

let _ariaIdCounter = 0

/**
 * 生成 aria 关联用的唯一 id
 *
 * 与 utils/generateId 的区别：aria id 需要稳定可预测的形态（供 UI 层在
 * 触发器与浮层两侧各引用一次），前缀固定为 `lh-aria-`，模块计数器保证
 * 同进程多实例不撞 id。SSR 安全：无 DOM 访问。
 */
export function generateAriaId(prefix = 'lh-aria'): string {
  _ariaIdCounter += 1
  return `${prefix}-${_ariaIdCounter}`
}

/** aria-expanded：展开 / 收起态（弹出层触发器、折叠面板、树节点、子菜单） */
export function ariaExpanded(expanded: boolean): LhAriaAttrs {
  return { 'aria-expanded': expanded }
}

/** aria-controls：触发器引用其控制的面板 id */
export function ariaControls(id: string | undefined): LhAriaAttrs {
  return id ? { 'aria-controls': id } : {}
}

/** aria-labelledby：引用另一个元素的可见文案作为自身可达名称 */
export function ariaLabelledby(id: string | undefined): LhAriaAttrs {
  return id ? { 'aria-labelledby': id } : {}
}

/** aria-describedby：引用补充描述元素（表单错误提示、tooltip 浮层） */
export function ariaDescribedby(id: string | undefined): LhAriaAttrs {
  return id ? { 'aria-describedby': id } : {}
}

/** aria-invalid：表单校验失败（合法输出 true / false，false 时读屏会显式播报有效） */
export function ariaInvalid(invalid: boolean): LhAriaAttrs {
  return { 'aria-invalid': invalid }
}

/** aria-required：必填（原生 required 之外的显式语义，自定义控件需要） */
export function ariaRequired(required: boolean): LhAriaAttrs {
  return required ? { 'aria-required': true } : {}
}

/**
 * aria-current：当前位置标记（分页当前页 / 面包屑当前页 / 步骤当前步）
 *
 * 'false' 是合法值但会被多数读屏忽略，故仅在有值时输出。
 */
export function ariaCurrent(current: 'page' | 'step' | 'location' | 'date' | 'time' | true | undefined): LhAriaAttrs {
  return current ? { 'aria-current': current } : {}
}

/** aria-haspopup：声明触发器会弹出何种浮层 */
export function ariaHaspopup(kind: LhAriaHaspopup | boolean): LhAriaAttrs {
  if (kind === false) return {}
  if (kind === true) return { 'aria-haspopup': 'true' }
  return { 'aria-haspopup': kind }
}

/**
 * 弹出层触发器的公共属性包（popover / popconfirm / select / cascader / date-picker / dropdown 共用）
 *
 * @param expanded 是否已展开
 * @param popupId 浮层元素 id（未传时不输出 aria-controls）
 * @param haspopup aria-haspopup 取值，默认 'true'（下拉类组件可传 'listbox' / 'menu' / 'dialog'）
 */
export function getPopupTriggerAria(options: {
  expanded: boolean
  popupId?: string
  haspopup?: LhAriaHaspopup
}): LhAriaAttrs {
  const { expanded, popupId, haspopup = 'true' } = options
  return {
    ...ariaExpanded(expanded),
    ...ariaControls(popupId),
    ...ariaHaspopup(haspopup),
  }
}

/**
 * 装饰性元素：对辅助技术隐藏（icon / skeleton / loading / 纯分割线）
 *
 * 传 false 时输出空对象，供「有可点击语义的图标」这类场景显式取消隐藏。
 */
export function getDecorativeAria(decorative = true): LhAriaAttrs {
  return decorative ? { 'aria-hidden': true } : {}
}
