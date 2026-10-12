---
title: 设计令牌
description: '185 条明色令牌 + 118 条暗色覆盖 + 183 个 SCSS 变量，三层令牌的取值、层级与覆盖关系'
---

import { TokenTable } from '../../components/TokenTable.astro'

令牌（token）是设计语言的变量化：颜色、字号、间距、圆角、阴影、动画时长都命名成 `--lh-*` CSS 变量，组件只消费名字、不写死值。换肤就是换令牌。

## 三层令牌

| 层 | 位置 | 数量 | 求值时机 | 可覆盖性 |
| --- | --- | --- | --- | --- |
| CSS 变量 · 明色 | `styles/theme/common/var.scss` 的 `:root` | **185 条** | 运行时 | ✅ 任意覆盖 |
| CSS 变量 · 暗色 | `styles/theme/common/var-dark.scss` 的 `[data-theme='dark'], .dark` | **118 条** | 运行时 | ✅ |
| SCSS 变量 | `styles/theme/common/variables.scss` | **183 个** | **编译期** | ⚠️ 只能改源码重编译 |

### 明色令牌（var.scss）

```scss
:root {
  --lh-primary-color: #2B5FA6;
  --lh-text-primary: rgba(0, 0, 0, 0.88);
  --lh-bg-color: #ffffff;
  --lh-border-color: #e5e6eb;
  --lh-radius-base: 6px;
  --lh-spacing-base: 8px;
  // ... 185 条
}
```

### 暗色覆盖（var-dark.scss）

```scss
[data-theme='dark'],
.dark {
  --lh-bg-color: #14141F;
  --lh-text-primary: rgba(255, 255, 255, 0.85);
  --lh-border-color: #3A3A4A;
  // ... 118 条
}
```

暗色是**覆盖层**而非独立一套：只写需要翻转的 118 条，其余沿用明色值。

### SCSS 变量（variables.scss）

```scss
$lh-primary-color: #2B5FA6 !default;
$lh-border-radius-base: 6px !default;
// ... 183 个
```

SCSS 变量的用途是**参与编译期计算**：颜色混合（`mix()` / `shade()`）、阴影合成（多层 shadow 相加）这类 CSS 变量做不到的事。代价是**编译期烤死**——暗色下不会自动翻转。

## 令牌的分层结构

令牌按语义分三档：

```scss
// 1. 基础调色板（最底层，不直接被组件用）
--lh-blue-6: #2B5FA6;
--lh-red-6: #F5222D;

// 2. 语义令牌（组件消费这一层）
--lh-primary-color: var(--lh-blue-6);
--lh-error-color: var(--lh-red-6);
--lh-text-primary: rgba(0, 0, 0, 0.88);
--lh-bg-color: #ffffff;

// 3. 组件令牌（个别组件的特化值）
--lh-button-radius: var(--lh-radius-base);
--lh-input-height: 37px;
```

**组件只消费第 2、3 层**。改调色板（第 1 层）会级联影响所有语义令牌——这是换肤的杠杆点。

## 语义域

主要语义域（完整分组见下方令牌表）：

| 域 | 典型令牌 | 用途 |
| --- | --- | --- |
| 主色 | `--lh-primary-color` / `-hover` / `-active` / `-bg` / `-border` | 品牌主色五件套 |
| 文本 | `--lh-text-primary` / `-secondary` / `-tertiary` / `-disabled` | 四级文字层级 |
| 背景 | `--lh-bg-color` / `-page` / `-secondary` / `-overlay` | 页面 / 容器 / 遮罩 |
| 边框 | `--lh-border-color` / `-light` / `-dark` | 描边 |
| 状态 | `--lh-success-color` / `-warning` / `-error` / `-danger` / `-info` | 五个语义色 |
| 圆角 | `--lh-radius-small` / `-base` / `-large` / `-circle` | 四档圆角 |
| 间距 | `--lh-spacing-*` | 8px 基准刻度 |
| 字号 | `--lh-font-size-*` | 字号阶梯 |
| 阴影 | `--lh-shadow-*` | 阴影层级 |
| 动画 | `--lh-animation-duration-*` / `-timing-function` | 过渡节奏 |
| 装饰 | `--lh-decoration-color` | 国风装饰色 |

## 令牌全表

<TokenTable />

（数据由 `scripts/gen-docs-data.mjs` 解析三个令牌文件生成，带数量断言：明色 185、暗色 118、SCSS 183，不匹配即报错。）

## 覆盖令牌

### 运行时（推荐）

```ts
// ConfigProvider 的 themeVars（简写键自动补 --lh- 前缀）
<lh-config-provider :theme-vars="{ 'primary-color': '#1677ff' }">
```

或在应用入口写 CSS：

```css
:root {
  --lh-primary-color: #1677ff;
  --lh-primary-color-hover: #4096ff;
  --lh-primary-color-active: #0958d9;
}
```

详见 [运行时定制](/theme/customization)。

### 编译期（SCSS 变量）

```scss
// 项目入口 scss，在 @use 之前覆盖
$lh-primary-color: #1677ff;

@use '@lh-ui/share/styles';
```

`!default` 的语义是「已有值就不覆盖」，所以在 `@use` 之前赋值即可。**注意**：这只影响编译期烤死的部分，运行时的 CSS 变量仍需另外覆盖。

## 已知的令牌缺口

「高度令牌专项」记录为后续 changeset，本次未动：

1. 各控件高度不统一（input 37 / select 32 / cascader 27→32 / date-time 33 / input-number 32），根因是 `var.scss` 无 `--lh-control-height-*` 令牌。
2. input `--has-label` 的非对称 `padding-top: 16px`。
3. spinner 与 icon 同名尺寸档位不一致（small 16 vs 14）。
4. checkbox 对勾固定 `top:2/left:5` 非 50% 居中（16px 盒下正确，改尺寸即偏）。
5. switch 的 `translate(-50%,-50%)` 在 base 与 keyframes 重复硬编码。

## 注意事项

- **组件不许自行声明 `--lh-*`**：只能 `var(--lh-*, fallback)` 消费（根 AGENTS.md 红线）。新增令牌加在 `var.scss`。
- **fallback 必写**：`var(--lh-primary-color, #1677ff)`——令牌缺失时仍有可接受的默认值，`verify:styles` 第 2 项（var fallback）把关。
- **暗色完备性**：新增令牌要问「暗色下要不要翻转」，要的话在 `var-dark.scss` 补覆盖，`verify:styles` 第 7 项把关。
- **值形如 `#{$lh-foo}` 的令牌是编译期烤死的**：暗色下不自动翻转，必须显式重指向（详见 [暗色模式](/theme/dark-mode#编译期烤死陷阱)）。

## 相关文档

- [主题系统总览](/theme/overview)
- [主题预设](/theme/presets)
- [运行时定制](/theme/customization)
- [暗色模式](/theme/dark-mode)
- [样式源](/reference/styles)
