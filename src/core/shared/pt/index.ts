/**
 * PT (PassThrough) 工具函数
 * 用于组件内部元素的样式透传
 */

export interface PtAttrs {
  class?: string | string[] | Record<string, boolean>
  style?: Record<string, string>
  attrs?: Record<string, any>
}

/**
 * 合并 PT 属性（浅层合并，不做 deepMerge）
 */
export function mergePt(pt: PtAttrs | undefined, baseClass: string): {
  class: string[]
  style: Record<string, string>
  attrs: Record<string, any>
} {
  if (!pt) {
    return {
      class: [baseClass],
      style: {},
      attrs: {},
    }
  }
  
  let classes: string[] = [baseClass]
  if (pt.class) {
    if (typeof pt.class === 'string') {
      classes = classes.concat(pt.class.split(' ').filter(Boolean))
    } else if (Array.isArray(pt.class)) {
      classes = classes.concat(pt.class)
    } else if (typeof pt.class === 'object') {
      for (const [key, value] of Object.entries(pt.class)) {
        if (value) classes.push(key)
      }
    }
  }
  
  return {
    class: classes,
    style: pt.style || {},
    attrs: pt.attrs || {},
  }
}