# AGENTS.md — @lh-ui/share

本仓库是 lh-ui 家族**唯一的框架无关共享层**：core 纯函数、theme、constants、locales、types、utils、组件样式源。
各框架 UI 层（lh-ui-vue2 / lh-ui-react / lh-ui-uniapp）以 npm 依赖消费本包；**本包不依赖任何 UI 库、任何框架**。

## 目录职责

- `src/core/<name>/` —— 组件纯函数逻辑（logic.ts / types.ts / index.ts），零 Vue/React/uni 导入
- `src/core/shared/` —— 跨组件共享内核（sx / pt / popper / focus-trap / types），已规范化为 `<name>/index.ts`
- `src/theme/` —— theme TS 侧（类型 + 五个预设 getThemeVars/THEME_PRESETS）
- `src/constants/`、`src/locales/`、`src/types/`、`src/utils/` —— 常量 / 语言包（LhLocale 为纯 emitter）/ 类型 / 纯工具（含 createNamespace）
- `styles/` —— **组件 BEM 样式唯一源**：`<name>/index.scss` + `theme/common/*.scss`（令牌）
- `tests/unit/` —— **core 单测唯一一份**（三库共享此结果，不重复拷贝）
- `scripts/` —— extract-from-plus（一次性提取）/ build-styles / normalize-styles（过渡类名双写，可重复执行）/ verify-dts

## 红线

1. `src/` 内禁止 `import 'vue' | 'react' | '@dcloudio/*'` 及任何框架 API；响应式接线属于 UI 层。强制力来自 `pnpm verify:dts`（CI 末步）：它扫描 `es/**/*.d.ts`，命中 `vue` / `react` / `@dcloudio/*` / 旧别名（`lh-*`、`~/`）即失败，并要求每个 `src/**.ts` 都有镜像 `.d.ts`。
2. `styles/` 是组件样式唯一源：禁止把样式拷贝到 UI 库手改；一切样式改动只在本仓库发生。
   过渡类名已**双写**（`-enter` 与 `-enter-from`、`-leave` 与 `-leave-from` 并列），同时服务 Vue2 / Vue3 / React。
3. core 单测唯一一份在本仓库；UI 库不得复制。
4. 细边框规则加 `/* hairline */` 注释（uniapp 的 px→rpx 转译据此跳过）——M4 前补齐。
5. 版本发布顺序硬约束：**share 先发版，UI 库随其后**；share 改动 → changeset → 发版 → 各库 `pnpm up @lh-ui/share` 回归。

## 命令

| 任务 | 命令 |
| --- | --- |
| 构建（es/lib，preserveModules 镜像结构） | `pnpm build` |
| 样式产物（dist/theme + dist/styles） | `pnpm build:styles` |
| dts（tsc 镜像直出） | `pnpm build:dts` |
| 单测 | `pnpm test` |
| Lint / 类型 | `pnpm lint` / `pnpm typecheck` |
| dts 校验 | `pnpm verify:dts` |

## Verification is manual（验证手动）

测试、构建、typecheck、lint 由**用户**运行，AI 不自动执行；AI 交付后列出命令清单，未确认的运行不得标 ✅。
CI（`.github/workflows/ci.yml`，Node 20 + pnpm 10）按 `lint → typecheck → test → build → build:styles → build:dts → verify:dts` 顺序跑，任一步失败即拦截。

## 注意 / Gotchas

- `pnpm typecheck` 只含 `src/**`（`tsconfig.json` 的 include 不含 `tests/`，与 plus 对齐）：spec 的类型问题只在 vitest 运行时暴露，不报在 typecheck 里。
- `pnpm lint` 不含 `styles/`（eslint 忽略 scss），样式没有 lint 兜底，手写时按 BEM 与令牌约定自查。
- `src/locales/lang/README.md` 及 ja/ko/de/fr 语言文件注释里的 `packages/...`、`docs/.vitepress` 路径是旧 monorepo 残留，**已失效**；真实路径是 `src/locales/lang/`、`src/constants/index.ts`、`src/locales/index.ts`。
- locales 现状：zh-CN / en-US 完整，ja-JP / ko-KR / de-DE / fr-FR 均为英文兜底骨架。
- 单测环境为 jsdom（`vitest.config.ts`），spec 放 `tests/**/*.spec.ts`；`tests/unit/core/shared/` 下还有 focus-trap / popper 的共享单测。
- 消费方优先用子路径导入（`@lh-ui/share/core/button`），`package.json` 的 `./core/*` 导出按目录自动匹配，新增 core 组件无需改导出映射；根入口 `src/index.ts` 仅作聚合。

## 约定

- 注释与提交信息用中文；Prettier：单引号、无分号、2 空格、printWidth 100（`pnpm format` 仅覆盖配置文件，其余手写对齐）。
- 新增 core 组件：`src/core/<name>/{logic,types,index}.ts` 三件套 + `tests/unit/core/<name>.spec.ts` + `src/core/index.ts` 导出 + changeset。
- 样式改动：只改 `styles/`，组件类名遵循 BEM `lh-*`，颜色一律 `var(--lh-*, fallback)`，不新增硬编码色值。

## 构建注意

- `pnpm build` 现为完整链（vite build → build:styles → build:dts）。此前 `build` 仅跑 vite，
  会清空 es/ 导致 d.ts 丢失、下游（lh-ui-vue2）typecheck 报 TS7016——2026-10-02 踩坑后已修复脚本顺序。
- 单独跑 `pnpm build:styles` 不影响 es/ 的声明文件。
