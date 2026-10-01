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
- `scripts/` —— extract-from-plus（一次性提取）/ build-styles / verify-dts

## 红线

1. `src/` 内禁止 `import 'vue' | 'react' | '@dcloudio/*'` 及任何框架 API；响应式接线属于 UI 层（CI grep 门禁）。
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

## 约定

- 注释与提交信息用中文；Prettier：单引号、无分号、2 空格、printWidth 100（`pnpm format` 仅覆盖配置文件，其余手写对齐）。
- 新增 core 组件：`src/core/<name>/{logic,types,index}.ts` 三件套 + `tests/unit/core/<name>.spec.ts` + `src/core/index.ts` 导出 + changeset。
- 样式改动：只改 `styles/`，组件类名遵循 BEM `lh-*`，颜色一律 `var(--lh-*, fallback)`，不新增硬编码色值。
