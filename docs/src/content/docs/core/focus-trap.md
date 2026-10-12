---
title: focus-trap —— 焦点管理
description: '可聚焦元素枚举、Tab 焦点圈、inert 所有权注册表与打开记录 / 关闭归还，Dialog / Drawer / Popover 共用'
---

import { FnPlayground } from '../../components/FnPlayground.astro'

模态框、抽屉、图片预览这类**覆盖层组件**有三个焦点义务：打开时记住用户原本在哪、打开期间把 Tab 圈在浮层内、关闭时把焦点还回去。这三件事在 dialog / drawer / popover / popconfirm / image-viewer 里各写一遍必然漂移，`shared/focus-trap` 是它们的唯一实现。

## 导入方式

```ts
import {
  getFocusableElements,
  focusFirst,
  focusLast,
  saveActiveElement,
  restoreActiveElement,
  trapTabKey,
  supportsInert,
  setInertOutside,
} from '@lh-ui/share/core/shared/focus-trap'
```

## 函数表

| 函数 | 签名 | 作用 |
| --- | --- | --- |
| `getFocusableElements` | `(container: HTMLElement \| null \| undefined) => HTMLElement[]` | 枚举容器内可 Tab 落入的元素 |
| `focusFirst` | `(container) => boolean` | 聚焦首个可聚焦元素，无则 `false` |
| `focusLast` | `(container) => boolean` | 聚焦末个可聚焦元素，无则 `false` |
| `saveActiveElement` | `() => HTMLElement \| null` | 记录当前活跃元素供后续归还（SSR 守卫） |
| `restoreActiveElement` | `(el: HTMLElement \| null \| undefined) => void` | 归还焦点 |
| `trapTabKey` | `(container: HTMLElement, event: KeyboardEvent) => boolean` | 处理 Tab / Shift+Tab，焦点圈在容器内 |
| `supportsInert` | `() => boolean` | 当前环境是否支持 `inert` 属性 |
| `setInertOutside` | `(container, active: boolean, locked?: HTMLElement[]) => HTMLElement[]` | 给容器以外的 DOM 加 / 去 inert |

## 各函数的行为细节

### getFocusableElements

先按选择器匹配候选：`a[href]`、`button:not([disabled])`、`input:not([disabled]):not([type="hidden"])`、`select` / `textarea:not([disabled])`、`video[controls]`、`audio[controls]`、`[contenteditable]:not([contenteditable="false"])`、`[tabindex]:not([tabindex="-1"])`。再用 `isHiddenForFocus` **沿祖先链**排除被 `disabled` / 负 tabindex / `hidden` / `aria-hidden="true"` / `display:none` / `visibility:hidden` 遮挡的元素。

沿祖先链这一点很关键：teleport 出去的弹层常被父级的 `aria-hidden` 影响，只查元素自身会漏判。`container` 为空返回 `[]`。

### focusFirst / focusLast

用 `{ preventScroll: true }` 聚焦。**为什么**：浮层 teleport 到 body 后的第一个 tick 内，元素位置可能还是临时的，默认的 `focus()` 会把页面滚到元素临时位置。防止滚动避免了这个视觉跳动。无可聚焦元素返回 `false`，UI 层据此决定要不要把焦点放到容器自身（`tabindex="-1"`）。

### saveActiveElement / restoreActiveElement

打开浮层时 `const last = saveActiveElement()`，关闭时 `restoreActiveElement(last)`。归还的跳过条件：

- `el` 为空、无 `document`：直接返回。
- `!el.isConnected`：触发按钮被 `v-if` 卸载了（比如关闭的同时销毁），不 focus。
- **目标被祖先 `inert` 锁定**：改为 `blur()` 当前焦点元素。这是规范保证的回退路径——blur 后焦点回到 body，不会让焦点卡在锁住的元素上。

### trapTabKey

```
event.key !== 'Tab' 或 event.defaultPrevented  →  返回 false（不处理）
容器内无可用焦点  →  preventDefault()，返回 true（圈住，别让焦点跑出去）
焦点在边界  →  preventDefault()，跳到另一端，返回 true
```

边界判定用**列表索引**而不是引用比较。为什么：焦点可能落在容器内但不在 Tab 序列的元素上（比如 `tabindex="-1"` 的容器自身被 focus），此时 `document.activeElement` 在 `getFocusableElements()` 的结果里查不到（`idx === -1`），算法把它当作「在头部之前」，Shift+Tab 会跳到末项、普通 Tab 跳到首项——符合直觉。

