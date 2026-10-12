---
title: 快速开始
description: '安装 @lh-ui/share、按需导入纯函数、四种引入样式的方式'
---

# 快速开始

## 安装

```bash
pnpm add @lh-ui/share
# 或 npm i @lh-ui/share / yarn add @lh-ui/share
```

本包 `external: []`，**没有任何运行时依赖**，装完即可用，不需要先 peer-install 框架。

## 引入逻辑（JS / TS）

### 裸导入：全量

```ts
import { lhlocale, createNamespace, LH_THEME_PRESETS } from '@lh-ui/share'
```

全量入口 `./es/index.js`（CJS 走 `./lib/index.js`）。本包 `sideEffects` 只声明了
`**/*.css` 与 `**/*.scss`，纯 JS 模块可被 tree-shaking，不会因全量导入打进多余代码。

### 子路径导入：按组件（推荐）

```ts
import { getButtonClasses, getButtonAria } from '@lh-ui/share/core/button'
import { sxToStyle } from '@lh-ui/share/core/shared/sx'
import { lhlocale } from '@lh-ui/share/locales'
import { LH_THEME_PRESETS, buildPresetStyleText } from '@lh-ui/share/theme'
```

每个子路径都有独立的 types / import / require 三条件导出，按需引入只会打进那一个组件
的纯函数。完整键表见[包入口与子路径](/guide/exports)。

## 引入样式（四种方式）

本包 `files` 只发 `es / lib / dist / styles` 四个目录，样式有两条路径可引：

### 1. 全量主题（最省心）

```ts
// 只有令牌，不含任何组件样式，体积最小
import '@lh-ui/share/theme.css'       // 明色 :root 令牌
import '@lh-ui/share/theme-dark.css'  // 暗色 [data-theme='dark'] 覆盖
```

适合「只想要设计令牌、组件样式自己写」的项目。

### 2. 全量主题 + 全量组件样式

```ts
import '@lh-ui/share/styles.css'      // dist/styles/index.css：令牌 + 全部 58 套组件
```

`dist/index.css` 是构建期聚合的最终产物，一条 import 拿到完整视觉。

### 3. SCSS 源码按需引（要打包器能编 SCSS）

```scss
// 全量聚合（主题令牌 + 全部组件）
@use '@lh-ui/share/styles/index.scss';

// 单组件：只编这一套，产物体积最小
@use '@lh-ui/share/styles/button';
```

`styles/` 目录随包发布的是**源码**，可被 vite / webpack 的 sass loader 实时编译，
方便在项目里 `@use` 令牌做定制。

### 4. 只引令牌做深度定制

```scss
@use '@lh-ui/share/styles/theme/common/var.scss' as *;

.my-panel {
  color: $lh-text-primary;
  border: 1px solid $lh-border-color;
}
```

`styles/theme/common/` 暴露 183 个 `$lh-*` SCSS 变量与 6 个国风花纹 mixin，
详见[设计令牌](/theme/tokens)与[花纹系统](/theme/patterns)。

## TypeScript

所有子路径都带 `types` 条件，无需额外 `@types` 包：

```ts
import type { LhThemePreset, LhThemeVars } from '@lh-ui/share/theme'
import type { LhSxProps } from '@lh-ui/share/core/shared/sx'
```

类型导出单独走 `./es/**/*.d.ts`，`import type` 不会把实现打进产物。

## 跑一个纯函数看看

不需要任何框架，Node 里就能跑：

```ts
import { getButtonClasses } from '@lh-ui/share/core/button'

getButtonClasses({ size: 'small', type: 'primary', disabled: true })
// => 'lh-button lh-button--small lh-button--primary is-disabled'
```

想交互式试？文档站里每个组件页都带**函数试玩**面板，改参数实时看输出——
比如 [steps 函数试玩](/components/navigation/steps)。

## 暗色模式

本包组件不自己开关暗色，只认 CSS 变量。在根节点加属性即全站翻转：

```html
<html data-theme="dark">
  <!-- 或 <body class="dark">，两种选择器 var-dark.scss 都覆盖 -->
</html>
```

原理与「编译期烤死」陷阱见[暗色模式](/theme/dark-mode)。
