# @lh-ui/share

> lh-ui 家族唯一的**框架无关共享层**：core 纯函数 / theme / constants / locales / types / utils / 组件样式源。

[English](./README.en.md) | 中文

各框架 UI 层（lh-ui-vue2 / lh-ui-react / lh-ui-uniapp）以 npm 依赖消费本包。**本包不依赖任何 UI 库、任何框架**——`vite` 构建配置 `external: []`，且 `verify:dts` 会扫描产物 `.d.ts`，一旦出现 `vue` / `react` / `@dcloudio/*` 或旧别名导入即失败。

## 特性

- **框架无关的组件逻辑**：55 个组件的纯函数（`logic.ts` / `types.ts` / `index.ts` 三件套）+ 10 个共享内核（`sx` / `pt` / `popper` / `focus-trap` / `sanitize` / `virtual` / `format` / `date` / `delay` / `types`）。状态进、类名/样式出，零副作用，可直接单测。
- **样式唯一源**：`styles/` 是全部组件 BEM 样式的唯一来源；过渡类名已**双写**（`-enter` 与 `-enter-from` 并列），同时服务 Vue2 / Vue3 / React。
- **国风主题系统**：SCSS 令牌（`variables.scss`，全部 `!default` 可覆盖）+ 5 个预设主题（青花瓷 / 松花绿 / 朱砂 / 水墨 / 藤黄）+ 暗色模式 + 6 种内置纹理（柳 / 云 / 水 / 雪 / 梅 / 竹）。
- **纯 emitter 国际化**：`LhLocale` 不含任何框架响应式，靠 `version` 自增 + `subscribe` 供各框架自行接线。
- **对消费方友好的产物**：ESM（`es/`）+ CJS（`lib/`）双产物，`preserveModules` 镜像 `src/` 结构，子路径导入天然支持 tree-shaking；dts 由 `tsc` 按同一镜像结构直出。

## 安装

```bash
pnpm add @lh-ui/share
```

## 使用

> 优先使用**子路径导入**（分层与 tree-shaking 更清晰）；根入口 `@lh-ui/share` 仅作便捷聚合。

### Core —— 组件纯函数

以 button 为例：把框架侧收集到的状态传进去，拿到 BEM 类名与内联样式。

```ts
import { getClassNames, getSize, isClickable, getStyle } from '@lh-ui/share/core/button'

const classes = getClassNames({
  type: 'primary',
  size: getSize(props.size, configProvider.size), // 优先级：props > ConfigProvider > 默认 medium
  loading: false,
  disabled: false,
  plain: false,
  block: false,
  round: true,
  circle: false,
})
// => ['lh-button', 'lh-button--primary', 'lh-button--medium', 'lh-button--round', ...]

isClickable({ loading, disabled }) // => 可点击与否
getStyle()                          // => {}（CSS 变量已在 :root 全局定义，无需在按钮上重复设置）
```

类型从同目录导入：`import type { LhButtonState } from '@lh-ui/share/core/button'`。

### 共享内核

```ts
// sx：Tailwind 风格的间距简写 → 内联样式（数值间距 ×8px）
import { sxToStyle } from '@lh-ui/share/core/shared/sx'
sxToStyle({ mt: 2, px: 4, display: 'flex' }) // => { marginTop: '16px', paddingLeft: '32px', paddingRight: '32px', display: 'flex' }

// pt：内部元素的透传属性合并（class 支持 字符串/数组/对象 三种形式）
import { mergePt } from '@lh-ui/share/core/shared/pt'
mergePt({ class: 'extra', style: { color: 'red' } }, 'lh-button__text')

// popper：定位引擎，入参全部是 rect 字面量、不触碰 DOM，可直接单测
import { computePosition } from '@lh-ui/share/core/shared/popper'
computePosition(triggerRect, popperRect, viewportRect, { placement: 'bottom-start', gap: 8, flip: true, shift: true })
// => { top, left, placement, arrowOffset }；支持 12 方位、主轴翻转、交叉轴吸附

// focus-trap：Dialog / Drawer 等浮层的焦点管理
import { focusFirst, trapTabKey, setInertOutside } from '@lh-ui/share/core/shared/focus-trap'
```

### Theme —— 主题

TS 侧提供 5 个预设（主色重染）：

