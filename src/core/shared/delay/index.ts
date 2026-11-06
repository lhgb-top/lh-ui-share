/**
 * 显隐延迟归一（popconfirm / popover / tooltip 共用）
 *
 * 三处用法各自的默认节奏不同（tooltip 的 hide 为 0：鼠标移出立即隐藏；
 * popconfirm / popover 的 hide 为 100ms：给使用者留出把指针移进弹出层的时间），
 * 因此 defaults 由各组件传入，本函数只负责「undefined 回落 + 非负钳制」这一层公共逻辑。
 */
export interface LhDefaultDelay {
  show: number
  hide: number
}

export function resolveDelay(
  showDelay: number | undefined,
  hideDelay: number | undefined,
  defaults: LhDefaultDelay,
): LhDefaultDelay {
  return {
    // Math.max(0, ...) 兑现下方注释承诺的非负钳制：负延迟对 setTimeout 无意义，
    // 原样返回会把 show/hide 变成立即触发外的脏值（如 showAfter: -500）
    show: Math.max(0, showDelay ?? defaults.show),
    hide: Math.max(0, hideDelay ?? defaults.hide),
  }
}
