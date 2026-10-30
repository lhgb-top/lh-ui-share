---
title: 驗證體系
description: 'verify:dts / verify:styles 六項 / verify:theme AA 門禁 / verify:versions 各自查什麼、怎麼讀輸出'
---

lh-ui 的「驗證」不是走個過場——每項都在攔一類**曾經真實出現過**的回歸。本文逐項說明查什麼、失敗輸出怎麼讀。

## verify:dts —— 產物類型一致性

```bash
pnpm verify:dts
```

**查什麼**：`es/` / `lib/` 裡編譯出的 `.d.ts` 與原始碼類型宣告一致，且 exports 鍵指向的檔案真實存在。

**典型失敗**：

- 改了原始碼類型但沒重跑 `pnpm build`（產物是舊的）
- `sync:exports` 生成了 exports 鍵，但對應檔案沒被構建出來（路徑拚錯）
- `import type` 寫成了 `import`，產物裡多帶了一份執行時程式碼

**修法**：`pnpm build` 完整重跑，再 `pnpm verify:dts`。

## verify:styles —— 六項

```bash
pnpm verify:styles
```

腳本：`scripts/verify-styles.mjs`。六項順序執行，任一項失敗即退出。

### 1. EP 調色盤

黑名單檢查：EP（Element Plus）遺留的 9 個色值（`#409eff`、`#e6a23c`、`#f56c6c`、`#67c23a`、`#909399`、`#606266`、`#303133`、`#ebeef5`、`#c0c4cc`）出現在 `styles/` 的 scss 檔案裡即失敗。這是 D2 清洗後的回歸護欄，防止舊體系顏色回潮——lh-ui 的顏色一律來自 `styles/theme/common/variables.scss` 的令牌定義。

### 2. var fallback

查元件 scss 裡每個 `var(--lh-*)` 是否帶回落值：

```scss
// ✅ 通過
color: var(--lh-text-primary, rgba(0, 0, 0, 0.88));

// ❌ 失敗
color: var(--lh-text-primary);
```

**為什麼**：令牌缺失（使用者只用部分樣式、舊版本令牌不存在）時，無回落的 `var()` 會解析成無效值，屬性被丟棄——文字變預設黑色、邊框消失。帶回落保證「降級可用」。

### 3. @use 令牌

查元件 scss 是否透過 `@use` 引令牌層，而不是散落 hex 字面量：

```scss
// ✅ 通過
@use 'theme/common/var' as *;
.lh-card { background: var(--lh-bg-color, #fff); }

// ❌ 失敗
.lh-card { background: #ffffff; }
```

**豁免**：`var()` 的回落值允許寫 hex（那是降級用的）。失敗資訊會列出檔案與行號。

### 4. 聚合一致

查 `styles/index.scss`（全量聚合）與「掃描 `styles/*/index.scss` 得到的元件清單」一致。**`styles/index.scss` 是 `scripts/build-styles.mjs` 生成的，不要手改**——新增元件目錄後沒重跑生成就會不一致。

### 5. 過渡類別名單源

查元件 scss 裡是否**裸寫**了 `-enter-from` / `-leave-from` 字面量：

```scss
// ❌ 失敗：手寫雙份過渡類別名
.lh-dialog-fade-enter-from { opacity: 0; }

// ✅ 通過：用 mixin
@include lh-enter-both('.lh-dialog-fade') { opacity: 0; }
```

**為什麼**：Vue2 用 `-enter`、Vue3/React 用 `-enter-from`，手寫必然漏一端（詳見 [transition-mixins](/reference/transition-mixins)）。曾經 16 個元件各寫雙份，改一處漏一處。

### 6. 暗色可達性

查 `var.scss` 裡值形如 `#{$lh-foo}`（編譯期烤死成明色）的令牌，在 `var-dark.scss` 裡**是否有對應覆蓋**。

