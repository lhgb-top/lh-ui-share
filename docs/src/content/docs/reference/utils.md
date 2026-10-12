---
title: utils —— 通用工具
description: 'createNamespace / deepMerge / debounce / throttle / cssVars 等 15 个框架无关工具函数'
---

import { FnPlayground } from '../../components/FnPlayground.astro'

`src/utils/` 是最底层的通用工具：连 core 都不依赖这些（core 用的是 `core/shared/` 那一批更专用的算法），它们服务各 UI 库的组件实现与业务侧。

## 导入方式

```ts
import { createNamespace, deepMerge, debounce, generateId } from '@lh-ui/share/utils'
```

## 函数表

| 函数 | 签名 | 作用 |
| --- | --- | --- |
| `generateId` | `(prefix = 'lh') => string` | 生成唯一 ID（`${prefix}_${Date.now()}_${counter}`） |
| `generateRandomId` | `() => string` | 生成随机 ID（7 字符 base36） |
| `isEmpty` | `(val: unknown) => boolean` | 是否为空值（仅 `null` / `undefined` / `''`） |
| `isString` | `(val: unknown) => val is string` | 类型守卫：字符串 |
| `isNumber` | `(val: unknown) => val is number` | 类型守卫：数字（`NaN` 返回 `false`） |
| `isPlainObject` | `(val: unknown) => val is Record<string, unknown>` | 类型守卫：普通对象 |
| `debounce` | `<T>(fn: T, delay = 300) => LhDebounced<T>` | 防抖（带 `cancel` / `flush`） |
| `throttle` | `<T>(fn: T, delay = 300) => LhThrottled<T>` | 节流（头沿立即 + 尾沿补执行） |
| `deepMerge` | `<T>(target: T, ...sources: Partial<T>[]) => T` | 深合并对象 |
| `getScrollbarWidth` | `() => number` | 获取滚动条宽度（结果缓存） |
| `toggleClass` | `(el, className, force?) => void` | 添加 / 移除 CSS class |
| `getEventValue` | `(e: Event) => string` | 从事件取目标值 |

子模块导出（`@lh-ui/share/utils` 末尾 re-export）：

| 函数 | 签名 | 作用 |
| --- | --- | --- |
| `createNamespace` | `(block: string) => LhNamespace` | BEM 命名空间工具 |
| `toCssVarName` | `(key: string) => string` | 生成 CSS 变量名（已带 `--lh-` 前缀则原样返回，**幂等**） |
| `cssVars` | `(vars: Record<string, string>) => Record<string, string>` | themeVars 键值对 → 可绑 `:style` 的 CSS 变量对象 |
| `stripCssVarName` | `(key: string) => string` | 去掉 `--lh-` 前缀，还原 themeVars prop 键 |

## createNamespace —— BEM 命名空间

```ts
const ns = createNamespace('button')

ns.b()              // 'lh-button'
ns.e('text')        // 'lh-button__text'
ns.m('primary')     // 'lh-button--primary'
ns.em('text', 'disabled')  // 'lh-button__text--disabled'
ns.is('loading', true)     // 'is-loading'
ns.is('loading', false)    // ''（空串，框架会忽略）
```

所有 lh-ui 组件的类名都经它生成，保证 BEM 结构一致、`lh-` 前缀不漏。`is()` 的状态类**不带命名空间前缀**（`is-loading` 而非 `lh-button--is-loading`），这是家族约定。

类型：

```ts
export interface LhNamespace {
  b: () => string                       // 块
  e: (element: string) => string        // 元素
  m: (modifier: string) => string       // 修饰符
  em: (element: string, modifier: string) => string  // 元素修饰符
  is: (name: string, state?: boolean | string) => string  // 状态类
}
```

## debounce / throttle

### debounce —— 静默期内只执行最后一次

```ts
const debounced = debounce((q: string) => search(q), 300)
input.addEventListener('input', (e) => debounced(e.target.value))

debounced.cancel()   // 卸载时清掉未执行的挂起调用
debounced.flush()    // 立即执行挂起的那一次（无挂起时空操作）
```

