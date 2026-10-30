---
title: 專案介紹
description: '@lh-ui/share 是什麼、解決什麼問題、在 lh-ui 家族裡的位置'
---

# 專案介紹

**`@lh-ui/share` 是 lh-ui 元件家族唯一的框架無關共享層。**

它把元件庫裡「與框架無關的那一半」抽出來單獨立倉：類別名計算、狀態機、無障礙屬性包、
定位引擎、虛擬捲動、主題令牌、國際化文案、元件樣式源。各端 UI 庫（lh-ui-plus /
lh-ui-vue2 / lh-ui-react / lh-ui-uniapp）發布態以 npm 依賴消費本套件，家族內本地開發
改本倉原始碼在各 UI 庫即時生效，無需構建或發版。

## 為什麼需要這一層

元件庫的邏輯其實只有一小部分真正依賴框架響應式：

- 某個類別名該不該加，是 `(size, disabled) => string` 的純計算；
- 下拉面板該往哪邊翻轉，是幾何計算；
- 列表該渲染哪幾行，是索引區間計算；
- 「確定」按鈕的文案，是語言包查表。

把這些沉澱成純函式，四個端就**不用各寫一遍、各錯一遍、各修一遍**。框架層只剩一件事：
把純函式的輸出綁到模板上，把使用者的輸入餵回純函式。

## 倉庫裡有什麼

| 層 | 內容 | 計數 |
| --- | --- | --- |
| `src/core/<元件>/` | 元件純函式（logic.ts / types.ts），零框架匯入 | 56 個元件 |
| `src/core/shared/` | 跨元件共享核心（popper / virtual / sx / keyboard / focus-trap …） | 12 個模組 |
| `src/theme/` | 主題 TS 側：類型 + 5 個預設 + 執行時原語 | — |
| `styles/` | 元件 BEM 樣式**唯一源** + `theme/common/*.scss` 令牌 | 58 套元件樣式 |
| `src/locales/` | 國際化（LhLocale 為純事件發射器）+ 10 個完整語言包 | — |
| `src/constants/` `src/types/` `src/utils/` | 常數 / 類型 / 純工具（含 createNamespace） | — |

> **計數口徑**：core 是 56 個元件目錄，styles 是 58 套——`layout` / `tree-select` 有
> 樣式源但邏輯全在 UI 層（版面配置容器、樹型選擇器的框架側膠水），`config` 在樣式目錄裡
> 叫 `config-provider`。詳見[包結構](/guide/structure)。

## 設計原則

1. **零框架依賴**：`src/` 內禁止 `import 'vue' | 'react' | '@dcloudio/*'`，由 CI grep
   門禁把守。本套件 `external: []`，全量零依賴打包。
2. **樣式單源**：`styles/` 是全家族元件 BEM 樣式唯一源，任何 UI 庫不得在本地持有元件
   scss 副本。跨端過渡類別名差異由 `transition.scss` 的三個 mixin 收編。
3. **單測唯一份**：core 單測只在本倉 `tests/unit/`，三庫共享此結果，不重複拷貝。
4. **響應式歸 UI 層**：core 只產出資料，訂閱 / 響應式接線屬於各 UI 庫。LhLocale 因此
   是純 emitter，靠 `version` 自增讓各端用各自機制重新渲染。
5. **明暗同價**：所有元件預設支援明色與暗色，元件只許 `var(--lh-*, fallback)` 消費令牌，
   暗色完備性由 `verify:styles` 第 7 項把守。

## 它不是什麼

- **不是 UI 庫**：本套件不渲染任何東西，沒有元件執行時。要能直接用的元件，去裝
  `@lh-ui/vue3` / `@lh-ui/vue2` 等各端庫。
- **不依賴任何 UI 庫、任何框架**：它是最底層，被依賴而不依賴人。
- **不負責部署態**：主題客製產出的是 `<style>` 文字與 CSS 變數，怎麼注入 DOM 由各端
  ConfigProvider 決定。

## 家族配置

```
lh-ui/
├── lh-ui-share/      ← 本倉：框架無關共享層（core / theme / styles / locales）
├── lh-ui-plus/       Vue3 端（全量 side-effect 注入樣式）
├── lh-ui-vue2/       Vue2 端（按需引 theme.css + style/<name>）
├── lh-ui-react/      React 端
├── lh-ui-uniapp/     uniapp 端
├── docs/             家族文件站（另一倉）
└── native/           原生端（android / ios / harmony，applicationId 用 top.lhgb.*）
```

發版順序是硬約束：**share 先發版，UI 庫隨其後**。share 一改 → 寫 changeset → 發版 →
各庫 `pnpm up @lh-ui/share` 回歸。

## 下一步

- [快速開始](/guide/getting-started) —— 裝套件、引樣式、跑起第一個純函式
- [包入口與子路徑](/guide/exports) —— 77 個匯出鍵怎麼按需挑
- [各端如何消費](/guide/consumption) —— Vue3 / Vue2 / React / uniapp 接線範例
