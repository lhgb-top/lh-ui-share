---
title: 命令一覽
description: 'pnpm build / build:styles / build:dts / test / lint / typecheck / verify:* / changeset / release 全表'
---

所有開發任務都透過根 `package.json` 的 scripts 暴露，套件管理器固定 `pnpm`。

## 構建

| 任務 | 命令 | 產物 / 作用 |
| --- | --- | --- |
| 構建 | `pnpm build` | `es/` + `lib/`（preserveModules 鏡像結構）+ 樣式 + dts + `sync:exports` |
| 樣式產物 | `pnpm build:styles` | `dist/theme/`（明暗主題 css）+ `dist/styles/`（全量聚合） |
| dts | `pnpm build:dts` | `tsc` 鏡像直出的類型宣告 |

`pnpm build` 是完整管線，內部已包含 `build:styles` 與 `build:dts`。**注意**：`sync:exports` 會**重寫 `package.json` 的 exports 欄位**——改完原始碼目錄結構後必須跑一次完整 build，否則下游 `pnpm up` 後 MODULE_NOT_FOUND。

## 測試與品質

| 任務 | 命令 | 作用 |
| --- | --- | --- |
| 單測 | `pnpm test` | vitest，`tests/unit/`（**core 單測唯一一份**，三庫共享結果） |
| Lint | `pnpm lint` | eslint，只掃 `src` / `tests` / `scripts` / `vite.config.ts` / `vitest.config.ts` |
| 類型 | `pnpm typecheck` | tsc，include 只有 `src/**/*` |

## 驗證

| 任務 | 命令 | 作用 |
| --- | --- | --- |
| dts 驗證 | `pnpm verify:dts` | 驗證產物 dts 與原始碼類型一致 |
| scss 驗證 | `pnpm verify:styles` | 六項（見下） |
| 主題對比度 | `pnpm verify:theme` | AA 4.5:1 門禁，讀 `es/` 產物（**需先 `pnpm build`**） |
| 版本一致性 | `pnpm verify:versions` | 各 UI 庫依賴範圍覆蓋 share 當前版本 |

### verify:styles 六項

1. **EP 調色盤** —— 顏色值的色階 / 語義合規
2. **var fallback** —— 元件裡 `var(--lh-*)` 必須帶回落值
3. **@use 令牌** —— 元件 scss 必須透過 `@use` 引令牌，不引用 hex 字面量
4. **聚合一致** —— `styles/index.scss` 與元件目錄掃描結果一致（防漏聚合）
5. **過渡類別名單源** —— 禁止裸寫 `-enter-from` / `-leave-from`，一律用 [transition mixin](/reference/transition-mixins)
6. **暗色可達性** —— 明色烤死的令牌在 `var-dark.scss` 有覆蓋（詳見 [暗色模式](/theme/dark-mode)）

## 發版

| 任務 | 命令 | 作用 |
| --- | --- | --- |
| 寫變更 | `pnpm changeset` | 互動式生成 `.changeset/*.md` |
| 消費 changeset | `pnpm changeset:version` | 改版本號、寫 CHANGELOG、刪除待發布 changeset |
| 發布 | `pnpm release` | `changeset publish`：先 `prepublishOnly`（build + verify:dts + verify:styles）再發 npm，再本地建 tag |
| 推送留檔 | `pnpm release:push` | 推 master + 本次 tag 到 GitHub，觸發自動留檔 |

完整發版流程見 [發布流程](/development/release)。

## 文件站

| 任務 | 命令 | 作用 |
| --- | --- | --- |
| 資料生成 | `pnpm docs:data` | `scripts/gen-docs-data.mjs` 解析令牌 / 圖示 / 類別名 → `docs/src/data/*.json` |
| 本地開發 | `pnpm docs:dev` | Astro dev server（`http://localhost:5180/lhui/share/`） |
| 構建 | `pnpm docs:build` | 生產構建到 `docs/dist/` |
| 預覽 | `pnpm docs:preview` | 預覽構建產物 |

**注意**：`pnpm docs:data` 是冪等的，帶數量斷言（明色 185 / 暗色 118 / SCSS 183 / 圖示 37 / 類別名 58 份），解析數對不上直接報錯。

## 典型工作流

### 改一個 core 元件

```bash
pnpm test                                    # 跑單測（先寫測試）
pnpm lint && pnpm typecheck                  # 品質
pnpm build                                   # 完整構建（含 sync:exports）
pnpm verify:dts && pnpm verify:styles        # 產物與樣式驗證
pnpm changeset                               # 寫變更
git add -A && git commit                     # 提交（後續合入 master）
```

### 改樣式

```bash
# 只改 styles/，不用跑 build 的 js 部分
pnpm verify:styles                           # 六項驗證
pnpm build:styles                            # 生成 dist 產物
pnpm docs:data                               # 令牌表資料刷新（令牌變了才需要）
```

### 加一個新元件

```bash
# 1. 三件套
#    src/core/<name>/{logic,types,index}.ts
#    tests/unit/core/<name>.spec.ts
#    styles/<name>/index.scss
# 2. src/core/index.ts 加匯出
# 3. 驗證
pnpm test && pnpm lint && pnpm typecheck
pnpm build                                   # sync:exports 生成新的 exports 鍵
pnpm verify:dts && pnpm verify:styles
# 4. changeset（minor：新增元件）
pnpm changeset
```

**關鍵**：`sync:exports` 未跑則 npm 側沒有對應 exports 鍵——發版前務必走完整 `pnpm build`。新增 `styles/<name>/index.scss` 後兩端構建腳本會自動覆蓋（按各自元件目錄掃描），但 share 裡**必須**有對應 scss，否則該元件在某一端無樣式產物（靜默跳過）。

## CI 跑什麼

`.github/workflows/ci.yml` 在每次 PR / push 到 master 時跑：install → lint → typecheck → test → build → verify:dts → verify:styles（+ E 批後的 `docs:build`）。

**不跑的**：`verify:theme`（對比度門禁，本地手動把守）、`verify:versions`（版本一致性，發版後下游處理）。

## 依賴與工具鏈

- 套件管理器：`pnpm`（lockfile 必須提交）
- 構建：`vite` + `rollup`（preserveModules）
- 類型：`tsc`（`tsconfig.build.json` 鏡像直出 dts）
- 測試：`vitest`
- 樣式：`sass`（`api: 'modern'`）
- changeset：`@changesets/cli`
- 文件站：`astro` + `@astrojs/starlight`

## 相關文件

- [驗證體系](/development/verification) —— 六項驗證各自在查什麼
- [構建腳本](/development/scripts) —— `build-styles.mjs` / `gen-docs-data.mjs` 等
- [發布流程](/development/release) —— 六步發版
- [貢獻指南](/development/contribution) —— 紅線與提 PR 前的清單
