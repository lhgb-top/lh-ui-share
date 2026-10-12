---
title: types —— 公共类型
description: 'LhLocaleType / LhLeaves / LhBaseProps / LhTypes 泛型与 ambient 全局声明'
---

`src/types/` 是对外暴露的公共类型层。与 [core/shared/types](/core/types)（core 内部联合类型）的区别：这里是**给各 UI 库组件 Props 用的基础形状**。

## 导入方式

```ts
import type {
  LhLocaleType,
  LhLocaleMessages,
  LhLocaleMessageValue,
  LhLeaves,
  LhBaseProps,
  LhTypes,
  LhSizes,
  LhLanguages,
} from '@lh-ui/share/types'
```

## 导出结构

```ts
// src/types/index.ts
export * from './locale'           // 语言包相关
export * from './components/base'  // 组件基础属性
```

`global.d.ts`、`theme.ts`、`scss.d.ts` 是 ambient 声明，随 tsconfig 的 `include` 参与编译，**不在此显式导出**。

## locale 相关类型

| 类型 | 定义 | 用途 |
| --- | --- | --- |
| `LhLocaleType` | `(typeof LH_LANGUAGE_CONST)[keyof typeof LH_LANGUAGE_CONST]` | 六门语言代码联合 |
| `LhLocaleMessageValue` | `string \| readonly LhLocaleMessageValue[] \| { readonly [key: string]: LhLocaleMessageValue }` | 语言包叶节点（递归只读） |
| `LhLocaleMessages` | `Record<string, LhLocaleMessageValue>` | 语言包整体 |
| `LhLeaves<T, Prefix extends string = ''>` | 递归映射类型 | 推导所有「字符串叶子」的点号路径联合 |
| `LhLocaleOptions` | `{ locale: LhLocaleType; messages: LhLocaleMessages }` | `lhlocale.use()` 的入参形状 |

### LhLeaves 的行为

```ts
type ZhLeaves = LhLeaves<typeof zhCN>
// 'common.loading' | 'input.placeholder' | 'input.password' | 'pagination.total' | …
```

- **字符串叶子** → 完整路径（`'input.placeholder'`）。
- **数组键**（如 `datepicker.months`）→ `never`。数组不按键寻址，`t()` 无法命中，`tm()` 才能取。
- **对象** → 递归子键。

`LhLocalePath = LhLeaves<typeof zhCN>` 给 `lhlocale.t()` 提供字面量自动补全与拼写校验。

## 组件基础属性

三个带泛型的联合（允许业务侧扩展自定义值）：

```ts
export type LhTypes<T extends string | undefined = undefined> =
  T extends string ? LhComponentType | T : LhComponentType

export type LhSizes<T extends string | undefined = undefined> =
  T extends string ? LhComponentSize | T : LhComponentSize

export type LhLanguages<T extends string | undefined = undefined> =
  T extends string ? LhComponentLanguage | T : LhComponentLanguage
```

用法：

```ts
type MyType = LhTypes<'brand' | 'dangerous'>
// LhComponentType | 'brand' | 'dangerous'
```

### LhBaseProps —— 组件 Props 的基础形状

```ts
export interface LhBaseProps<
  T extends string | undefined = undefined,
  S extends string | undefined = undefined,
  L extends string | undefined = undefined,
> {
  type?: T extends string ? LhTypes<T> : LhTypes
  size?: S extends string ? LhSizes<S> : LhSizes
  disabled?: boolean
  loading?: boolean
  plain?: boolean
  block?: boolean
  icon?: string
  nativeType?: string
  href?: string
  target?: string
  title?: string
  alt?: string
  lang?: L extends string ? LhLanguages<L> : LhLanguages
  langPath?: string
  old?: boolean      // 老年人专用
}
```

各 UI 库的组件 Props `extends LhBaseProps`，自动获得 `type` / `size` / `disabled` / `lang` 这套公共字段——保证全家族组件的公共 prop 名字一致（用户不用记「这个库叫 `disabled` 那个库叫 `disabled` 没有」）。

| 字段 | 语义 |
| --- | --- |
| `type` | 语义色（`LhTypes`） |
| `size` | 尺寸档（`LhSizes`） |
| `disabled` | 禁用 |
| `loading` | 加载中 |
| `plain` | 朴素样式（无底色描边款） |
| `block` | 块级宽度 100% |
| `icon` | 图标名（内置图标集，见 [图标](/theme/tokens) 的图标部分） |
| `nativeType` | 原生按钮 `type`（`submit` / `reset` / `button`） |
| `href` / `target` | 渲染为 `<a>` 时的链接 |
| `title` / `alt` | 标题与替代文本（无障碍） |
| `lang` | 组件级语言覆盖 |
| `langPath` | 自定义文案键路径前缀 |
| `old` | 老年人模式开关（配合 `size="x-large"`，见 [constants](/reference/constants)） |

## ambient 全局声明

随 tsconfig `include` 生效，不需要 import：

```ts
// src/types/global.d.ts
interface CSSVariable { [key: string]: string }

interface LhUIConfig {
  prefix?: string
  theme?: Record<string, string>
  locale?: string
}

interface InstallOptions {
  prefix?: string
  theme?: Record<string, string>
  locale?: string
  components?: any[]
}
```

这些是给「`app.use(LhUI, { prefix: 'x' })`」这类全局配置项用的 ambient 类型。`theme.ts` 当前为空占位（主题类型在 `src/theme/types.ts`）；`scss.d.ts` 声明 `.scss` 模块。

## 注意事项

- **`LhBaseProps` 是可选字段**：所有字段都可空，组件按自己需要 extends 并收紧（比如 `type` 在 button 上必填）。
- **`lang` 与全局语言的关系**：`lang` 是组件级覆盖（`<lh-button lang="en-US">`），不调 `lhlocale.setLocale`，由组件内部选语言包。
- **泛型默认值的坑**：`LhTypes<undefined>` 落到 `LhComponentType`——传 `undefined` 泛型参数和传 `string` 字面量结果不同，这是刻意的（`extends string ? ... : ...` 分支）。
- **`LH_LANGUAGE_CONST` 不在 types 公共导出面**：`types/locale.ts` 内部 `import` 它做推导，但 `types/index.ts` 只导出 `./locale` 与 `./components/base`，要用常量从 `@lh-ui/share/constants` 导。
