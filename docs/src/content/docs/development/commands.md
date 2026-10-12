---
title: 命令一览
description: 'pnpm build / build:styles / build:dts / test / lint / typecheck / verify:* / changeset / release 全表'
---

所有开发任务都通过根 `package.json` 的 scripts 暴露，包管理器固定 `pnpm`。

## 构建

| 任务 | 命令 | 产物 / 作用 |
| --- | --- | --- |
| 构建 | `pnpm build` | `es/` + `lib/`（preserveModules 镜像结构）+ 样式 + dts + `sync:exports` |
| 样式产物 | `pnpm build:styles` | `dist/theme/`（明暗主题 css）+ `dist/styles/`（全量聚合） |
| dts | `pnpm build:dts` | `tsc` 镜像直出的类型声明 |

`pnpm build` 是完整流水线，内部已包含 `build:styles` 与 `build:dts`。**注意**：`sync:exports` 会**重写 `package.json` 的 exports 字段**——改完源码目录结构后必须跑一次完整 build，否则下游 `pnpm up` 后 MODULE_NOT_FOUND。

## 测试与质量

| 任务 | 命令 | 作用 |
| --- | --- | --- |
| 单测 | `pnpm test` | vitest，`tests/unit/`（**core 单测唯一一份**，三库共享结果） |
| Lint | `pnpm lint` | eslint，只扫 `src` / `tests` / `scripts` / `vite.config.ts` / `vitest.config.ts` |
| 类型 | `pnpm typecheck` | tsc，include 只有 `src/**/*` |

## 校验

| 任务 | 命令 | 作用 |
| --- | --- | --- |
| dts 校验 | `pnpm verify:dts` | 校验产物 dts 与源码类型一致 |
| scss 校验 | `pnpm verify:styles` | 六项（见下） |
| 主题对比度 | `pnpm verify:theme` | AA 4.5:1 门禁，读 `es/` 产物（**需先 `pnpm build`**） |
| 版本一致性 | `pnpm verify:versions` | 各 UI 库依赖范围覆盖 share 当前版本 |

### verify:styles 六项

1. **EP 调色板** —— 颜色值的色阶 / 语义合规
2. **var fallback** —— 组件里 `var(--lh-*)` 必须带回落值
3. **@use 令牌** —— 组件 scss 必须通过 `@use` 引令牌，不引用 hex 字面量
4. **聚合一致** —— `styles/index.scss` 与组件目录扫描结果一致（防漏聚合）
5. **过渡类名单源** —— 禁止裸写 `-enter-from` / `-leave-from`，一律用 [transition mixin](/reference/transition-mixins)
6. **暗色可达性** —— 明色烤死的令牌在 `var-dark.scss` 有覆盖（详见 [暗色模式](/theme/dark-mode)）

## 发版

| 任务 | 命令 | 作用 |
| --- | --- | --- |
| 写变更 | `pnpm changeset` | 交互式生成 `.changeset/*.md` |
| 消费 changeset | `pnpm changeset:version` | 改版本号、写 CHANGELOG、删除待发布 changeset |
| 发布 | `pnpm release` | `changeset publish`：先 `prepublishOnly`（build + verify:dts + verify:styles）再发 npm，再本地建 tag |
| 推送留档 | `pnpm release:push` | 推 master + 本次 tag 到 GitHub，触发自动留档 |

完整发版流程见 [发布流程](/development/release)。

## 文档站

| 任务 | 命令 | 作用 |
| --- | --- | --- |
| 数据生成 | `pnpm docs:data` | `scripts/gen-docs-data.mjs` 解析令牌 / 图标 / 类名 → `docs/src/data/*.json` |
| 本地开发 | `pnpm docs:dev` | Astro dev server（`http://localhost:4321/lhui/share/`） |
| 构建 | `pnpm docs:build` | 生产构建到 `docs/dist/` |
| 预览 | `pnpm docs:preview` | 预览构建产物 |

**注意**：`pnpm docs:data` 是幂等的，带数量断言（明色 185 / 暗色 118 / SCSS 183 / 图标 37 / 类名 58 份），解析数对不上直接报错。

## 典型工作流

### 改一个 core 组件

```bash
pnpm test                                    # 跑单测（先写测试）
pnpm lint && pnpm typecheck                  # 质量
pnpm build                                   # 完整构建（含 sync:exports）
pnpm verify:dts && pnpm verify:styles        # 产物与样式校验
pnpm changeset                               # 写变更
git add -A && git commit                     # 提交（后续合入 master）
```

### 改样式

```bash
# 只改 styles/，不用跑 build 的 js 部分
pnpm verify:styles                           # 六项校验
pnpm build:styles                            # 生成 dist 产物
pnpm docs:data                               # 令牌表数据刷新（令牌变了才需要）
```

### 加一个新组件

```bash
# 1. 三件套
#    src/core/<name>/{logic,types,index}.ts
#    tests/unit/core/<name>.spec.ts
#    styles/<name>/index.scss
# 2. src/core/index.ts 加导出
# 3. 验证
pnpm test && pnpm lint && pnpm typecheck
pnpm build                                   # sync:exports 生成新的 exports 键
pnpm verify:dts && pnpm verify:styles
# 4. changeset（minor：新增组件）
pnpm changeset
```

**关键**：`sync:exports` 未跑则 npm 侧没有对应 exports 键——发版前务必走完整 `pnpm build`。新增 `styles/<name>/index.scss` 后两端构建脚本会自动覆盖（按各自组件目录扫描），但 share 里**必须**有对应 scss，否则该组件在某一端无样式产物（静默跳过）。

## CI 跑什么

`.github/workflows/ci.yml` 在每次 PR / push 到 master 时跑：install → lint → typecheck → test → build → verify:dts → verify:styles（+ E 批后的 `docs:build`）。

**不跑的**：`verify:theme`（对比度门禁，本地手动把守）、`verify:versions`（版本一致性，发版后下游处理）。

## 依赖与工具链

- 包管理器：`pnpm`（lockfile 必须提交）
- 构建：`vite` + `rollup`（preserveModules）
- 类型：`tsc`（`tsconfig.build.json` 镜像直出 dts）
- 测试：`vitest`
- 样式：`sass`（`api: 'modern'`）
- changeset：`@changesets/cli`
- 文档站：`astro` + `@astrojs/starlight`

## 相关文档

- [验证体系](/development/verification) —— 六项校验各自在查什么
- [构建脚本](/development/scripts) —— `build-styles.mjs` / `gen-docs-data.mjs` 等
- [发布流程](/development/release) —— 六步发版
- [贡献指南](/development/contribution) —— 红线与提 PR 前的清单
