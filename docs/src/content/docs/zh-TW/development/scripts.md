---
title: 構建與工具腳本
description: 'scripts/ 下 13 個 mjs 腳本的職責：build-styles / sync-exports / verify-* / gen-docs-data / push-release'
---

`scripts/` 是構建與驗證的引擎層。`package.json` 的命令大多是對這些腳本的薄封裝，直接跑腳本可以加參數除錯。

## 腳本總覽

| 腳本 | 命令封裝 | 職責 |
| --- | --- | --- |
| `build-styles.mjs` | `pnpm build:styles` | 編譯 share scss → `dist/theme/` + `dist/styles/` |
| `sync-exports.mjs` | `pnpm sync:exports`（含於 `pnpm build`） | 按原始碼目錄結構生成 `package.json` 的 exports |
| `verify-dts.mjs` | `pnpm verify:dts` | 產物 dts 與原始碼類型一致 |
| `verify-styles.mjs` | `pnpm verify:styles` | scss 六項驗證（見 [驗證體系](/development/verification)） |
| `verify-theme-contrast.mjs` | `pnpm verify:theme` | 主題 AA 4.5:1 對比度門禁 |
| `check-version-sync.mjs` | `pnpm verify:versions` | 各 UI 庫依賴範圍覆蓋 share 當前版本 |
| `gen-docs-data.mjs` | `pnpm docs:data` | 解析令牌 / 圖示 / 類別名 → `docs/src/data/*.json` |
| `push-release.mjs` | `pnpm release:push` | 推 master + tag 到 GitHub，觸發留檔 |
| `release-notes.mjs` | — | 生成發行版說明 |
| `extract-from-plus.mjs` | `pnpm extract` | **一次性腳本**：從 plus 倉提取共享層（歷史用） |
| `normalize-styles.mjs` | — | 樣式規範化（歷史一次性） |
| `patch-var-fallbacks.mjs` | — | 批量補 `var()` 回落值（歷史一次性） |

## sync-exports.mjs —— exports 鍵的生成器

**這是最容易出問題的一個腳本**。

`@lh-ui/share` 的 `package.json` 有 77 個 exports 鍵（`./core/button/*` 這類子路徑），全部由這個腳本按 `src/` 與 `styles/` 的目錄結構**掃描生成**。

**流程**：`vite build` 產物落盤 → `sync:exports` 掃描 `es/` 目錄結構 → 重寫 `package.json` 的 `exports` / `files` 欄位。

**為什麼重要**：

- 新增 `src/core/foo/bar.ts`，dev 期（走原始碼 alias）立即可用，但 **npm 側沒有對應 exports 鍵**——下游 `pnpm up` 後 MODULE_NOT_FOUND。
- **發版前必須跑完整 `pnpm build`**（含 sync:exports），不能只跑 `build:dts`。

**注意它會改 `package.json`**：跑完後 `git diff` 會看到 exports 變化，這是正常的，要提交。

## build-styles.mjs —— 樣式產物

把 `styles/` 的 SCSS 源編譯成 css：

```
dist/
├── theme/
│   ├── index.css          # 主題令牌（明色）
│   └── index-dark.css     # 暗色覆蓋
└── styles/
    └── index.css          # 全量聚合（令牌 + 全部元件）
```

**同時生成 `styles/index.scss` 全量聚合檔案**（按 `styles/*/index.scss` 掃描），`verify:styles` 第 4 項驗證它的一致性——**不要手改這個檔案**。

各 UI 庫有自己的 `build-styles.mjs`（plus 版按 `packages/components` 掃描，vue2 版按 `src/components` 掃描），share 無樣式源的元件會被**靜默跳過**——所以 share 裡必須有對應 scss，否則該元件在某一端無樣式。

## gen-docs-data.mjs —— 文件資料生成

```bash
pnpm docs:data
```

解析四個源 → `docs/src/data/*.json`：

| 輸出 | 源 | 內容 |
| --- | --- | --- |
| `tokens.json` | `var.scss` + `var-dark.scss` + `variables.scss` | 185 明色 + 118 暗色 + 183 SCSS 變數，按語義域分組 |
| `icons.json` | `src/.../icon/svgs.ts` | 37 個內建圖示 |
| `classes.json` | `styles/*/index.scss` | 58 份元件 BEM 類別名清單 |

**帶數量斷言**：解析數與預期（185 / 118 / 183 / 37 / 58）不符直接拋錯。這是「令牌被誤刪 / 元件被誤刪」的第一道防線。

**冪等**：隨便跑，只在內容變化時改 json。改了令牌或類別名後跑一次重新整理文件資料。

## push-release.mjs —— 發版推送

```bash
pnpm release:push
```

在 `pnpm release`（npm 發布 + 本地建 tag）之後跑：

1. 推 master 到 `github-lhgb`
2. 推本次版本 tag 到 `github-lhgb`
3. 觸發 `.github/workflows/release.yml`：從 npm 拉已發布的 tarball → 建立 GitHub Release（掛 `lh-ui-share-<version>.tgz`）→ 推 tag 到 Gitee 並調 Gitee API 建發行版

**只推 GitHub，不要手動推 tag 到 Gitee**——Gitee 的 tag / 發行版由 release.yml 統一接管，雙寫會衝突。

## verify-theme-contrast.mjs —— 對比度門禁

讀 `es/` 產物（所以**必須先 `pnpm build`**），用 `src/theme/themes/index.ts` 匯出的 `getRelativeLuminance` / `getContrastRatio` 算每對「文字 / 背景」的 WCAG 對比度，低於 4.5:1 即失敗。

除錯單個配色可以直接在 node 裡調這兩個函式，不必跑全量。

## 歷史一次性腳本

| 腳本 | 說明 |
| --- | --- |
| `extract-from-plus.mjs` | share 倉初創時從 lh-ui-plus 提取共享層。**留作記錄，不再執行**——share 已是唯一源（紅線 2）。 |
| `normalize-styles.mjs` | 早期樣式規範化（統一令牌引用方式）。已完成使命。 |
| `patch-var-fallbacks.mjs` | 批量給 `var(--lh-*)` 補回落值。這是 verify:styles 第 2 項（var fallback）上線前的遷移工具——**新增程式碼必須手寫 fallback，不要指望這個腳本兜底**。 |

## docs 站不是 npm 產物

`package.json` 的 `files: ["es", "lib", "dist", "styles"]` **不含 `docs/`**。文件站透過 `pnpm docs:build` 構建到 `docs/dist/`，手動部署到家族 nginx（契約在 `lh-ui/docs/部署/nginx-lhui.conf.md`，另一倉）。詳見 [發布流程](/development/release)。

## 相關文件

- [命令一覽](/development/commands) —— 每個 script 對應的 pnpm 命令
- [驗證體系](/development/verification) —— verify 腳本各自的檢查邏輯
- [發布流程](/development/release) —— push-release 與 CI 留檔
- [包入口與子路徑](/guide/exports) —— sync-exports 生成的 77 鍵
