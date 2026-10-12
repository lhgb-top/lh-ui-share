---
title: 构建与工具脚本
description: 'scripts/ 下 13 个 mjs 脚本的职责：build-styles / sync-exports / verify-* / gen-docs-data / push-release'
---

`scripts/` 是构建与校验的引擎层。`package.json` 的命令大多是对这些脚本的薄封装，直接跑脚本可以加参数调试。

## 脚本总览

| 脚本 | 命令封装 | 职责 |
| --- | --- | --- |
| `build-styles.mjs` | `pnpm build:styles` | 编译 share scss → `dist/theme/` + `dist/styles/` |
| `sync-exports.mjs` | `pnpm sync:exports`（含于 `pnpm build`） | 按源码目录结构生成 `package.json` 的 exports |
| `verify-dts.mjs` | `pnpm verify:dts` | 产物 dts 与源码类型一致 |
| `verify-styles.mjs` | `pnpm verify:styles` | scss 六项校验（见 [验证体系](/development/verification)） |
| `verify-theme-contrast.mjs` | `pnpm verify:theme` | 主题 AA 4.5:1 对比度门禁 |
| `check-version-sync.mjs` | `pnpm verify:versions` | 各 UI 库依赖范围覆盖 share 当前版本 |
| `gen-docs-data.mjs` | `pnpm docs:data` | 解析令牌 / 图标 / 类名 → `docs/src/data/*.json` |
| `push-release.mjs` | `pnpm release:push` | 推 master + tag 到 GitHub，触发留档 |
| `release-notes.mjs` | — | 生成发行版说明 |
| `extract-from-plus.mjs` | `pnpm extract` | **一次性脚本**：从 plus 仓提取共享层（历史用） |
| `normalize-styles.mjs` | — | 样式规范化（历史一次性） |
| `patch-var-fallbacks.mjs` | — | 批量补 `var()` 回落值（历史一次性） |

## sync-exports.mjs —— exports 键的生成器

**这是最容易出问题的一个脚本**。

`@lh-ui/share` 的 `package.json` 有 77 个 exports 键（`./core/button/*` 这类子路径），全部由这个脚本按 `src/` 与 `styles/` 的目录结构**扫描生成**。

**流程**：`vite build` 产物落盘 → `sync:exports` 扫描 `es/` 目录结构 → 重写 `package.json` 的 `exports` / `files` 字段。

**为什么重要**：

- 新增 `src/core/foo/bar.ts`，dev 期（走源码 alias）立即可用，但 **npm 侧没有对应 exports 键**——下游 `pnpm up` 后 MODULE_NOT_FOUND。
- **发版前必须跑完整 `pnpm build`**（含 sync:exports），不能只跑 `build:dts`。

**注意它会改 `package.json`**：跑完后 `git diff` 会看到 exports 变化，这是正常的，要提交。

## build-styles.mjs —— 样式产物

把 `styles/` 的 SCSS 源编译成 css：

```
dist/
├── theme/
│   ├── index.css          # 主题令牌（明色）
│   └── index-dark.css     # 暗色覆盖
└── styles/
    └── index.css          # 全量聚合（令牌 + 全部组件）
```

**同时生成 `styles/index.scss` 全量聚合文件**（按 `styles/*/index.scss` 扫描），`verify:styles` 第 4 项校验它的一致性——**不要手改这个文件**。

各 UI 库有自己的 `build-styles.mjs`（plus 版按 `packages/components` 扫描，vue2 版按 `src/components` 扫描），share 无样式源的组件会被**静默跳过**——所以 share 里必须有对应 scss，否则该组件在某一端无样式。

## gen-docs-data.mjs —— 文档数据生成

```bash
pnpm docs:data
```

解析四个源 → `docs/src/data/*.json`：

| 输出 | 源 | 内容 |
| --- | --- | --- |
| `tokens.json` | `var.scss` + `var-dark.scss` + `variables.scss` | 185 明色 + 118 暗色 + 183 SCSS 变量，按语义域分组 |
| `icons.json` | `src/.../icon/svgs.ts` | 37 个内置图标 |
| `classes.json` | `styles/*/index.scss` | 58 份组件 BEM 类名清单 |

**带数量断言**：解析数与预期（185 / 118 / 183 / 37 / 58）不符直接抛错。这是「令牌被误删 / 组件被误删」的第一道防线。

**幂等**：随便跑，只在内容变化时改 json。改了令牌或类名后跑一次刷新文档数据。

## push-release.mjs —— 发版推送

```bash
pnpm release:push
```

在 `pnpm release`（npm 发布 + 本地建 tag）之后跑：

1. 推 master 到 `github-lhgb`
2. 推本次版本 tag 到 `github-lhgb`
3. 触发 `.github/workflows/release.yml`：从 npm 拉已发布的 tarball → 创建 GitHub Release（挂 `lh-ui-share-<version>.tgz`）→ 推 tag 到 Gitee 并调 Gitee API 建发行版

**只推 GitHub，不要手动推 tag 到 Gitee**——Gitee 的 tag / 发行版由 release.yml 统一接管，双写会冲突。

## verify-theme-contrast.mjs —— 对比度门禁

读 `es/` 产物（所以**必须先 `pnpm build`**），用 `src/theme/themes/index.ts` 导出的 `getRelativeLuminance` / `getContrastRatio` 算每对「文字 / 背景」的 WCAG 对比度，低于 4.5:1 即失败。

调试单个配色可以直接在 node 里调这两个函数，不必跑全量。

## 历史一次性脚本

| 脚本 | 说明 |
| --- | --- |
| `extract-from-plus.mjs` | share 仓初创时从 lh-ui-plus 提取共享层。**留作记录，不再运行**——share 已是唯一源（红线 2）。 |
| `normalize-styles.mjs` | 早期样式规范化（统一令牌引用方式）。已完成使命。 |
| `patch-var-fallbacks.mjs` | 批量给 `var(--lh-*)` 补回落值。这是 verify:styles 第 2 项（var fallback）上线前的迁移工具——**新增代码必须手写 fallback，不要指望这个脚本兜底**。 |

## docs 站不是 npm 产物

`package.json` 的 `files: ["es", "lib", "dist", "styles"]` **不含 `docs/`**。文档站通过 `pnpm docs:build` 构建到 `docs/dist/`，手动部署到家族 nginx（契约在 `lh-ui/docs/部署/nginx-lhui.conf.md`，另一仓）。详见 [发布流程](/development/release)。

## 相关文档

- [命令一览](/development/commands) —— 每个 script 对应的 pnpm 命令
- [验证体系](/development/verification) —— verify 脚本各自的检查逻辑
- [发布流程](/development/release) —— push-release 与 CI 留档
- [包入口与子路径](/guide/exports) —— sync-exports 生成的 77 键