### setInertOutside 与所有权注册表

`inert` 是 W3C 标准属性（2024 年起全浏览器支持），给元素加 `inert` 后它和它的整个子树都对辅助技术隐藏、不可聚焦、不可点击。这是比「Tab 焦点圈」更彻底的背景锁定——读屏用户不会误入被遮住的页面内容。

`setInertOutside` 的加锁路径：从 `container` 沿祖先链向上走到 `body`，每层把**不含 container 的兄弟子树**标记 inert。这样只有浮层及其祖先链可达，其余全部锁住。

难点是**多层浮层叠加**：dialog 里再开 popover，popover 关闭时不能把 dialog 也解锁了。解决办法是所有权注册表（`WeakMap`）：

- 加锁时，每个被锁节点登记「谁锁的」；重复调用只登记所有权，**不重复 setAttribute**（幂等）。
- 解锁时，只有当某节点**没有任何容器还持有所有权**时才移除 inert。
- `locked` 参数是额外豁免清单（如另一个仍打开的 overlay 容器），这些节点即使不在 container 的祖先链上也不被锁。

返回值：加锁时为被加锁节点数组（供调试 / 测试断言），解锁时为 `[]`。

边界：不支持 inert 返回 `[]`（回退到 trapTabKey 焦点圈方案）；无 `document.body` 返回 `locked`；容器已脱离文档时先释放残留所有权再返回去重后的 `locked`。

### supportsInert

渐进增强用：老浏览器（Safari 15.4 以前）没有 `inert`，`setInertOutside` 会直接返回空数组，此时组件应**仍然启用 `trapTabKey`** 作为兜底。两套方案可以共存，inert 是更彻底的那一层。

## 使用示例

### 完整的模态框焦点生命周期

```ts
// Vue3 dialog 组件
let lastFocused: HTMLElement | null = null
let lockedNodes: HTMLElement[] = []

function open() {
  lastFocused = saveActiveElement()
  dialogVisible.value = true
  nextTick(() => {
    if (!panelRef.value) return
    focusFirst(panelRef.value)
    lockedNodes = setInertOutside(panelRef.value, true)
  })
}

function close() {
  setInertOutside(panelRef.value, false, lockedNodes)
  dialogVisible.value = false
  restoreActiveElement(lastFocused)
}

function onKeydown(e: KeyboardEvent) {
  trapTabKey(panelRef.value, e)   // 返回 false 时说明不是 Tab，交给别的逻辑
}
```

### React 接线

```tsx
useEffect(() => {
  if (!open) return
  const last = saveActiveElement()
  focusFirst(panelRef.current)
  const locked = setInertOutside(panelRef.current, true)

  const onKeydown = (e: KeyboardEvent) => trapTabKey(panelRef.current, e)
  document.addEventListener('keydown', onKeydown)

  return () => {
    document.removeEventListener('keydown', onKeydown)
    setInertOutside(panelRef.current, false, locked)
    restoreActiveElement(last)
  }
}, [open])
```

### 嵌套浮层

```ts
// dialog 已开，里面再开 popover
const popoverLocked = setInertOutside(popoverRef.value, true, lockedNodes)
// popover 关闭：dialog 仍在 lockedNodes 豁免清单里，不会被解锁
setInertOutside(popoverRef.value, false, popoverLocked)
```

## 注意事项

- **SSR 安全**：`saveActiveElement` 在无 `document` 时返回 `null`；`getFocusableElements` 收到 `null` 返回 `[]`。但 `trapTabKey` / `setInertOutside` 需要 DOM，只在客户端调用。
- **别忘了归还焦点**：这是无障碍的硬要求。只锁定不归还，键盘用户每次关弹层都丢焦点到 body，体验很差。
- **`v-if` 卸载的触发器**：`restoreActiveElement` 会跳过已 `disconnected` 的元素（`isConnected === false`），此时焦点自然回 body，不要强行 `focus()` 一个不在文档里的节点。
- **所有权注册表是模块级状态**：`WeakMap` 自动 GC，但同进程多实例共享同一张表——这是刻意的，否则两个浮层互相不知道对方的存在，会错误互解。

<FnPlayground module="focus-trap" fn="supportsInert" params='{}' />
