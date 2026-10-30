---
title: 包結構
description: src / styles / tests / scripts 的目錄職責，以及 56 與 58 兩個元件計數口徑
---

# 包結構

## 原始碼側

```
lh-ui-share/
├── src/
│   ├── core/                  元件純函式層（零框架匯入，CI grep 門禁）
│   │   ├── <元件>/            logic.ts / types.ts / index.ts 三件套
│   │   └── shared/            跨元件共享核心（12 模組，已規範化為 <name>/index.ts）
│   ├── theme/                 主題 TS 側：types + 5 個預設 + 執行時原語
│   ├── constants/             LH_* 常數（LH_SIZE_DEFAULT / LH_LANGUAGE_DEFAULT …）
│   ├── locales/               LhLocale（純 emitter）+ lang/ 六語言骨架
│   ├── types/                 公共類型（locale / components）
│   ├── utils/                 純工具（createNamespace / deepMerge …）
│   └── index.ts               全量聚合入口
├── styles/                    元件 BEM 樣式唯一源
│   ├── <元件>/index.scss      58 套元件樣式
│   └── theme/
│       ├── common/
│       │   ├── var.scss       明色令牌（:root，185 個 --lh-*）
│       │   ├── var-dark.scss  暗色覆蓋（[data-theme='dark'], .dark，118 條）
│       │   ├── variables.scss 183 個 $lh-* SCSS 變數（!default）
│       │   ├── patterns.scss  6 個國風花紋 mixin
│       │   ├── transition.scss 三個過渡類別名 mixin（收編兩端差異）
│       │   └── a11y.scss      無障礙輔助樣式
│       └── index.scss         主題聚合
│   └── index.scss             全量聚合（令牌 + 全部元件，腳本生成，勿手改）
├── tests/unit/                core 單測唯一份（三庫共享，不重複拷貝）
├── scripts/                   構建與驗證腳本
├── docs/                      本文件站（Astro Starlight）
└── .changeset/                待發布 changeset
```

## 各目錄職責

| 目錄 | 職責 | 紅線 |
| --- | --- | --- |
| `src/core/<name>/` | 元件純函式：類別名計算 / 狀態機 / aria 屬性包 | 禁 `import 'vue' \| 'react' \| '@dcloudio/*'` |
| `src/core/shared/` | 跨元件核心，被各端直接複用 | 同上；已規範化為 `<name>/index.ts` |
| `styles/` | 元件 BEM 樣式**唯一源** | 禁止把樣式拷到 UI 庫手改；類別名 `lh-*`；顏色一律 `var(--lh-*, fallback)` |
| `tests/unit/` | core 單測**唯一一份** | UI 庫不得複製 |
| `scripts/` | extract-from-plus（一次性） / build-styles / verify-* / release | — |

## 元件計數口徑：56 還是 58

兩個數字都對，量的不是同一件事：

| 口徑 | 數字 | 來源 |
| --- | --- | --- |
| core 純函式元件 | **56** | `src/core/` 下的元件目錄（不含 `shared/`） |
| 元件樣式套數 | **58** | `styles/` 下的元件目錄（不含 `theme/`） |

差異是這三個：

| 名字 | core | styles | 原因 |
| --- | --- | --- | --- |
| `layout` | — | ✅ | 版面配置容器，邏輯全在 UI 層（row/col 的響應式斷點接線） |
| `tree-select` | — | ✅ | 選擇器膠水在框架側，樹資料邏輯複用 `core/tree` |
| `config` ↔ `config-provider` | `config` | `config-provider` | 同一個東西兩個目錄名 |

## 構建產物

`pnpm build` 產出四個目錄，`files` 只發這四個：

| 產物 | 結構 | 說明 |
| --- | --- | --- |
| `es/` | preserveModules 鏡像 `src/` | ESM，子路徑逐檔案按需 |
| `lib/` | 同上 | CJS（`require` 條件） |
| `dist/` | `dist/theme/*.css` `dist/styles/index.css` | 聚合樣式產物 |
| `styles/` | 原樣隨包發 | **SCSS 原始碼**，供專案自編 |

產物保持**零框架依賴**：`verify:dts` 會掃 `es/**/*.d.ts`，出現任何框架匯入即失敗。

## 單元件產物的樣子（以 button 為例）

```
es/button/
├── index.d.ts        類型
├── index.js          ESM
├── logic.d.ts
├── logic.js
├── types.d.ts
└── style/
    ├── index.css     編譯好的元件樣式（plus 端形態）
    └── index.scss    原始碼（@use 已改寫為 bare specifier，隨產物分發）
```

`lib/button/` 同構。兩端 UI 庫各自再包一層 `es/components/<name>/style/index.css`
（vue2 端只發 css，不發 scss）。
