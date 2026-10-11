---
title: 项目介绍
description: '@lh-ui/share 是什么、解决什么问题、在 lh-ui 家族里的位置'
---

# 项目介绍

**`@lh-ui/share` 是 lh-ui 组件家族唯一的框架无关共享层。**

它把组件库里「与框架无关的那一半」抽出来单独立仓：类名计算、状态机、无障碍属性包、
定位引擎、虚拟滚动、主题令牌、国际化文案、组件样式源。各端 UI 库（lh-ui-plus /
lh-ui-vue2 / lh-ui-react / lh-ui-uniapp）发布态以 npm 依赖消费本包，家族内本地开发
改本仓源码在各 UI 库即时生效，无需构建或发版。

## 为什么需要这一层

组件库的逻辑其实只有一小部分真正依赖框架响应式：

- 某个类名该不该加，是 `(size, disabled) => string` 的纯计算；
- 下拉面板该往哪边翻转，是几何计算；
- 列表该渲染哪几行，是索引区间计算；
- 「确定」按钮的文案，是语言包查表。

把这些沉淀成纯函数，四个端就**不用各写一遍、各错一遍、各修一遍**。框架层只剩一件事：
把纯函数的输出绑到模板上，把用户的输入喂回纯函数。

## 仓库里有什么

| 层 | 内容 | 计数 |
| --- | --- | --- |
| `src/core/<组件>/` | 组件纯函数（logic.ts / types.ts），零框架导入 | 56 个组件 |
| `src/core/shared/` | 跨组件共享内核（popper / virtual / sx / keyboard / focus-trap …） | 12 个模块 |
| `src/theme/` | 主题 TS 侧：类型 + 5 个预设 + 运行时原语 | — |
| `styles/` | 组件 BEM 样式**唯一源** + `theme/common/*.scss` 令牌 | 58 套组件样式 |
| `src/locales/` | 国际化（LhLocale 为纯事件发射器）+ 6 语言骨架 | — |
| `src/constants/` `src/types/` `src/utils/` | 常量 / 类型 / 纯工具（含 createNamespace） | — |

> **计数口径**：core 是 56 个组件目录，styles 是 58 套——`layout` / `tree-select` 有
> 样式源但逻辑全在 UI 层（布局容器、树型选择器的框架侧胶水），`config` 在样式目录里
> 叫 `config-provider`。详见[包结构](/guide/structure)。

## 设计原则

1. **零框架依赖**：`src/` 内禁止 `import 'vue' | 'react' | '@dcloudio/*'`，由 CI grep
   门禁把守。本包 `external: []`，全量零依赖打包。
2. **样式单源**：`styles/` 是全家族组件 BEM 样式唯一源，任何 UI 库不得在本地持有组件
   scss 副本。跨端过渡类名差异由 `transition.scss` 的三个 mixin 收编。
3. **单测唯一份**：core 单测只在本仓 `tests/unit/`，三库共享此结果，不重复拷贝。
4. **响应式归 UI 层**：core 只产出数据，订阅 / 响应式接线属于各 UI 库。LhLocale 因此
   是纯 emitter，靠 `version` 自增让各端用各自机制重渲染。
5. **明暗同价**：所有组件默认支持明色与暗色，组件只许 `var(--lh-*, fallback)` 消费令牌，
   暗色完备性由 `verify:styles` 第 7 项把守。

## 它不是什么

- **不是 UI 库**：本包不渲染任何东西，没有组件运行时。要能直接用的组件，去装
  `@lh-ui/vue3` / `@lh-ui/vue2` 等各端库。
- **不依赖任何 UI 库、任何框架**：它是最底层，被依赖而不依赖人。
- **不负责部署态**：主题定制产出的是 `<style>` 文本与 CSS 变量，怎么注入 DOM 由各端
   ConfigProvider 决定。

## 家族布局

```
lh-ui/
├── lh-ui-share/      ← 本仓：框架无关共享层（core / theme / styles / locales）
├── lh-ui-plus/       Vue3 端（全量 side-effect 注入样式）
├── lh-ui-vue2/       Vue2 端（按需引 theme.css + style/<name>）
├── lh-ui-react/      React 端
├── lh-ui-uniapp/     uniapp 端
├── docs/             家族文档站（另一仓）
└── native/           原生端（android / ios / harmony，applicationId 用 top.lhgb.*）
```

发版顺序是硬约束：**share 先发版，UI 库随其后**。share 一改 → 写 changeset → 发版 →
各库 `pnpm up @lh-ui/share` 回归。

## 下一步

- [快速开始](/guide/getting-started) —— 装 包、引样式、跑起第一个纯函数
- [包入口与子路径](/guide/exports) —— 77 个导出键怎么按需挑
- [各端如何消费](/guide/consumption) —— Vue3 / Vue2 / React / uniapp 接线样例
