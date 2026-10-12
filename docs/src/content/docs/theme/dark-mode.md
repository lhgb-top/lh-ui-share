---
title: 暗色模式
description: 'data-theme=dark 切换机制、编译期烤死陷阱与 verify:styles 第七项暗色可达性门禁'
---

import { TokenTable } from '../../components/TokenTable.astro'

lh-ui 的所有组件**默认支持明色与暗色**。这不是事后追加的主题，而是令牌系统的设计前提。

## 切换机制

暗色的开关是 CSS 选择器，不是 JS：

```scss
// styles/theme/common/var-dark.scss
[data-theme='dark'],
.dark {
  --lh-bg-color: #14141F;
  --lh-text-primary: rgba(255, 255, 255, 0.85);
  // ... 118 条覆盖
}
```

两种触发方式：

```html
<!-- 方式一：data 属性（推荐，语义清晰） -->
<html data-theme="dark">

<!-- 方式二：class（兼容老代码 / 第三方切换库） -->
<body class="dark">
```

UI 层（各库的 ConfigProvider 或业务代码）只要切这个属性 / 类名，**所有组件立即变色**——CSS 变量是运行时求值的，没有重渲染开销。

```ts
function toggleDark(isDark: boolean) {
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
}
```

## 暗色是覆盖层

暗色文件只写 **118 条**，不是完整一套 185 条。只覆盖需要翻转的令牌，其余沿用明色值。

设计原则是**语义令牌重指向，而非逐组件重写**：

```scss
// ✅ 好的做法：暗色下指向暗色语义令牌
[data-theme='dark'],
.dark {
  --lh-menu-item-color: var(--lh-text-primary);
  --lh-table-cell-color: var(--lh-text-primary);
}

// ❌ 坏的做法：在暗色里写死一个具体颜色
[data-theme='dark'],
.dark {
  --lh-menu-item-color: rgba(255, 255, 255, 0.85);   // 与 text-primary 脱钩，后续调色要改两处
}
```

## 编译期烤死陷阱

这是暗色模式**最容易踩的坑**，也是 `verify:styles` 第 7 项存在的理由。

### 陷阱原理

`var.scss` 里值形如 `#{$lh-foo}` 的令牌：

```scss
// var.scss
:root {
  --lh-menu-item-color: #{$lh-menu-item-color};   // SCSS 变量在编译期被替换成具体明色值
}
```

SCSS 变量在**编译期被烤死成字面值**，等价于：

```scss
:root {
  --lh-menu-item-color: rgba(0, 0, 0, 0.88);   // 暗色下不会自动翻转！
}
```

结果：暗色模式下菜单 / 表格 / 时间线的文字沿用明色值，**黑底黑字，不可见**。这类缺口曾真实出现过，补缺记录见 0.4.0 的 changeset。

### 解法

在 `var-dark.scss` 显式重新指向暗色语义令牌：

```scss
[data-theme='dark'],
.dark {
  --lh-menu-item-color: var(--lh-text-primary);
}
```

### 链式回落是运行时求值，安全

组件 SCSS 里的链式回落：

```scss
.lh-button {
  color: var(--lh-foo, var(--lh-bar, #333));
}
```

`var()` 的回落是**运行时求值**的：只要链上任一令牌有暗色覆盖，整个链就跟随翻转。**无需重复声明**。

对照表：

| 写法 | 求值时机 | 暗色行为 |
| --- | --- | --- |
| `var(--lh-foo, fallback)` | 运行时 | ✅ 链上令牌有暗色覆盖即翻转 |
| `#{$lh-foo}`（SCSS 插值） | 编译期 | ❌ 烤死成明色，需在 var-dark 显式重指向 |
| `mix($lh-a, $lh-b)` 等 SCSS 函数 | 编译期 | ❌ 同上 |

## 深主色预设的暗色提亮

五个内置预设中，深主色的（青花瓷 / 朱砂 / 水墨）在暗色下主色会「沉进」页面底色。`buildPresetDarkVars` 自动处理：

判定规则：`--lh-primary-color` 相对暗色页面底 `#1A1A2E`（`DARK_PAGE_BG`）的对比度 < 3（`DARK_PRIMARY_CONTRAST_THRESHOLD`）即判定深主色，然后：

```css
[data-theme='dark'],
.dark {
  --lh-primary-color: color-mix(in srgb, <字面值> 55%, #fff);   /* 提亮 55% */
  --lh-primary-color-hover: color-mix(in srgb, var(--lh-primary-color) 70%, #fff);
  --lh-primary-color-active: color-mix(in srgb, var(--lh-primary-color) 85%, #000);
  --lh-color-on-primary: #101410;   /* 提亮后白字对比度反而不足，改墨字 */
  --lh-primary-color-bg: color-mix(in srgb, var(--lh-primary-color) 25%, transparent);
  --lh-selected-color: color-mix(in srgb, var(--lh-primary-color) 40%, #fff);
}
```

**为什么主色提亮用字面值不用 `var()`**：`color-mix(in srgb, var(--lh-primary-color) 55%, #fff)` 会形成 CSS 自引用循环（`--lh-primary-color` 的值里引用了自己）。所以这一条**代入字面值**，其余用 `var()` 跟随当前主色。

浅主色预设（松花绿 / 藤黄）不需要提亮，但仍会拿到 `--lh-primary-color-bg` 与 `--lh-selected-color` 的暗色重定义。

## 预设注入的顺序语义

`buildPresetStyleText` 生成的文本是 `:root { ... }` 块在前、`[data-theme='dark'], .dark { ... }` 块在后。**同特异性下后者胜**，所以浅主色预设在 `:root` 里声明的 `--lh-selected-color` 明色值不会泄漏进暗色。

这也是「只能写 `<style>` 不能写内联 style」的根因——内联 style 特异性 1,0,0,0 压过 `var-dark.scss` 的整段暗色变量，暗色直接失效（详见 [主题总览](/theme/overview#注入约束只能写-style不能写内联-style)）。

## 暗色令牌表

<TokenTable mode="dark" />

## 如何验证暗色完备性

三个手段，从弱到强：

1. **`pnpm verify:styles` 第 7 项（暗色可达性）**：静态扫描，找出「明色烤死但 var-dark 无覆盖」的令牌。这是 CI 门禁。
2. **`pnpm verify:theme`（AA 4.5:1）**：读 `es/` 产物，算预设主题在明暗两色下的对比度。需先 `pnpm build`。CI 不跑，手动把守。
3. **目视检查**：docs 站 / 各库 playground 切暗色模式逐组件看。

新增令牌时的自查清单：

- [ ] 这个令牌暗色下需要翻转吗？
- [ ] 需要的话在 `var-dark.scss` 补了覆盖吗？
- [ ] 它的值是 `#{$lh-*}` 插值吗？（是 → 必须补暗色覆盖）
- [ ] 组件里消费它用的是 `var(--lh-x, fallback)` 链吗？

## 已知遗留

暗色完备性在 0.4.0 做过一次系统性补缺（菜单 / 表格 / 时间线等文字不可见问题，见 changeset）。剩余已知项随「高度令牌专项」待后续处理。

## 相关文档

- [主题系统总览](/theme/overview)
- [设计令牌](/theme/tokens)
- [主题预设](/theme/presets)
- [样式源](/reference/styles)
- [verify:styles 六项](/development/verification)
