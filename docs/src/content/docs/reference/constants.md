---
title: constants —— 常量
description: 'LH_TYPES_CONST / LH_SIZE_CONST / LH_LANGUAGE_CONST 与两个 DEFAULT 常量，全部 as const 冻结'
---

`src/constants/` 是全家族的**运行时常量唯一源**：组件类型语义色、尺寸档位、语言代码。全部 `as const` 冻结，并被 `core/shared/types` 的联合类型推导引用（见 [core/types](/core/types)）。

## 导入方式

```ts
import {
  LH_TYPES_CONST,
  LH_SIZE_CONST,
  LH_LANGUAGE_CONST,
  LH_SIZE_DEFAULT,
  LH_LANGUAGE_DEFAULT,
} from '@lh-ui/share/constants'
```

## 常量表

| 常量 | 值 | 用途 |
| --- | --- | --- |
| `LH_TYPES_CONST` | `{ success, warning, error, info, danger }` | 组件类型（五个语义色） |
| `LH_SIZE_CONST` | `{ small, medium, large, mini, old: 'x-large' }` | 组件尺寸档位 |
| `LH_SIZE_DEFAULT` | `'medium'`（= `LH_SIZE_CONST.medium`） | 默认尺寸 |
| `LH_LANGUAGE_CONST` | `{ zhCN: 'zh-CN', enUS: 'en-US', jaJP: 'ja-JP', koKR: 'ko-KR', deDE: 'de-DE', frFR: 'fr-FR' }` | 语言代码 |
| `LH_LANGUAGE_DEFAULT` | `'zh-CN'`（= `LH_LANGUAGE_CONST.zhCN`） | 默认语言 |

## LH_TYPES_CONST —— 五个语义色

```ts
export const LH_TYPES_CONST = {
  success: 'success',   // 成功
  warning: 'warning',   // 警告
  error: 'error',       // 错误
  info: 'info',         // 信息
  danger: 'danger',     // 危险
} as const
```

每个成员带 `@alias` JSDoc（成功 / 警告 / 错误 / 信息 / 危险），悬停有提示。`LhComponentType` 在此基础上**额外补 `'default' | 'primary'`**（基础外观色，不是状态语义）。

### error 与 danger 的区别

两者都是「出错了」的红色系，语义略有分工，各组件可自行选择：

- `error` —— 校验失败（表单的 input 红框）、操作失败（上传失败）。
- `danger` —— 破坏性操作（删除按钮的红色强调）。

这是约定不是强制规则；大多数组件只用其中一个，以各组件文档为准。

## LH_SIZE_CONST —— 五档尺寸

```ts
export const LH_SIZE_CONST = {
  small: 'small',
  medium: 'medium',     // 默认
  large: 'large',
  mini: 'mini',         // 内联紧凑场景（表格内的操作按钮）
  old: 'x-large',       // 老年人专用
} as const
```

### `old` 键名与 `'x-large'` 值不一致

这是**刻意的命名取舍**：

- **键名 `old`** 是内部「老年人模式」的语义标识，`LhBaseProps.old?: boolean` 用它做开关。
- **值 `'x-large'`** 是对外的尺寸枚举值，`LhComponentSize` 联合里出现的是它。

对外用户感知到的是 `size="x-large"`（或 `old` prop 开关），内部常量键名不暴露给用户。写代码时注意：`Object.keys(LH_SIZE_CONST)` 拿到的是键，`Object.values(...)` 拿到的是类型枚举值，别混用。

### 各档的用途

| 档位 | 场景 |
| --- | --- |
| `mini` | 表格行内的操作按钮、密集表单 |
| `small` | 紧凑布局、工具栏 |
| `medium` | **默认**，常规表单与内容区 |
| `large` | 独立注册 / 登录页的主按钮 |
| `x-large` | 无障碍老年人模式：大字体、大触控区，配合 `old` 布尔开关 |

**不是所有组件都支持全部五档**：`mini` / `x-large` 只在部分组件上实现，以各组件文档为准。

## LH_LANGUAGE_CONST —— 六门语言

```ts
export const LH_LANGUAGE_CONST = {
  zhCN: 'zh-CN',
  enUS: 'en-US',
  jaJP: 'ja-JP',
  koKR: 'ko-KR',
  deDE: 'de-DE',
  frFR: 'fr-FR',
} as const
```

键名是 [zhCN / enUS 这类约定俗成的 locale 命名](/guide/naming#豁免登记)，值是 BCP 47 语言代码。`LhLocaleType` 与 `LhComponentLanguage` 均由此推导。

**注意语言文件的启用状态**：`ja-JP` / `ko-KR` / `de-DE` / `fr-FR` 目前是**预留语言骨架，以英文兜底翻译**（见 [locales](/reference/locales)）。常量里登记了不等于文案完备。

## 为什么用常量而不是枚举

`as const` 对象 + 联合类型推导，比 TS `enum` 有三个好处：

1. **零运行时开销**：`enum` 会生成额外代码（反向映射），`as const` 对象只有一份。
2. **可遍历**：`Object.values(LH_TYPES_CONST)` 直接拿到全部枚举值做运行时校验；`enum` 的遍历在 `preserveConstEnums` 关闭时不可靠。
3. **可逐个补 JSDoc**：每个成员的 `@alias` 提示在 IDE 里可见。

## 使用示例

### 组件 props 的默认值

```ts
import { LH_SIZE_DEFAULT } from '@lh-ui/share/constants'

props: {
  size: { type: String, default: LH_SIZE_DEFAULT },   // 'medium'
}
```

### 运行时值校验

```ts
const TYPE_VALUES = Object.values(LH_TYPES_CONST)

const isValidType = (v: string): v is LhComponentType =>
  TYPE_VALUES.includes(v as never) || v === 'default' || v === 'primary'
```

### 遍历生成工具函数

```ts
// theme / docs 页面遍历所有语言生成切换列表
Object.entries(LH_LANGUAGE_CONST).forEach(([key, code]) => {
  // key: 'zhCN'  code: 'zh-CN'
})
```

## 注意事项

- **常量是冻结的**：`as const` 使类型为字面量联合，运行时仍是普通对象（没有 `Object.freeze`）——别在运行时改它，下游的类型推导不会跟着变。
- **`LH_SIZE_DEFAULT` / `LH_LANGUAGE_DEFAULT` 引用常量的成员**，不是独立的字面量——改常量默认值自动跟着改。
- **`old` 键别直接暴露给用户**：对外是 `size="x-large"` 或 `old` 布尔开关。