`cancel` / `flush` 不是可选的装饰：组件卸载时不清定时器会调已销毁的上下文；「立即搜索」按钮要 `flush()` 把还没触发的查询立刻跑掉。

### throttle —— 头沿立即 + 尾沿补执行

```ts
const throttled = throttle(onScroll, 100)
window.addEventListener('scroll', throttled)
```

时间窗**起点立即执行**（头沿），窗口内的最后一次调用在窗口结束时**补执行**（尾沿）。朴素的节流会丢掉快速滚动的最后一帧——滚动停下来的那一刻恰恰是最需要更新的（sticky / affix 的位置判定）。

`throttle` 只有 `cancel`（清尾沿定时器 + 重置 `lastTime`），没有 `flush`（尾沿语义上就是「稍后执行」）。

类型：

```ts
export interface LhDebounced<T> {
  (...args: Parameters<T>): void
  cancel(): void
  flush(): void
}

export interface LhThrottled<T> {
  (...args: Parameters<T>): void
  cancel(): void
}
```

## cssVars 三件套

ConfigProvider 的 `themeVars` prop 用**简写键**（`'primary-color'`），组件消费的是 CSS 变量（`--lh-primary-color`）。这三个函数做双向转换：

```ts
cssVars({ 'primary-color': '#1677ff' })
// { '--lh-primary-color': '#1677ff' }   ← 可直接绑 :style

toCssVarName('primary-color')      // '--lh-primary-color'
toCssVarName('--lh-primary-color') // '--lh-primary-color'（幂等）

stripCssVarName('--lh-primary-color')  // 'primary-color'
```

**`toCssVarName` 的幂等性很重要**：防止某些路径上已经带前缀的键被二次补成 `--lh---lh-primary-color`——那种键会静默失效（CSS 变量不存在），主题切换看起来「没反应」。

## deepMerge

```ts
deepMerge({ a: 1, nested: { x: 1 } }, { nested: { y: 2 } })
// { a: 1, nested: { x: 1, y: 2 } }
```

- 仅当**两侧都是普通对象**时递归。
- `sourceVal !== undefined` 才覆盖（显式传 `undefined` 不覆盖）。
- **就地修改并返回 target**——这是注意点，不想污染原对象先 `{ ...target }` 浅拷一层。

## getScrollbarWidth

```ts
getScrollbarWidth()   // 例：15（Windows）/ 0（macOS 无滚动条）
```

结果缓存在模块变量 `_scrollbarWidth`。**SSR 守卫**：`typeof document === 'undefined'` 返回 `0`。

用途：dialog / drawer 打开时锁定 body 滚动，右侧会少一条滚动条的宽度，需要 `padding-right` 补上，否则页面内容会横向抖动。

## 使用示例

### 组件内 BEM + class 合并

```ts
const ns = createNamespace('dialog')

const headerClass = computed(() => [
  ns.e('header'),
  ns.is('centered', props.centered),
  // 用户传入的 class
  ...(typeof attrs.class === 'string' ? attrs.class.split(' ') : []),
])
```

### ConfigProvider 注入主题变量

```ts
const styleVars = computed(() => cssVars(props.themeVars))
// <div :style="styleVars">
```

### 滚动监听节流

```ts
onMounted(() => {
  const onScroll = throttle(updateAffixPosition, 100)
  window.addEventListener('scroll', onScroll, true)
  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll, true)
    onScroll.cancel()
  })
})
```

## 注意事项

- **`isEmpty` 只判三件事**：`null` / `undefined` / `''`。`0` / `false` / `[]` 都**不是空**。要判「空数组 / 空对象」自己写。
- **`isNumber(NaN)` 是 `false`**：刻意排除了 NaN。
- **`deepMerge` 就地改 target**：最常见的误用来源。
- **`generateId` 不是纯函数**：模块级自增计数器，同进程多次调用结果不同（SSR / CSR 顺序需一致，详见 [a11y 的 generateAriaId 说明](/core/a11y#generateariaid)）。
- **`useLhSize` 等 composables 不在这里**：依赖 Vue 的组合式 API 属于各框架 UI 层，share 不导出。

<FnPlayground module="utils" fn="createNamespace" params='{"block": "button"}' />