```ts
import { THEME_PRESETS, getThemeVars, getThemePreset } from '@lh-ui/share/theme'

THEME_PRESETS // [{ name: 'cerblue', label: '青花瓷', labelEn: 'Ceramic Blue', ... }, ...]
getThemeVars('zhusha') // => { '--lh-primary-color': '#B23A3A', ... }
```

| 预设 | 中文名 | 主色 |
| --- | --- | --- |
| `cerblue` | 青花瓷 | `#2B4C7C` |
| `songhua` | 松花绿 | `#5B8C5A` |
| `zhusha` | 朱砂 | `#B23A3A` |
| `shuimo` | 水墨 | `#2C2C2C` |
| `golden` | 藤黄 | `#B8860B` |

CSS 侧引入令牌（`styles/theme/` 是 SCSS 源，`dist/theme/` 是构建产物）：

```ts
// 全量令牌（明色 + 暗色 + 纹理，一个文件）
import '@lh-ui/share/theme.css'

// 仅暗色（可独立编译，按需引入）
import '@lh-ui/share/theme-dark.css'

// 全量样式（主题 + 全部组件）
import '@lh-ui/share/styles.css'
```

暗色模式由选择器开关，二选一即可：

```html
<html data-theme="dark"></html>
<!-- 或 -->
<div class="dark"></div>
```

纹理（国风底纹）：先引入 `theme.css`，再指定纹理变量——

```css
:root {
  --lh-bg-pattern: var(--lh-pattern-willow); /* 柳 / 云 cloud / 水 water / 雪 snow / 梅 plum / 竹 bamboo */
}
```

也可以在 ConfigProvider 的 `themeVars` 里传入 `bg-pattern`。若自行 `@use` SCSS 源，所有令牌都是 `!default`，可用 `@use '...' with ($lh-primary: ...)` 覆盖。

### Locales —— 国际化

```ts
import { lhlocale, zhCN, enUS } from '@lh-ui/share/locales'

lhlocale.use({ locale: 'en-US', messages: enUS }) // 切换并注册语言包
lhlocale.t('input.placeholder')                    // => 'Please input'
lhlocale.setLocale('zh-CN')                        // 切回（语言包已注册时直接生效）
lhlocale.add('xx-XX', customMessages)              // 只注册、不切换
```

框架接线：`LhLocale` 是纯 emitter，靠版本号驱动更新。

```ts
// Vue2 / Vue3
const version = ref(lhlocale.version)
const unsubscribe = lhlocale.subscribe((v) => (version.value = v))
onUnmounted(unsubscribe)

// React
useSyncExternalStore(lhlocale.subscribe, () => lhlocale.version)
```

> **注意**：`t()` 按点路径取字符串，第二参数传**对象**时按 `{name}` 占位符插值（如 `t('pagination.total', { total: 100 })` → `共 100 条`），未知占位符原样保留；传**字符串**时作为 `fallback`（取不到翻译时返回它，未传则返回路径本身）。当前完整语言包为 `zh-CN` / `en-US`，ja-JP / ko-KR / de-DE / fr-FR 为英文兜底骨架。

### Utils —— 工具

```ts
import { createNamespace, cssVars, toCssVarName, stripCssVarName } from '@lh-ui/share/utils'

const ns = createNamespace('button')
ns.b()          // 'lh-button'
ns.e('text')    // 'lh-button__text'
ns.m('primary') // 'lh-button--primary'
ns.em('text', 'disabled') // 'lh-button__text--disabled'
ns.is('loading', true)    // 'is-loading'（false/undefined 返回空串）

cssVars({ 'primary-color': '#2B4C7C' }) // => { '--lh-primary-color': '#2B4C7C' }
toCssVarName('primary-color')            // => '--lh-primary-color'（幂等，已带前缀则原样返回）
stripCssVarName('--lh-primary-color')    // => 'primary-color'
```

另有 `debounce` / `throttle` / `deepMerge` / `generateId` / `isEmpty` / `getScrollbarWidth` 等纯工具（`generateId` 等带 DOM 访问的需浏览器环境）。

### Constants —— 常量

