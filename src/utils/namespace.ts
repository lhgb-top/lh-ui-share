/**
 * BEM 命名空间工具（纯函数，框架无关）
 *
 * 由 plus 的 useLhNamespace 还原而来：它本就是纯字符串函数，
 * 在 share 层作为 createNamespace 暴露，各 UI 库薄包装为 useLhXxx。
 *
 * 约定：BEM with the `lh` namespace —— `lh-button` / `lh-button__text` / `lh-button--primary`
 */
export interface LhNamespace {
  /** 块：`lh-button` */
  b: () => string
  /** 元素：`lh-button__text` */
  e: (element: string) => string
  /** 修饰符：`lh-button--primary` */
  m: (modifier: string) => string
  /** 元素修饰符：`lh-button__text--disabled` */
  em: (element: string, modifier: string) => string
  /** 状态类：`is-loading`；state 为 false/undefined 返回空串，为字符串时输出 `is-${state}` */
  is: (name: string, state?: boolean | string) => string
}

export function createNamespace(block: string): LhNamespace {
  const namespace = 'lh'

  const b = () => `${namespace}-${block}`

  const e = (element: string) => `${namespace}-${block}__${element}`

  const m = (modifier: string) => `${namespace}-${block}--${modifier}`

  const em = (element: string, modifier: string) => `${namespace}-${block}__${element}--${modifier}`

  const is = (name: string, state?: boolean | string) => {
    if (state === undefined || state === false) return ''
    if (state === true) return `is-${name}`
    return `is-${state}`
  }

  return { b, e, m, em, is }
}
