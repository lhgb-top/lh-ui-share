---
title: keyboard —— 键盘导航算法
description: 'LH_KEYS 按键常量、列表 / 网格 / range 三套导航算法与 type-ahead，供 select / menu / tree / tabs 共用'
---

import { FnPlayground } from '../../components/FnPlayground.astro'

无障碍组件的键盘交互有标准答案（APG 的 listbox / menu / grid pattern），但「按上键该跳到哪一项」这个计算在 select / menu / tree / tabs / segmented 里各写一遍就会各错一遍。`shared/keyboard` 把它变成纯函数：输入「列表 + 当前下标 + 方向」，输出「目标下标」。

**core 层不监听任何按键**——键盘事件监听属于 UI 层（Vue3 的 `@keydown`、React 的 `onKeyDown`）。本模块只提供判定与计算。

## 导入方式

```ts
import {
  LH_KEYS,
  isActivationKey,
  getNextListIndex,
  getNextGridCell,
  getNextRangeValue,
  findTypeAheadIndex,
  getRovingTabIndex,
  type LhListNavigationOptions,
} from '@lh-ui/share/core/shared/keyboard'
```

## 常量与类型

```ts
// 按键名常量（KeyboardEvent.key），UI 层禁止再裸写字符串字面量
export const LH_KEYS = {
  Escape: 'Escape',
  Enter: 'Enter',
  Space: ' ',          // 注意：值是一个空格
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  Home: 'Home',
  End: 'End',
  Tab: 'Tab',
  Backspace: 'Backspace',
  Delete: 'Delete',
  PageUp: 'PageUp',
  PageDown: 'PageDown',
} as const

// 真实事件或裸 key 值都能收（纯函数测试需要）
export type LhKeyEvent = KeyboardEvent | { key: string }

// 导航方向：数值偏移或首尾哨兵
export type LhListDirection = 1 | -1 | 'first' | 'last'

// 列表项的最小约束：只需禁用标记，具体形状由调用方提供
export interface LhListItem {
  disabled?: boolean
}

export interface LhListNavigationOptions<T = unknown> {
  loop?: boolean                    // 首尾循环，默认 true
  skipDisabled?: boolean            // 跳过禁用项，默认 true
  isDisabled?: (item: T) => boolean // 自定义禁用判定，默认读 item.disabled
}

export interface LhGridNavOptions {
  cols: number                      // 每行列数
  total: number                     // 网格总格数
  loop?: boolean                    // 行内 / 整体循环，默认 false（到边界返回 null 交由 UI 层翻页）
}

export interface LhRangeNavOptions {
  min: number
  max: number
  step: number                      // 方向键步长；非有限或 ≤0 退化为 1 且只做边界钳制
  pageStep?: number                 // PageUp / PageDown 步长，默认 max(step, (max-min)/10)
}
```

## 函数表

### 按键判定

| 函数 | 签名 | 作用 |
| --- | --- | --- |
| `isActivationKey` | `(e: LhKeyEvent) => boolean` | Enter 或 Space |
| `isArrowKey` | `(e: LhKeyEvent) => boolean` | 四向方向键 |
| `isEscapeKey` | `(e: LhKeyEvent) => boolean` | Escape（弹出层关闭） |
| `isHomeOrEndKey` | `(e: LhKeyEvent) => boolean` | Home / End（列表首尾跳跃） |
| `isSpaceKey` | `(e: LhKeyEvent) => boolean` | 空格（需与 Enter 区分的场景，如滚动容器内翻页） |
| `isHorizontalArrowKey` | `(e: LhKeyEvent) => boolean` | 水平方向键 |
| `isVerticalArrowKey` | `(e: LhKeyEvent) => boolean` | 垂直方向键 |

`isHorizontalArrowKey` / `isVerticalArrowKey` **只做物理键判定**——RTL 布局下「左」该表示「上一个」还是「下一个」是 UI 层的语义，算法不替你翻转。

### 导航计算

| 函数 | 签名 | 作用 |
| --- | --- | --- |
| `getNextListIndex` | `<T>(items, current, direction, options?) => number` | 通用列表导航，返回目标下标 |
| `findTypeAheadIndex` | `(labels: string[], query: string, startIndex?) => number` | type-ahead 首字符匹配 |
| `getRovingTabIndex` | `<T>(items, activeIndex) => number` | roving tabindex：返回应为 tabindex 0 的下标 |
| `getNextGridCell` | `(current, key, opts: LhGridNavOptions) => number \| null` | 二维网格导航（日期网格、月份网格） |
| `getNextRangeValue` | `(current, key, opts: LhRangeNavOptions) => number` | range 控件导航（slider 的键盘步进） |

### getNextListIndex 的返回值语义

这是最容易用错的地方，单独说明：

| 情形 | 返回值 |
| --- | --- |
| `'first'` / `'last'` | 直达首个 / 末个**启用**项 |
| 正常移动 | 目标下标 |
| 不循环且已到边界 | **停在边界**（返回边界下标，不是 -1） |
| 空列表 / 全部禁用且 `skipDisabled` | `-1`（无可用项） |
| 只有边界项禁用且已到边界 | `-1` |
| `current` 越界或 `-1` | 按「未选中」处理：正向取首项、负向取末项 |