```ts
import { LH_TYPES_CONST, LH_SIZE_CONST, LH_SIZE_DEFAULT, LH_LANGUAGE_CONST, LH_LANGUAGE_DEFAULT } from '@lh-ui/share/constants'
LH_TYPES_CONST   // { success, warning, error, info, danger }
LH_SIZE_CONST    // { small, medium, large, mini, old: 'x-large' }（old 为老年模式专用档）
LH_LANGUAGE_CONST // { zhCN: 'zh-CN', enUS: 'en-US' }
```

### Styles —— 组件样式

```ts
// 单组件样式（原始 SCSS 源码，消费方需具备 SCSS 编译管道）
import '@lh-ui/share/styles/button'
import '@lh-ui/share/styles/dialog'

// 单组件编译产物（无 SCSS 管道时按组件引入，避免加载全量包）
import '@lh-ui/share/dist/button/style.css'
import '@lh-ui/share/dist/dialog/style.css'

// 或一次引入全量编译产物
import '@lh-ui/share/styles.css'
```

类名遵循 BEM `lh-*`，颜色一律使用 `var(--lh-*, <fallback>)` 形式，不引入硬编码色值。

## 子路径导出

| 子路径 | 内容 |
| --- | --- |
| `.` | 根聚合入口（全部子层） |
| `./core` / `./core/*` | 组件纯函数；`./core/button` 等按目录匹配 |
| `./core/<组件>/*` | 组件内深文件（`./core/tooltip/logic`、`./core/date-picker/adapter` 等），由 `pnpm sync:exports` 按 `es/` 产物自动生成 |
| `./constants` | 常量 |
| `./locales` / `./locales/lang/*` | 国际化（`lhLocale` + 语言包 + 类型）；按语言深引入 `./locales/lang/zh-CN` |
| `./theme` | 主题预设与类型 |
| `./types` | 仅类型（无运行时产物） |
| `./utils` / `./utils/*` | 工具函数；深文件 `./utils/css-var`、`./utils/namespace` |
| `./theme.css` | `dist/theme/index.css`（明色 + 暗色 + 纹理） |
| `./theme-dark.css` | `dist/theme/index-dark.css`（仅暗色） |
| `./styles/*` | `styles/*/index.scss`（**原始 SCSS 源码**） |
| `./styles.css` | `dist/styles/index.css`（主题 + 全部组件，编译产物） |
| `./dist/*` | `dist/<组件>/style.css`（**单组件编译产物**，无 SCSS 管道时按需引入） |

## 目录结构

```
src/core/<name>/    组件纯函数三件套：logic.ts / types.ts / index.ts
src/core/shared/    共享内核：sx / pt / popper / focus-trap / types
src/theme/          主题 TS 侧（类型 + 5 个预设）
src/constants/      常量
src/locales/        语言包（LhLocale 为纯 emitter）
src/types/ src/utils/  类型 / 纯工具
styles/             组件 BEM 样式唯一源：<name>/index.scss + theme/common/*.scss（令牌）
tests/unit/         core 单测唯一一份（三库共享，不重复拷贝）
scripts/            build-styles / normalize-styles / sync-exports / verify-dts / verify-styles / extract-from-plus
```

## 命令

| 任务 | 命令 |
| --- | --- |
| 构建（es/lib，preserveModules 镜像结构） | `pnpm build` |
| 样式产物（dist/theme + dist/styles） | `pnpm build:styles` |
| dts（tsc 镜像直出） | `pnpm build:dts` |
| dts 校验（镜像完整性 + 禁止框架导入） | `pnpm verify:dts` |
| 单测 | `pnpm test` |
| Lint / 类型 | `pnpm lint` / `pnpm typecheck` |

CI 按 `lint → typecheck → test → build → build:styles → build:dts → verify:dts` 顺序执行。测试、构建等验证由**用户手动运行**，AI 交付后仅列出命令清单。

## 边界与贡献

- `src/` 内禁止 `import 'vue' | 'react' | '@dcloudio/*'` 及任何框架 API；响应式接线属于各 UI 层。
- `styles/` 是组件样式唯一源：禁止把样式拷贝到 UI 库手改；一切样式改动只在本仓库发生。
- core 单测唯一一份在本仓库，UI 库不得复制。
- 版本发布顺序：**share 先发版，UI 库随其后**——share 改动 → changeset → 发版 → 各库 `pnpm up @lh-ui/share` 回归。

完整规约见 [AGENTS.md](./AGENTS.md)。
