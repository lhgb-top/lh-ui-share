---
title: 各端样式注入策略
description: share 只提供样式内容，注入方式由各 UI 库自选——两端策略不同的设计缘由
---

# 各端样式注入策略

**share 只提供样式内容**（SCSS 源 + 令牌），**注入方式由各 UI 库自选**。
两端策略不同，这是设计而非缺陷。任何一端都不得为此在本地持有组件 scss 副本（红线 2）。

## 两端对照

| | lh-ui-plus（Vue3） | lh-ui-vue2 |
| --- | --- | --- |
| 库入口注入 | 全量 side-effect：`src/index.ts` 逐组件 `import '@lh-ui/share/styles/<name>'`，引库即得全部样式 | 不注入，用户按需引 `@lh-ui/vue2/theme.css` + `@lh-ui/vue2/style/<name>` |
| 样式产物 | `es\|lib/<name>/style/index.css` + `es/<name>/style/index.scss`（scss 源随产物分发，`@use` 改写为 bare specifier） | `es\|lib/components/<name>/style/index.css`（仅 css） |
| 主题产物 | `theme/index.css` + `dist/index.css`（主题 + 全量） | `dist/theme/index.css`（明）+ `dist/theme/index-dark.css`（暗） |
| 按需子路径 | `./style/*` → `es/*/style/index.scss`；`./style-css/*` → `es/*/style/index.css` | `./style/*` → `es/components/*/style/index.css`；`./theme.css`、`./theme-dark.css` |
| 构建脚本 | `lh-ui-plus/scripts/build-styles.mjs`（组件清单按 `packages/components` 扫描） | `lh-ui-vue2/scripts/build-styles.mjs`（按 `src/components` 扫描，share 无样式源的组件自动跳过） |

## 为什么两端不一样

- **Vue3 端**面向「引库即用」的多数派：vite 生态对 side-effect 样式注入友好，
  全量注入省掉用户配按需的成本；tree-shaking 在样式上本就无效，全量反而省心。
- **Vue2 端**面向老项目与体积敏感场景：webpack 4 时代 side-effect 注入容易配错，
  按需引法（两条 import）更可控，也能让用户只引明色或只引暗色。

## 新增组件时的覆盖

新增组件时**两端构建脚本都会自动覆盖**（按各自组件目录扫描），但 share 的 `styles/`
里必须有对应 `<name>/index.scss`——否则该组件在某一端无样式产物（**静默跳过**，
不会报错）。这是「样式唯一源」红线带来的直接约束：先在 share 建样式，再在各端建组件。

## 跨端过渡类名：三个 mixin 收编

Vue2 的过渡类名是 `-enter` / `-leave`，Vue3 / React 是 `-enter-from` / `-leave-from`
（`-leave-to` 两端同名）。手写双份类名必然漂移，所以一律 `@include`：

```scss
@use '@lh-ui/share/styles/theme/common/transition' as *;

.lh-dialog-fade {
  @include lh-enter-both;          // -enter + -enter-from（Vue3）
  @include lh-leave-both;          // -leave + -leave-from
  @include lh-transition-ends;     // -enter-to + -leave-to（两端同名）
}
```

需要把状态挂在**后代节点**上时传第二个参数：

```scss
@include lh-transition-ends('.lh-drawer-fade', '.lh-drawer__panel--right');
```

组件样式**禁止再手写双份过渡类名**。

## 主题定制产物的注入约束

`buildPresetStyleText(vars)` 产出可注入的 `<style>` 文本（`:root` + 暗色块）。
UI 层采纳时**只能写 `<style>` 元素，不能写 `documentElement` 的内联 style**：

> 内联 style 的特异性高于 `var-dark.scss` 的整段暗色变量，会导致暗色模式配色失真。

详见[主题定制](/theme/customization)。
