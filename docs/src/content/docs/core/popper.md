---
title: popper —— 弹出层定位引擎
description: 'computePosition 实现 12 方位摆放、主轴翻转与交叉轴夹回，纯 rect 输入，可直接单测'
---

import { FnPlayground } from '../../components/FnPlayground.astro'

tooltip、popover、popconfirm、dropdown、select 的下拉、cascader 的面板、date-picker 的日历——lh-ui 里所有「浮在触发器旁边的东西」，位置都由这一个函数算出来。

## 为什么不用 floating-ui / popper.js

家族的四端（Vue3 / Vue2 / React / uniapp）都要引这个包，第三方定位库的体积与更新节奏会变成四份负担。share 的定位引擎只覆盖家族真正用到的子集：12 方位、主轴翻转、交叉轴夹回、箭头偏移，约 300 行，零依赖，纯函数输入输出——**不创建 DOM、不监听事件、不跑 requestAnimationFrame**。调度与渲染由各 UI 层自己决定（Vue3 用 `watchEffect`，React 用 `useLayoutEffect`，uniapp 用页面滚动事件）。

## 导入方式

```ts
import {
  computePosition,
  parsePlacement,
  getWindowViewport,
  type LhPlacement,
  type LhComputePositionOptions,
} from '@lh-ui/share/core/shared/popper'
```

## 类型与常量

```ts
// 12 方位 = 4 方向 × 3 对齐（center 可省略后缀）
export type LhPlacement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end'

export type LhPlacementDir = 'top' | 'bottom' | 'left' | 'right'
export type LhPlacementAlign = 'start' | 'center' | 'end'

// 与 DOMRect 同构的最小结构——测试时直接造字面量
export interface LhDOMRectLike {
  top: number
  left: number
  width: number
  height: number
  right: number
  bottom: number
}

export interface LhComputePositionOptions {
  placement?: LhPlacement       // 默认 'bottom'
  gap?: number                  // 与触发器的间距，默认 8
  padding?: number              // 视口安全边距，默认 8
  flip?: boolean                // 主轴溢出翻转，默认 true
  shift?: boolean               // 交叉轴夹回，默认 true
}

export interface LhPopperPosition {
  top: number
  left: number
  placement: LhPlacement        // 翻转后实际生效的方位
  arrowOffset: number           // 箭头在交叉轴上的偏移（px，自弹出层交叉轴起点算）
}
```

## 函数表

| 函数 | 签名 | 作用 |
| --- | --- | --- |
| `parsePlacement` | `(placement: LhPlacement) => { dir, align }` | 拆解方位为「方向 + 对齐」，非法方向兜底 `bottom`、非法对齐兜底 `center` |
| `buildPlacement` | `(dir: LhPlacementDir, align: LhPlacementAlign) => LhPlacement` | 由方向与对齐重建方位（`center` 时省略后缀） |
| `flipDir` | `(dir: LhPlacementDir) => LhPlacementDir` | 主轴翻转：top↔bottom、left↔right |
| `basePosition` | `(dir, align, trigger, popper, gap) => { top, left }` | 按方位的基础摆放（**不考虑视口约束**） |
| `fitsInViewport` | `(dir, trigger, popper, viewport, gap, padding) => boolean` | 指定方向上弹出层是否完整落在视口内（主轴判定） |
| `computePosition` | `(trigger, popper, viewport, options?) => LhPopperPosition` | **主入口**：完整定位计算 |
| `getWindowViewport` | `() => LhDOMRectLike` | 由浏览器窗口构造视口 rect；SSR 守卫，无 `window` 时宽高为 0 |
| `isOutsideViewport` | `(rect, viewport) => boolean` | rect 是否已完全离开视口（滚动时触发器不可见即应关闭浮层） |

## computePosition 的计算流程

