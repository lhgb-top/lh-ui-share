/** 栅格断点 */
export type LhGridBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** 栅格尺寸（1-24 的 span，或带 offset 的对象） */
export interface LhGridSpan {
  span?: number
  offset?: number
  push?: number
  pull?: number
}

/** Col 的尺寸配置：数字或对象（也支持按断点的对象） */
export type LhColSize = number | LhGridSpan

/** 按断点声明的响应式尺寸（未声明的档位向下回退，xs 恒兜底） */
export type LhBreakpointSizes = Partial<Record<LhGridBreakpoint, LhColSize>>
