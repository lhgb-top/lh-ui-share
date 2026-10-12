---
title: types —— 共享联合类型
description: 'LhComponentSize / LhComponentLanguage / LhComponentType / LhPosition，由 constants 常量推导'
---

core 组件共用的四个联合类型。它们的取值不是手写的字面量联合，而是**从 `src/constants/` 的 `as const` 常量推导**出来的——加一种尺寸 / 一门语言，只改常量，类型自动跟着变。

## 导入方式

```ts
import type {
  LhComponentSize,
  LhComponentLanguage,
  LhComponentType,
  LhPosition,
} from '@lh-ui/share/core/shared/types'
```

## 四个类型

| 类型 | 定义 | 实际取值 |
| --- | --- | --- |
| `LhComponentSize` | `(typeof LH_SIZE_CONST)[keyof typeof LH_SIZE_CONST]` | `'small' \| 'medium' \| 'large' \| 'mini' \| 'x-large'` |
| `LhComponentLanguage` | `(typeof LH_LANGUAGE_CONST)[keyof typeof LH_LANGUAGE_CONST]` | `'zh-CN' \| 'en-US' \| 'ja-JP' \| 'ko-KR' \| 'de-DE' \| 'fr-FR'` |
| `LhComponentType` | `(typeof LH_TYPES_CONST)[keyof typeof LH_TYPES_CONST] \| 'default' \| 'primary'` | `'success' \| 'warning' \| 'error' \| 'info' \| 'danger' \| 'default' \| 'primary'` |
| `LhPosition` | 字面量联合 | `'top' \| 'top-left' \| 'top-right' \| 'bottom' \| 'bottom-left' \| 'bottom-right' \| 'left' \| 'right'` |

### LhComponentSize 的 `'x-large'`

这是**老年人专用尺寸**（大字体、大触控区）。注意常量里的结构：

```ts
// src/constants/index.ts
export const LH_SIZE_CONST = {
  small: 'small',
  medium: 'medium',
  large: 'large',
  mini: 'mini',
  old: 'x-large',   // 键名 old，值 'x-large'；// 老年人专用
} as const
```

**键名与值不一致**（`old` ↔ `'x-large'`），类型联合里出现的是**值** `'x-large'`。而组件 props 里开老年人模式的开关是另一个布尔字段 `old?: boolean`（见 [LhBaseProps](/reference/types)）——尺寸枚举值与开关 prop 是两回事，别混。

### LhComponentType 的两个基础色

`'default'` / `'primary'` 不在 `LH_TYPES_CONST` 里（那是五个**语义色**：成功 / 警告 / 错误 / 信息 / 危险），而是在类型层面 `| 'default' | 'primary'` 补上去的。它们不是「状态语义」，是按钮等组件的基础外观色。

### LhPosition 与 LhPlacement 是两套模型

| | `LhPosition` | `LhPlacement`（[popper](/core/popper)） |
| --- | --- | --- |
| 用途 | 贴边定位（affix / backtop） | 浮层定位（tooltip / popover） |
| 取值 | `'top'` / `'top-left'` / `'top-right'` / `'bottom'` / `'bottom-left'` / `'bottom-right'` / `'left'` / `'right'` | `'top'` / `'top-start'` / `'top-end'` / `'bottom'` / `'bottom-start'` / `'bottom-end'` / `'left'` / `'left-start'` / `'left-end'` / `'right'` / `'right-start'` / `'right-end'` |
| 对齐后缀 | `-left` / `-right`（只有两端） | `-start` / `-end`（语义化对齐，支持 RTL 翻转） |

`LhPosition` 的 `-left` / `-right` 是**物理方向**，`LhPlacement` 的 `-start` / `-end` 是**逻辑方向**（RTL 布局下自动翻转）。不要互相转换着用。

## 为什么从常量推导

```ts
// 反例：手写联合，加语言要改两处
type LhComponentLanguage = 'zh-CN' | 'en-US'  // ← 容易和常量不同步

// 本仓做法：常量是唯一源
type LhComponentLanguage = (typeof LH_LANGUAGE_CONST)[keyof typeof LH_LANGUAGE_CONST]
```

加一门语言只需在 `LH_LANGUAGE_CONST` 加一行，类型、`LhLocaleType`、`setLocale` 的参数校验全部自动更新。这是 [命名规范](/guide/naming) 里「常量 `LH_XXX`、类型 `LhXxx`」分层的一个具体落点。

## 使用示例

### 组件 props

```ts
import type { LhComponentSize, LhComponentType } from '@lh-ui/share/core/shared/types'

interface LhButtonProps {
  type?: LhComponentType   // 自动补全 'primary' | 'success' | …
  size?: LhComponentSize   // 自动补全 'small' | 'medium' | …
}
```

### 带业务扩展的泛型版本

业务侧常常需要「组件类型 + 我们自己的几个类型」，`src/types/components/base.ts` 提供了泛型版本（见 [types 参考](/reference/types)）：

```ts
import type { LhTypes } from '@lh-ui/share/types'

type MyButtonType = LhTypes<'brand' | 'dangerous'>
// → LhComponentType | 'brand' | 'dangerous'
```

### 运行时校验

类型本身不做运行时校验。组件内部用常量做值检查：

```ts
import { LH_SIZE_CONST } from '@lh-ui/share/constants'

const isValidSize = (v: string): v is LhComponentSize =>
  Object.values(LH_SIZE_CONST).includes(v as LhComponentSize)
```

## 注意事项

- **只导出类型**：这个模块 `import type` 引常量，编译后不产生任何运行时代码（除常量本身）。纯类型导入不会影响包体积。
- **`'mini'` 与 `'x-large'` 是扩展档**：`small / medium / large` 是常规三档；`mini` 用于内联紧凑场景（表格内的操作按钮），`x-large` 是无障碍老年人档。不是所有组件都支持全部五档，以各组件文档为准。
- **`LhPosition` 未被 `src/types` 公共导出面引入**：它在 `core/shared/types` 里，需要从 `@lh-ui/share/core/shared/types` 导入，`@lh-ui/share/types` 里没有。