**這是最關鍵的一項**。這類缺口曾導致暗色下選單 / 表格 / 時間軸文字沿用明色值而**不可見**（黑底黑字）。詳見 [暗色模式的編譯期烤死陷阱](/theme/dark-mode#編譯期烤死陷阱)。

**注意**：曾經有過一次誤報修復——verify:styles 索引錯位誤報 `no-fallback` 豁免行（提交 `791ff32`）。如果失敗資訊看起來不合理（被豁免的行還報錯），先確認是不是這個已知問題。

## verify:theme —— AA 對比度門禁

```bash
pnpm build          # ← 必須先跑，讀 es/ 產物
pnpm verify:theme
```

腳本：`scripts/verify-theme-contrast.mjs`。

**查什麼**：五個內建主題（及其暗色變體）中，所有「文字 / 背景」配對的 WCAG 對比度 ≥ **4.5:1**（AA 級）。

**為什麼必須讀 es/ 產物**：預設主題的 vars 在構建後才是最終形態（`buildPresetDarkVars` 的推導結果也在產物裡）。

**典型失敗**：

- 新預設的淺主色沒給 `--lh-color-on-primary`（白字在淺主色上只有 3.x:1）
- 選取態文字色（`--lh-selected-color`）在懸停底色上對比度不足

**修法**：調深 / 調淺相關色值，直到對比度達標。`getContrastRatio()` 與 `getRelativeLuminance()`（`src/theme/themes/index.ts` 匯出）可以在本地算，不必每次都跑全量門禁。

**CI 不跑這項**——它需要先 build，且算力不小。本地發版前手動把守。

## verify:versions —— 版本一致性

```bash
pnpm verify:versions
```

腳本：`scripts/check-version-sync.mjs`。

**查什麼**：lh-ui-plus / lh-ui-vue2 的 `package.json` 裡 `@lh-ui/share` 的依賴範圍**覆蓋 share 當前版本**。

**當前狀態**：share 是 `0.3.0` 時通過。**發 0.4.0 之後會失敗**——因為兩個 UI 庫的依賴範圍還是 `^0.3.0`。這是**預期行為**：按 [紅線 5](/development/contribution#六條紅線)（share 先發版，UI 庫隨其後），發版後去兩兄弟倉各自 `pnpm up @lh-ui/share@0.4.0` 並回歸。

## lint 與 typecheck

| 命令 | 掃描範圍 |
| --- | --- |
| `pnpm lint` | `src` / `tests` / `scripts` / `vite.config.ts` / `vitest.config.ts` |
| `pnpm typecheck` | `src/**/*`（`tsconfig.json` 的 include） |

**`docs/` 不在掃描範圍內**——文件站是獨立的 Astro 專案，品質由 `pnpm docs:build` 把關。同理 `styles/` 不在 typecheck 範圍（SCSS 由 verify:styles 管）。

**lint 的框架依賴門禁**：CI 會 grep `src/` 裡是否出現 `import 'vue'` / `import 'react'` / `@dcloudio/*`——這是 [紅線 1](/development/contribution#六條紅線)，core 必須框架無關。

## 測試

```bash
pnpm test
```

`tests/unit/` 是 **core 單測唯一一份**（紅線 3）：三庫共享結果，UI 庫不得複製。純函式測試不需要渲染元件——造 rect 字面量、斷言輸出，四端共享同一份斷言。

關鍵測試檔案：

| 檔案 | 覆蓋 |
| --- | --- |
| `theme.spec.ts` | 預設一致性（JS vars 與 SCSS 變數雙源同步） |
| `core/*.spec.ts` | 各 core 元件邏輯 |
| `shared/*.spec.ts` | 共享核心演算法（popper / keyboard / virtual 等） |

## 驗證全跑一遍

發版前的完整清單：

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build                    # 注意 sync:exports 會改 package.json
pnpm verify:dts
pnpm verify:styles            # 六項
pnpm verify:theme             # 需先 build
pnpm verify:versions          # 發版後會轉下游處理
pnpm docs:build               # 文件站
```

`prepublishOnly`（`pnpm release` 會觸發）只含 build + verify:dts + verify:styles。所以 **test / lint / typecheck / verify:theme 必須顯式手動跑**。

## 相關文件

- [命令一覽](/development/commands)
- [構建腳本](/development/scripts)
- [發布流程](/development/release)
- [暗色模式](/theme/dark-mode)
- [樣式源](/reference/styles)
