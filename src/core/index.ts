/**
 * @lh-ui/share - 纯函数核心库（框架无关的组件逻辑）
 *
 * 聚合全部 core 模块（与子路径导出面一致，新增 core 组件无需改此处，
 * `export *` 自动收录；跨模块同名冲突才需要显式处理，见文件末尾）。
 */

export * from './shared'

export * from './affix'
export * from './alert'
export * from './anchor'
export * from './backtop'
export * from './breadcrumb'
export * from './button'
export * from './calendar'
export * from './card'
export * from './cascader'
export * from './checkbox'
export * from './collapse'
export * from './date-picker'
export * from './descriptions'
export * from './dialog'
export * from './divider'
export * from './drawer'
export * from './dropdown'
export * from './empty'
export * from './form'
export * from './grid'
export * from './icon'
export * from './image'
export * from './input'
export * from './input-number'
export * from './loading'
export * from './menu'
export * from './message'
export * from './notification'
export * from './pagination'

// popconfirm / popover / tooltip 各自独立实现 getDefaultDelay，star 导出下同名二义，
// 改为显式清单并以组件前缀别名补齐；给这三处新增导出时需同步维护清单。
// popconfirm / popover 还各自实现 canCloseOnEscape（语义相同：disabled 时阻止 Esc 关闭），
// 同名二义按同一方式别名处理；子路径导出（@lh-ui/share/core/popconfirm）保持原名
export {
  DEFAULT_POPCONFIRM_TYPE,
  DEFAULT_POPCONFIRM_PLACEMENT,
  getPopconfirmIconName,
  getPopconfirmClass,
  getDefaultDelay as getPopconfirmDefaultDelay,
  canCloseOnEscape as getPopconfirmCanCloseOnEscape,
  getPopconfirmTriggerAria,
  getPopconfirmPopperAria,
} from './popconfirm'
export * from './popconfirm/types'
export {
  POPOVER_TRIGGERS,
  DEFAULT_POPOVER_PLACEMENT,
  getPopoverClass,
  getPopoverWidthStyle,
  getDefaultDelay as getPopoverDefaultDelay,
  canCloseOnEscape,
  getPopoverTriggerAria,
  getPopoverPopperAria,
} from './popover'
export * from './popover/types'
export * from './progress'
export * from './radio'
export * from './rate'
export * from './segmented'
export * from './select'
export * from './skeleton'
export * from './slider'
export * from './space'
export * from './spinner'
export * from './steps'
export * from './statistic'
export * from './switch'
export * from './table'
export * from './tabs'
export * from './tag'
export * from './time-picker'
export * from './timeline'
export * from './tooltip'
export * from './transfer'
export * from './tree'
export * from './upload'
export * from './virtual-list'

// star 聚合下的同名二义（同一绑定被两个模块再导出）会被 TS 静默丢弃，
// 造成 es/index.js 运行时有、es/index.d.ts 类型上没有的割裂；显式重导出恢复对齐。
// clampValue 是 vue2 等下游在用的兼容名，务必保留
export { clampValue } from './slider'
export { computeWindow, LH_VIRTUAL_OVERSCAN } from './shared/virtual'
