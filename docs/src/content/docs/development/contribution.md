---
title: 贡献指南
description: '六条红线、命名规范、提交信息约定与提 PR 前的自查清单'
---

欢迎给 @lh-ui/share 提交改动。本文是参与协作的**硬约束**——大部分约定不是风格偏好，而是跨四个 UI 库能正常工作的前提。

## 六条红线

### 1. `src/` 禁止任何框架依赖

```ts
// ❌ 绝对禁止
import { ref } from 'vue'
import { useState } from 'react'
import { ... } from '@dcloudio/uniapp'

// ✅ 只允许纯函数与类型
export function computeSomething(input: Foo): Bar { ... }
```

**为什么**：share 是家族**唯一的框架无关共享层**。一处 `import 'vue'`，React 版与 uniapp 版就废了。CI 有 grep 门禁。

响应式接线属于各 UI 层（`ref()` / `useState()` / `useSyncExternalStore()`），core 只输出纯数据。参考 [lhlocale 的设计](/reference/locales#各端怎么订阅-version)：一个纯事件发射器，各端自己转成重渲染信号。

### 2. `styles/` 是组件样式唯一源

- 禁止把样式拷贝到任何 UI 库手改。
- **一切样式改动只在本仓库发生**。

跨端过渡类名差异由 [三个 transition mixin](/reference/transition-mixins) 收编，**组件样式禁止再手写双份类名**，一律 `@include`。需要把状态挂在后代节点上时传第二个参数。

### 3. core 单测唯一一份

`tests/unit/` 是**三库共享**的测试结果。UI 库不得复制本仓的 core 单测。

### 4. ~~1px 细边框必须带 `/* hairline */` 标记~~ —— **已废止**

uniapp v3 px 直出，不再转译 rpx，hairline 标记失去用途（见 `docs/bugfix-log.md` D-02）。`styles/` 内既有的 65 处历史标记保留为普通注释，**新增 1px 边框无需标记**。结构性边框（2px / 3px）原本就不标记。

### 5. 版本发布顺序：share 先，UI 库后

share 改动 → changeset → 发版 → 各库 `pnpm up @lh-ui/share` 回归。**不能跳过**——UI 库的发版依赖已发布的 share tarball。

### 6. 自研符号必须带 LH 前缀

新增常量 / 类型 / 接口时**即遵守**，不要留到事后统一改（历史改名见 `lh-prefix-naming` changeset）。

## 命名规范

与 plus 仓 `docs/project/development-guide.md` 对齐，全家族统一：

| 层 | 规范 | 示例 |
| --- | --- | --- |
| 反域名根 | `top.lhgb`（反写 `www.lhgb.top`） | 家族所有仓的命名根；`package.json` 的 homepage / repository / author 用 `lhgb.top` |
| JS / npm 包名 | `@lh-ui/*` scope | npm 包名不允许点号，反域名落元信息层 |
| 常量 | `LH_XXX`，`LH_<模块>_<概念>` | `LH_SIZE_DEFAULT`、`LH_THEME_PRESETS` |
| 默认值常量 | `DEFAULT` 后缀 | `LH_DRAWER_DIRECTION_DEFAULT` |
| 类型 / 接口 | `LhXxx` | `LhThemePreset`、`LhSxProps` |
| 模块级单例 / 小写对象 | `lhXxx` | `lhlocale` |
| BEM 类名 | `lh-xxx` | `lh-button__text--disabled` |
| 组件 name | `LhXxx` | `name: 'LhButton'` |

### 豁免登记

约定俗成、不强制加前缀的（改动前在此登记理由）：

- **语言包导出 `zhCN` / `enUS`** —— 标准 locale 命名，且被三个 UI 库作为公开 API 再导出，改名破坏面过大。
- **主题预设名的字符串值**（`name: 'cerblue'` 等）—— 这是用户在 ConfigProvider `theme` 里写的配置值，改了破坏所有下游用户配置；对应的 **TS 标识符仍加前缀**（`LhCerblue`）。
- **第三方依赖的导出符号** 不强制。

## 目录职责

| 目录 | 职责 |
| --- | --- |
| `src/core/<name>/` | 组件纯函数逻辑（`logic.ts` / `types.ts` / `index.ts`），零框架导入 |
| `src/core/shared/` | 跨组件共享内核（12 个模块，见 [总览](/core/overview)） |
| `src/theme/` | theme TS 侧（类型 + 五个预设） |
| `src/constants/` / `src/locales/` / `src/types/` / `src/utils/` | 常量 / 语言包 / 类型 / 纯工具 |
| `styles/` | 组件 BEM 样式唯一源（`<name>/index.scss` + `theme/common/*.scss`） |
| `tests/unit/` | core 单测唯一一份 |
| `scripts/` | 构建与校验脚本 |
| `docs/` | 文档站（Astro Starlight），**不进 npm 产物** |

## 提交信息约定

- **注释与提交信息用中文**。
- **提交信息写 markdown 源码且非常详细**：标题行 + 范围说明 + 新增 / 修改文件清单 + 设计要点表格 + 验证状态。
- Prettier 配置：单引号、无分号、2 空格、printWidth 100。`pnpm format` 只覆盖配置文件，其余手写对齐。

## 新增 core 组件清单

1. `src/core/<name>/{logic,types,index}.ts` 三件套
2. `tests/unit/core/<name>.spec.ts`
3. `src/core/index.ts` 加导出
4. `styles/<name>/index.scss`（否则某端无样式产物，静默跳过）
5. changeset（minor）

然后跑：

```bash
pnpm test && pnpm lint && pnpm typecheck
pnpm build                    # sync:exports 生成新的 exports 键
pnpm verify:dts && pnpm verify:styles
```

## 提 PR 前的自查清单

- [ ] `src/` 内没有任何 `import 'vue' | 'react' | '@dcloudio/*'`（红线 1）
- [ ] 样式改动只在 `styles/`（红线 2）
- [ ] 颜色一律 `var(--lh-*, fallback)`，无新增硬编码色值
- [ ] 新增过渡类名用 mixin，不裸写 `-enter-from` / `-leave-from`
- [ ] 新增令牌在 `var.scss`；若值是 `#{$lh-*}` 插值，`var-dark.scss` 有对应覆盖
- [ ] 新增符号带 `LH` / `Lh` 前缀（红线 6）
- [ ] `pnpm test` / `pnpm lint` / `pnpm typecheck` 通过
- [ ] `pnpm build` 后 `pnpm verify:dts` / `pnpm verify:styles` 通过
- [ ] 有 changeset，级别正确
- [ ] 新组件有 `styles/<name>/index.scss` 且 `tests/unit/core/<name>.spec.ts` 存在（红线 3）
- [ ] 若改了令牌 / 类名 / 图标，跑了 `pnpm docs:data` 刷新文档数据

## 已知待办（记录为后续 changeset，欢迎认领）

「高度令牌专项」：

1. 各控件高度不统一（input 37 / select 32 / cascader 27→32 / date-time 33 / input-number 32），根因是 `var.scss` 无 `--lh-control-height-*` 令牌
2. input `--has-label` 的非对称 `padding-top: 16px`
3. spinner 与 icon 同名尺寸档位不一致（small 16 vs 14）
4. checkbox 对勾固定 `top:2/left:5` 非 50% 居中（16px 盒下正确，改尺寸即偏）
5. switch 的 `translate(-50%,-50%)` 在 base 与 keyframes 重复硬编码

## 相关文档

- [项目介绍](/guide/introduction) —— share 在家族里的位置
- [命名约定](/guide/naming) —— 命名规范的完整版
- [各端样式注入策略](/guide/injection) —— 红线 2 的落地机制
- [验证体系](/development/verification) —— PR 前要跑的校验
- [发布流程](/development/release) —— 红线 5 的完整流程