**不循环时不会返回 -1 来表示「到头了」**——它返回边界下标，让焦点停在那一项。UI 层据此决定要不要 `preventDefault`；只有「真的没有可选项」才给 -1。

### getRovingTabIndex 返回的是下标

函数名容易误导：它**返回「应为 tabindex 0 的那一项的下标」**，不是 tabindex 值本身。调用方据此落值：

```ts
const activeIndex = getRovingTabIndex(items, selectedIndex)
items.forEach((item, i) => (item.tabindex = i === activeIndex ? 0 : -1))
```

这样保证整组里**始终有一个可 Tab 进入的锚点**；`activeIndex` 无可用项时回退到首个启用项，不会出现整组都 -1、键盘进不去的情况。

### findTypeAheadIndex 的匹配规则

- 项标签**以查询串开头**即命中（大小写不敏感）。
- 从 `startIndex` **之后**开始环绕查找（默认 `-1`，从头开始）。
- 支持多字符累积：用户快速敲 `zh` 时，UI 层在 500ms 内累积查询串，超时清空。
- 无匹配 / `query` 为空 / `labels` 为空 → `-1`。

### getNextGridCell 的跨行流动

ArrowRight 在**行末会流到下一行行首**（视口内连续移动，只有越过整个网格边界才返回 `null`）；ArrowDown / ArrowUp 垂直移动 `±cols`；Home / End 是**行首 / 行末**（最后一行不足 `cols` 时行末按 `total` 收敛，不会跳到网格外）。

非导航键、不循环时越界、`current` 越界、`cols` / `total` ≤ 0 → `null`。

`loop` 默认 `false` 是刻意的：日期面板里「右越界」通常意味着**切到下个月**，这个决定由 UI 层做，算法只说「到头了」。

### getNextRangeValue 只钳不整

```ts
getNextRangeValue(25, 'ArrowUp', { min: 0, max: 100, step: 10 })
// 25 + 10 = 35（不做 step 对齐）
```

**为什么不取整**：如果当前值是 25（用户拖出来的未对齐值），取整算法会先跳到 30 再到 40，看起来像跳了两下。只做 clamp + 步进，对齐交给组件层在写入 localValue 时保证（拖拽松手时 snap 到刻度）。

非导航键**原样返回 `current`**——调用方据此判断「这次按键我需要处理吗」，决定要不要 `preventDefault`。

## 使用示例

### select 的键盘导航（roving tabindex + list nav）

```ts
function onKeydown(e: KeyboardEvent) {
  if (isArrowKey(e)) {
    e.preventDefault()
    const next = getNextListIndex(
      options.value,
      selectedIndex.value,
      e.key === LH_KEYS.ArrowDown ? 1 : -1,
      { loop: true },
    )
    if (next !== -1) selectedIndex.value = next
  } else if (isHomeOrEndKey(e)) {
    selectedIndex.value = getNextListIndex(
      options.value,
      -1,
      e.key === LH_KEYS.Home ? 'first' : 'last',
    )
  } else if (isActivationKey(e)) {
    open.value = !open.value
  } else if (isEscapeKey(e)) {
    open.value = false
  }
}
```

### date-picker 的日期网格

```ts
const next = getNextGridCell(focusedIndex.value, e.key, {
  cols: 7,                    // 一周 7 天
  total: daysInMonth.value,   // 本月天数
})
if (next === null) {
  // 越界 → 切月上 / 下月（UI 层决定）
  switchMonth(e.key === LH_KEYS.ArrowRight ? 1 : -1)
} else {
  focusedIndex.value = next
}
```

### slider 的键盘步进

```ts
if (isArrowKey(e) || isHomeOrEndKey(e) || e.key === LH_KEYS.PageUp || e.key === LH_KEYS.PageDown) {
  e.preventDefault()
  modelValue.value = getNextRangeValue(modelValue.value, e.key, {
    min: props.min,
    max: props.max,
    step: props.step,
  })
}
```

### 字符输入导航

```ts
// 累积查询串（UI 层维护 500ms 超时）
typeAheadBuffer.value += e.key
const idx = findTypeAheadIndex(labels, typeAheadBuffer.value, selectedIndex.value)
if (idx !== -1) selectedIndex.value = idx
```

## 注意事项

- **监听在 UI 层**：`onKeydown` 的接线、`preventDefault` 的时机、焦点切换后的 `focus()` 调用，都是各框架组件的责任；core 只给计算结果。
- **RTL 布局**：左右方向键的语义翻转由 UI 层在调用前反转 `direction` 实现，算法本身保持物理键语义。
- **`isDisabled` 的默认值**：读 `item.disabled`，读不到视为未禁用——传 `{}` 类型的项时所有项都可导航。
- **空列表安全**：所有导航函数对空列表都返回 `-1` / `null`，UI 层判一下即可，不会抛错。

<FnPlayground module="keyboard" fn="getNextListIndex" params='{"items": [{"disabled": false}, {"disabled": true}, {"disabled": false}, {"disabled": false}], "current": 0, "direction": 1, "options": {"loop": true}}' />