```
flip（主轴翻转）
  → 仅当翻转后的方向放得下才翻（避免翻过去更糟）
  → 按方位摆放（basePosition）
  → shift 交叉轴夹回（沿 padding 安全边距）
  → 主轴夹回（仅 flip 开启、且两侧都放不下时，贴到能贴的那一侧）
  → 低侧钳制安全网（兜底，保证不出现负坐标）
```

关键设计：

- **翻转是条件性的**。常见的错误实现是「溢出就翻转」，结果触发器在视口正中、浮层很高时翻过去反而更放不下。`computePosition` 先用 `fitsInViewport` 问一句「翻过去放得下吗」，放不下就不翻，走主轴钳制。
- **返回实际生效的 `placement`**。翻转后 `placement` 字段变成新方位，UI 层据此切换箭头类名（`is-top` / `is-bottom`）——箭头方向必须与实际方位一致，否则视觉上箭头会与浮层分离。
- **箭头始终指向触发器中心**，`arrowOffset` 是交叉轴上的偏移量，钳制在弹出层边界内；`padding` 上限是弹出层一半，避免上下界反转（箭头跑到弹出层外面）。

## 使用示例

### 纯函数（可直接单测）

```ts
const trigger = { top: 100, left: 50, width: 80, height: 32, right: 130, bottom: 132 }
const popper = { top: 0, left: 0, width: 200, height: 120, right: 200, bottom: 120 }
const viewport = { top: 0, left: 0, width: 375, height: 667, right: 375, bottom: 667 }

computePosition(trigger, popper, viewport, { placement: 'top' })
// 触发器上方放得下：
// { top: 132 - 8 - 120, left: ..., placement: 'top', arrowOffset: ... }
```

### Vue3 接线

```ts
// 浮层组件内
function update() {
  if (!triggerEl.value || !popperEl.value) return
  const pos = computePosition(
    triggerEl.value.getBoundingClientRect(),
    popperEl.value.getBoundingClientRect(),
    getWindowViewport(),
    { placement: placementRef.value, gap: 8 },
  )
  popperEl.value.style.top = `${pos.top}px`
  popperEl.value.style.left = `${pos.left}px`
  actualPlacement.value = pos.placement
}

onMounted(() => {
  watchEffect(update)          // 响应式依赖变化时重算
  window.addEventListener('scroll', update, true)
})
```

### React 接线

```tsx
useLayoutEffect(() => {
  if (!triggerRef.current || !popperRef.current) return
  const pos = computePosition(/* ... */)
  setPos(pos)
}, [open, placement])
```

### uniapp 接线

uniapp 的 `getBoundingClientRect` 在各端实现不同（小程序需用 `uni.createSelectorQuery`），UI 层测出 rect 后调同一个 `computePosition`，算法本身完全一致。

## 注意事项

- **入参先做字段级净化**：非有限字段（NaN / Infinity）归 0，不会让坏 rect 流进几何计算。
- **SSR 安全**：`getWindowViewport()` 在无 `window` 环境返回宽高为 0 的 rect；`computePosition` 本身不碰 DOM，可以在服务端预算一次位置。
- **`flip: false` 的语义**：调用方自行接受主轴溢出，此时主轴只保留低侧钳制（不会把浮层推到负坐标）。`select` / `cascader` 这类「方向固定」的场景会用它。
- **不处理 Resize / Scroll 监听**：调度是 UI 层的事；share 只保证「给定输入，输出确定」。
- 与 `LhPosition`（`'top-left'` / `'bottom-right'` 这套，见 [types](/core/types)）是**两套方位模型**：`LhPosition` 用于 affix / backtop 这类「贴边」语义，没有 `-start` / `-end` 对齐后缀；不要混用。

<FnPlayground module="popper" fn="computePosition" params='{"trigger": {"top": 100, "left": 50, "width": 80, "height": 32, "right": 130, "bottom": 132}, "popper": {"top": 0, "left": 0, "width": 200, "height": 120, "right": 200, "bottom": 120}, "viewport": {"top": 0, "left": 0, "width": 375, "height": 667, "right": 375, "bottom": 667}, "options": {"placement": "top"}}' />
