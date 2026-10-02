## 目标

在仓库根目录新建两个自述文档（当前仓库**没有任何 README**，只有 AGENTS.md / CHANGELOG.md / src/locales/lang/README.md）：

- `README.md` —— 中文主文档
- `README.en.md` —— 英文版，与中文版**逐节完整对照**（同样的结构、同样的示例代码，仅语言不同），便于长期同步维护。

定位：以 npm 消费方为主（UI 库维护者 / 直接使用 core 逻辑的开发者），兼顾贡献者边界规则。内容全部来自本次对源码的实际核对，不写未实现的 API。

## 两份文档的统一结构

1. **定位**：@lh-ui/share 是 lh-ui 家族唯一的**框架无关共享层**——core 纯函数 / theme / constants / locales / types / utils / 组件样式源；被 lh-ui-vue2、lh-ui-react、lh-ui-uniapp 以 npm 依赖消费；零运行时依赖、零框架依赖（`external: []`，`verify:dts` 扫描产物 `.d.ts` 拦截 vue/react/@dcloudio 导入）。
2. **特性**：56 个组件纯函数逻辑 + 5 个共享内核；样式唯一源（过渡类名双写兼容 Vue2/Vue3/React）；SCSS 令牌系统 + 5 个国风预设 + 暗色模式 + 国风纹理；纯 emitter 国际化；ESM/CJS 双产物 + 子路径导出 + 镜像 dts。
3. **安装**：`pnpm add @lh-ui/share`。
4. **使用**（每节给真实可运行的示例，均来自源码核对）：
   - **Core**：子路径导入 + button 示例（`getClassNames` / `getSize` / `isClickable` / `getStyle`），说明"状态进、类名/样式出"的纯函数模式，以及 `getSize` 的优先级 props > ConfigProvider > 默认 medium。
   - **共享内核**：`sxToStyle`（间距 ×8）、`mergePt`、`computePosition`（12 方位 + flip/shift，入参为 rect 字面量可直接单测）、focus-trap。
   - **Theme**：`THEME_PRESETS`（数组：cerblue 青花瓷 / songhua 松花绿 / zhusha 朱砂 / shuimo 水墨 / golden 藤黄）、`getThemeVars`；CSS 入口 `@lh-ui/share/theme.css`（明+暗）、`theme-dark.css`、`styles.css`；暗色开关 `[data-theme='dark']` / `.dark`；纹理 `--lh-bg-pattern: var(--lh-pattern-willow)` 等 6 种。
   - **Locales**：`lhlocale.use/setLocale/t/add/subscribe/version`；示例 `use({locale:'en-US', messages:enUS})` + `t('input.placeholder')`；框架接线建议（Vue `ref(version)` + `subscribe`，React `useSyncExternalStore`）。**如实标注**：`t()` 无占位符插值（只按点路径取字符串，取不到回退 fallback 或 path）；ja-JP/ko-KR/de-DE/fr-FR 是英文兜底骨架。
   - **Utils**：`createNamespace`（`b/e/m/em/is`）、`cssVars` / `toCssVarName`（幂等，不会出现 `--lh---lh-...`）/ `stripCssVarName`、`debounce` / `throttle` / `deepMerge` / `generateId`。
   - **Styles**：`@lh-ui/share/styles/button`（**原始 SCSS 源码**，消费方需有 SCSS 管道）与全量 `styles.css` 两种方式；BEM `lh-*` 与 `var(--lh-*, fallback)` 约定。
5. **子路径导出表**：`.` / `./core` / `./core/*` / `./constants` / `./locales` / `./theme` / `./types`(仅类型) / `./utils` / `./theme.css` / `./theme-dark.css` / `./styles/*` / `./styles.css`，逐条列目标产物。
6. **目录结构**：简表（src/core、src/core/shared、src/theme、styles/、tests/unit、scripts/）。
7. **命令**：build / build:styles / build:dts / test / lint / typecheck / verify:dts，注明"验证由用户手动运行"。
8. **边界与贡献**：四条红线（src/ 禁框架导入、styles/ 唯一源、单测唯一份、share 先发版 → changeset → 各库 `pnpm up` 回归），并指向 `AGENTS.md` 获取完整规约。

## 涉及文件

- 新建 `README.md`（中文）
- 新建 `README.en.md`（英文）

不改动任何源码、配置或 AGENTS.md；两文档均为纯 Markdown，不含需构建的资产。License 章节：仓库当前无 LICENSE 文件，暂不写许可证明（如需可后补）。