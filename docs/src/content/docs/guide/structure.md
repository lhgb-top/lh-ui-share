---
title: 包结构
description: src / styles / tests / scripts 的目录职责，以及 56 与 58 两个组件计数口径
---

# 包结构

## 源码侧

```
lh-ui-share/
├── src/
│   ├── core/                  组件纯函数层（零框架导入，CI grep 门禁）
│   │   ├── <组件>/            logic.ts / types.ts / index.ts 三件套
│   │   └── shared/            跨组件共享内核（12 模块，已规范化为 <name>/index.ts）
│   ├── theme/                 主题 TS 侧：types + 5 个预设 + 运行时原语
│   ├── constants/             LH_* 常量（LH_SIZE_DEFAULT / LH_LANGUAGE_DEFAULT …）
│   ├── locales/               LhLocale（纯 emitter）+ lang/ 六语言骨架
│   ├── types/                 公共类型（locale / components）
│   ├── utils/                 纯工具（createNamespace / deepMerge …）
│   └── index.ts               全量聚合入口
├── styles/                    组件 BEM 样式唯一源
│   ├── <组件>/index.scss      58 套组件样式
│   └── theme/
│       ├── common/
│       │   ├── var.scss       明色令牌（:root，185 个 --lh-*）
│       │   ├── var-dark.scss  暗色覆盖（[data-theme='dark'], .dark，118 条）
│       │   ├── variables.scss 183 个 $lh-* SCSS 变量（!default）
│       │   ├── patterns.scss  6 个国风花纹 mixin
│       │   ├── transition.scss 三个过渡类名 mixin（收编两端差异）
│       │   └── a11y.scss      无障碍辅助样式
│       └── index.scss         主题聚合
│   └── index.scss             全量聚合（令牌 + 全部组件，脚本生成，勿手改）
├── tests/unit/                core 单测唯一份（三库共享，不重复拷贝）
├── scripts/                   构建与校验脚本
├── docs/                      本文档站（Astro Starlight）
└── .changeset/                待发布 changeset
```

## 各目录职责

| 目录 | 职责 | 红线 |
| --- | --- | --- |
| `src/core/<name>/` | 组件纯函数：类名计算 / 状态机 / aria 属性包 | 禁 `import 'vue' \| 'react' \| '@dcloudio/*'` |
| `src/core/shared/` | 跨组件内核，被各端直接复用 | 同上；已规范化为 `<name>/index.ts` |
| `styles/` | 组件 BEM 样式**唯一源** | 禁止把样式拷到 UI 库手改；类名 `lh-*`；颜色一律 `var(--lh-*, fallback)` |
| `tests/unit/` | core 单测**唯一一份** | UI 库不得复制 |
| `scripts/` | extract-from-plus（一次性） / build-styles / verify-* / release | — |

## 组件计数口径：56 还是 58

两个数字都对，量的不是同一件事：

| 口径 | 数字 | 来源 |
| --- | --- | --- |
| core 纯函数组件 | **56** | `src/core/` 下的组件目录（不含 `shared/`） |
| 组件样式套数 | **58** | `styles/` 下的组件目录（不含 `theme/`） |

差异是这三个：

| 名字 | core | styles | 原因 |
| --- | --- | --- | --- |
| `layout` | — | ✅ | 布局容器，逻辑全在 UI 层（row/col 的响应式断点接线） |
| `tree-select` | — | ✅ | 选择器胶水在框架侧，树数据逻辑复用 `core/tree` |
| `config` ↔ `config-provider` | `config` | `config-provider` | 同一个东西两个目录名 |

## 构建产物

`pnpm build` 产出四个目录，`files` 只发这四个：

| 产物 | 结构 | 说明 |
| --- | --- | --- |
| `es/` | preserveModules 镜像 `src/` | ESM，子路径逐文件按需 |
| `lib/` | 同上 | CJS（`require` 条件） |
| `dist/` | `dist/theme/*.css` `dist/styles/index.css` | 聚合样式产物 |
| `styles/` | 原样随包发 | **SCSS 源码**，供项目自编 |

产物保持**零框架依赖**：`verify:dts` 会扫 `es/**/*.d.ts`，出现任何框架导入即失败。

## 单组件产物的样子（以 button 为例）

```
es/button/
├── index.d.ts        类型
├── index.js          ESM
├── logic.d.ts
├── logic.js
├── types.d.ts
└── style/
    ├── index.css     编译好的组件样式（plus 端形态）
    └── index.scss    源码（@use 已改写为 bare specifier，随产物分发）
```

`lib/button/` 同构。两端 UI 库各自再包一层 `es/components/<name>/style/index.css`
（vue2 端只发 css，不发 scss）。
