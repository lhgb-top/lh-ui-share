---
title: 各端樣式注入策略
description: share 只提供樣式內容，注入方式由各 UI 庫自選——兩端策略不同的設計緣由
---

# 各端樣式注入策略

**share 只提供樣式內容**（SCSS 原始碼 + 令牌），**注入方式由各 UI 庫自選**。
兩端策略不同，這是設計而非缺陷。任何一端都不得為此在本地持有元件 scss 副本（紅線 2）。

## 兩端對照

| | lh-ui-plus（Vue3） | lh-ui-vue2 |
| --- | --- | --- |
| 庫入口注入 | 全量 side-effect：`src/index.ts` 逐元件 `import '@lh-ui/share/styles/<name>'`，引庫即得全部樣式 | 不注入，使用者按需引 `@lh-ui/vue2/theme.css` + `@lh-ui/vue2/style/<name>` |
| 樣式產物 | `es\|lib/<name>/style/index.css` + `es/<name>/style/index.scss`（scss 原始碼隨產物分發，`@use` 改寫為 bare specifier） | `es\|lib/components/<name>/style/index.css`（僅 css） |
| 主題產物 | `theme/index.css` + `dist/index.css`（主題 + 全量） | `dist/theme/index.css`（明）+ `dist/theme/index-dark.css`（暗） |
| 按需子路徑 | `./style/*` → `es/*/style/index.scss`；`./style-css/*` → `es/*/style/index.css` | `./style/*` → `es/components/*/style/index.css`；`./theme.css`、`./theme-dark.css` |
| 構建腳本 | `lh-ui-plus/scripts/build-styles.mjs`（元件清單按 `packages/components` 掃描） | `lh-ui-vue2/scripts/build-styles.mjs`（按 `src/components` 掃描，share 無樣式源的元件自動跳過） |

## 為什麼兩端不一樣

- **Vue3 端**面向「引庫即用」的多數派：vite 生態對 side-effect 樣式注入友善，
  全量注入省掉使用者配按需的成本；tree-shaking 在樣式上本就無效，全量反而省心。
- **Vue2 端**面向老專案與體積敏感場景：webpack 4 時代 side-effect 注入容易配錯，
  按需引法（兩條 import）更可控，也能讓使用者只引明色或只引暗色。

## 新增元件時的覆蓋

新增元件時**兩端構建腳本都會自動覆蓋**（按各自元件目錄掃描），但 share 的 `styles/`
裡必須有對應 `<name>/index.scss`——否則該元件在某一端無樣式產物（**靜默跳過**，
不會報錯）。這是「樣式唯一源」紅線帶來的直接約束：先在 share 建樣式，再在各端建元件。

## 跨端過渡類別名：三個 mixin 收編

Vue2 的過渡類別名是 `-enter` / `-leave`，Vue3 / React 是 `-enter-from` / `-leave-from`
（`-leave-to` 兩端同名）。手寫雙份類別名必然漂移，所以一律 `@include`：

```scss
@use '@lh-ui/share/styles/theme/common/transition' as *;

.lh-dialog-fade {
  @include lh-enter-both;          // -enter + -enter-from（Vue3）
  @include lh-leave-both;          // -leave + -leave-from
  @include lh-transition-ends;     // -enter-to + -leave-to（兩端同名）
}
```

需要把狀態掛在**後代節點**上時傳第二個參數：

```scss
@include lh-transition-ends('.lh-drawer-fade', '.lh-drawer__panel--right');
```

元件樣式**禁止再手寫雙份過渡類別名**。

## 主題客製產物的注入約束

`buildPresetStyleText(vars)` 產出可注入的 `<style>` 文字（`:root` + 暗色塊）。
UI 層採納時**只能寫 `<style>` 元素，不能寫 `documentElement` 的內聯 style**：

> 內聯 style 的特異性高於 `var-dark.scss` 的整段暗色變數，會導致暗色模式配色失真。

詳見[主題客製](/theme/customization)。
