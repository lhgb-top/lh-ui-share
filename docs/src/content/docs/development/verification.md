---
title: 验证体系
description: 'verify:dts / verify:styles 六项 / verify:theme AA 门禁 / verify:versions 各自查什么、怎么读输出'
---

lh-ui 的「验证」不是走个过场——每项都在拦一类**曾经真实出现过**的回归。本文逐项说明查什么、失败输出怎么读。

## verify:dts —— 产物类型一致性

```bash
pnpm verify:dts
```

**查什么**：`es/` / `lib/` 里编译出的 `.d.ts` 与源码类型声明一致，且 exports 键指向的文件真实存在。

**典型失败**：

- 改了源码类型但没重跑 `pnpm build`（产物是旧的）
- `sync:exports` 生成了 exports 键，但对应文件没被构建出来（路径拼错）
- `import type` 写成了 `import`，产物里多带了一份运行时代码

**修法**：`pnpm build` 完整重跑，再 `pnpm verify:dts`。

## verify:styles —— 六项

```bash
pnpm verify:styles
```

脚本：`scripts/verify-styles.mjs`。六项顺序执行，任一项失败即退出。

### 1. EP 调色板

查颜色令牌是否落在家族调色板的合法色阶上，不出现游离的「野生颜色」。设计意图是让所有界面的颜色**可解释**（这个蓝是 blue-6，不是随手挑的）。

### 2. var fallback

查组件 scss 里每个 `var(--lh-*)` 是否带回落值：

```scss
// ✅ 通过
color: var(--lh-text-primary, rgba(0, 0, 0, 0.88));

// ❌ 失败
color: var(--lh-text-primary);
```

**为什么**：令牌缺失（用户只用部分样式、旧版本令牌不存在）时，无回落的 `var()` 会解析成无效值，属性被丢弃——文字变默认黑色、边框消失。带回落保证「降级可用」。

### 3. @use 令牌

查组件 scss 是否通过 `@use` 引令牌层，而不是散落 hex 字面量：

```scss
// ✅ 通过
@use 'theme/common/var' as *;
.lh-card { background: var(--lh-bg-color, #fff); }

// ❌ 失败
.lh-card { background: #ffffff; }
```

**豁免**：`var()` 的回落值允许写 hex（那是降级用的）。失败信息会列出文件与行号。

### 4. 聚合一致

查 `styles/index.scss`（全量聚合）与「扫描 `styles/*/index.scss` 得到的组件清单」一致。**`styles/index.scss` 是 `scripts/build-styles.mjs` 生成的，不要手改**——新增组件目录后没重跑生成就会不一致。

### 5. 过渡类名单源

查组件 scss 里是否**裸写**了 `-enter-from` / `-leave-from` 字面量：

```scss
// ❌ 失败：手写双份过渡类名
.lh-dialog-fade-enter-from { opacity: 0; }

// ✅ 通过：用 mixin
@include lh-enter-both('.lh-dialog-fade') { opacity: 0; }
```

**为什么**：Vue2 用 `-enter`、Vue3/React 用 `-enter-from`，手写必然漏一端（详见 [transition-mixins](/reference/transition-mixins)）。曾经 16 个组件各写双份，改一处漏一处。

### 6. 暗色可达性

查 `var.scss` 里值形如 `#{$lh-foo}`（编译期烤死成明色）的令牌，在 `var-dark.scss` 里**是否有对应覆盖**。

**这是最关键的一项**。这类缺口曾导致暗色下菜单 / 表格 / 时间线文字沿用明色值而**不可见**（黑底黑字）。详见 [暗色模式的编译期烤死陷阱](/theme/dark-mode#编译期烤死陷阱)。

**注意**：曾经有过一次误报修复——verify:styles 索引错位误报 `no-fallback` 豁免行（提交 `791ff32`）。如果失败信息看起来不合理（被豁免的行还报错），先确认是不是这个已知问题。

## verify:theme —— AA 对比度门禁

```bash
pnpm build          # ← 必须先跑，读 es/ 产物
pnpm verify:theme
```

脚本：`scripts/verify-theme-contrast.mjs`。

**查什么**：五个内置主题（及其暗色变体）中，所有「文字 / 背景」配对的 WCAG 对比度 ≥ **4.5:1**（AA 级）。

**为什么必须读 es/ 产物**：预设主题的 vars 在构建后才是最终形态（`buildPresetDarkVars` 的推导结果也在产物里）。

**典型失败**：

- 新预设的浅主色没给 `--lh-color-on-primary`（白字在浅主色上只有 3.x:1）
- 选中态文字色（`--lh-selected-color`）在悬停底色上对比度不足

**修法**：调深 / 调浅相关色值，直到对比度达标。`getContrastRatio()` 与 `getRelativeLuminance()`（`src/theme/themes/index.ts` 导出）可以在本地算，不必每次都跑全量门禁。

**CI 不跑这项**——它需要先 build，且算力不小。本地发版前手动把守。

## verify:versions —— 版本一致性

```bash
pnpm verify:versions
```

脚本：`scripts/check-version-sync.mjs`。

**查什么**：lh-ui-plus / lh-ui-vue2 的 `package.json` 里 `@lh-ui/share` 的依赖范围**覆盖 share 当前版本**。

**当前状态**：share 是 `0.3.0` 时通过。**发 0.4.0 之后会失败**——因为两个 UI 库的依赖范围还是 `^0.3.0`。这是**预期行为**：按 [红线 5](/development/contribution#六条红线)（share 先发版，UI 库随其后），发版后去两兄弟仓各自 `pnpm up @lh-ui/share@0.4.0` 并回归。

## lint 与 typecheck

| 命令 | 扫描范围 |
| --- | --- |
| `pnpm lint` | `src` / `tests` / `scripts` / `vite.config.ts` / `vitest.config.ts` |
| `pnpm typecheck` | `src/**/*`（`tsconfig.json` 的 include） |

**`docs/` 不在扫描范围内**——文档站是独立 Astro 项目，质量由 `pnpm docs:build` 把关。同理 `styles/` 不在 typecheck 范围（SCSS 由 verify:styles 管）。

**lint 的框架依赖门禁**：CI 会 grep `src/` 里是否出现 `import 'vue'` / `import 'react'` / `@dcloudio/*`——这是 [红线 1](/development/contribution#六条红线)，core 必须框架无关。

## 测试

```bash
pnpm test
```

`tests/unit/` 是 **core 单测唯一一份**（红线 3）：三库共享结果，UI 库不得复制。纯函数测试不需要渲染组件——造 rect 字面量、断言输出，四端共享同一份断言。

关键测试文件：

| 文件 | 覆盖 |
| --- | --- |
| `theme.spec.ts` | 预设一致性（JS vars 与 SCSS 变量双源同步） |
| `core/*.spec.ts` | 各 core 组件逻辑 |
| `shared/*.spec.ts` | 共享内核算法（popper / keyboard / virtual 等） |

## 验证全跑一遍

发版前的完整清单：

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build                    # 注意 sync:exports 会改 package.json
pnpm verify:dts
pnpm verify:styles            # 六项
pnpm verify:theme             # 需先 build
pnpm verify:versions          # 发版后会转下游处理
pnpm docs:build               # 文档站
```

`prepublishOnly`（`pnpm release` 会触发）只含 build + verify:dts + verify:styles。所以 **test / lint / typecheck / verify:theme 必须显式手动跑**。

## 相关文档

- [命令一览](/development/commands)
- [构建脚本](/development/scripts)
- [发布流程](/development/release)
- [暗色模式](/theme/dark-mode)
- [样式源](/reference/styles)
