---
title: 包入口与子路径
description: '@lh-ui/share 的 77 个 exports 键全表与按需导入实践'
---

# 包入口与子路径

`package.json` 的 `exports` 字段定义了**唯一合法的导入路径**——没列在这里的路径
（比如直接 `@lh-ui/share/es/core/button/logic.js`）会被 Node / 打包器拒绝。本包共
**77 个键**。

## 顶层键一览

| 键 | 指向 | 用途 |
| --- | --- | --- |
| `.` | `es/index.js` / `lib/index.js` | 全量裸导入 |
| `./package.json` | `./package.json` | 工具读版本号 |
| `./core` | `es/core/index.js` | 全部 core 纯函数聚合 |
| `./core/<组件>/*` | `es/core/<组件>/*` | **56 个组件**逐个按需 |
| `./core/shared/*` | `es/core/shared/*` | 12 个共享内核模块 |
| `./constants` | `es/constants/index.js` | `LH_*` 常量 |
| `./locales` | `es/locales/index.js` | lhlocale + zhCN / enUS |
| `./locales/lang/*` | `es/locales/lang/*` | 6 个语言包单独引 |
| `./theme` | `es/theme/index.js` | 主题运行时原语 + 预设 |
| `./types` | `es/types/index.d.ts` | **仅类型**，无实现 |
| `./types/components/*` | `es/types/components/*.d.ts` | 组件 Props 类型（仅类型） |
| `./utils` | `es/utils/index.js` | createNamespace / deepMerge 等纯工具 |
| `./utils/*` | `es/utils/*` | 工具按文件引 |
| `./theme.css` | `dist/theme/index.css` | 明色令牌 |
| `./theme-dark.css` | `dist/theme/index-dark.css` | 暗色覆盖 |
| `./styles.css` | `dist/styles/index.css` | 令牌 + 全量组件样式 |
| `./dist/*` | `dist/*` | dist 产物直通 |
| `./styles/*` | `styles/<name>/index.scss` | **单组件 SCSS 源码** |
| `./styles/index.scss` | `styles/index.scss` | 全量 SCSS 聚合 |
| `./styles/theme/index.scss` | `styles/theme/index.scss` | 主题 SCSS 聚合 |
| `./styles/theme/common/*` | `styles/theme/common/*.scss` | 令牌 / 花纹 / 过渡 mixin |

## 三条件导出

除纯 CSS / SCSS 与 `types` 键外，每个 JS 键都同时给三个条件：

```json
"./core/button/*": {
  "types": "./es/core/button/*.d.ts",
  "import": "./es/core/button/*.js",
  "require": "./lib/core/button/*.js"
}
```

- `import` —— ESM 产物（`es/`），preserveModules 镜像源码结构，按需引入只打那一个文件。
- `require` —— CJS 产物（`lib/`），给 Node 直跑 / jest 等场景。
- `types` —— `.d.ts`，`import type` 走它，零运行时成本。

## 56 个 core 子路径

```
affix · alert · anchor · avatar · backtop · badge · breadcrumb · button ·
calendar · card · cascader · checkbox · collapse · config · date-picker ·
descriptions · dialog · divider · drawer · dropdown · empty · form · grid ·
icon · image · input · input-number · loading · menu · message ·
notification · pagination · popconfirm · popover · progress · radio · rate ·
segmented · select · skeleton · slider · space · spinner · statistic ·
steps · switch · table · tabs · tag · time-picker · timeline · tooltip ·
transfer · tree · upload · virtual-list
```

每个子路径的导出面以组件页的「函数表」为准，逐页可查（见左侧导航「组件 API」）。

## 12 个共享内核子路径

```
core/shared/a11y · date · delay · focus-trap · format · keyboard ·
popper · pt · sanitize · sx · types · virtual
```

这是被各端 UI 库引用最频繁的一层。各模块文档见左侧「共享内核」。

## tree-shaking 与 sideEffects

```json
"sideEffects": ["**/*.css", "**/*.scss"]
```

只有样式文件有副作用。纯 JS 子路径可安全 tree-shaking：

- ✅ `import { getButtonClasses } from '@lh-ui/share/core/button'` 只打 button。
- ✅ `import type { LhSxProps } from '@lh-ui/share/core/shared/sx` 编译期擦除。
- ⚠️ `import '@lh-ui/share/styles.css'` 是**全量**，不能 tree-shake——
  样式按请用 `./styles/<name>` SCSS 源码自己编，或用各 UI 库的按需产物。

## styles 子路径的两种形态

`./styles/*` 指向的是 **SCSS 源码**（`styles/<name>/index.scss`），不是编译产物：

```scss
@use '@lh-ui/share/styles/button';   // ✅ 打包器编 SCSS
```

```ts
import '@lh-ui/share/styles/button'   // ❌ 需要 .scss 扩展且打包器不认
```

如果你不想在项目里编 SCSS，引 `./styles.css`（全量）或用各 UI 库构建好的
`es/<name>/style/index.css`（lh-ui-plus） / `es/components/<name>/style/index.css`
（lh-ui-vue2）。

## 本地联动（家族内开发）

家族内各 UI 库不依赖 npm：dev / test 配置带**存在性守卫**地把 `@lh-ui/share/**`
alias 到同级 `lh-ui-share/` 的源码：

| 导入 | 家族布局下指向 |
| --- | --- |
| `@lh-ui/share/styles/**` | `lh-ui-share/styles/**`（SCSS 源码，vite 实时编译） |
| `@lh-ui/share/core/**` | `lh-ui-share/src/core/**` |
| `@lh-ui/share/{utils,constants,theme,locales,types}/**` | `lh-ui-share/src/$1/**` |
| `@lh-ui/share`（裸） | `lh-ui-share/src/index.ts` |

同级 share 仓不存在时守卫返回空数组，自动回退到已安装的 npm 包——**单仓 clone 与
家族布局都能跑**。本规则同样适用于发版：share 新增深文件后若没跑 `pnpm build`
（含 sync-exports），npm 侧没有对应 exports 键，下游 `pnpm up` 会 MODULE_NOT_FOUND。
